// controllers/authController.js
import { prismaClient } from "../routes/utils/prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import axios from "axios";
import crypto from "crypto";

const prisma = prismaClient();

// Simple in-memory state store for OAuth state values (ttl-based)
const oauthStates = new Map();
const OAUTH_STATE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function storeState(state) {
  oauthStates.set(state, Date.now());
}

function verifyAndDeleteState(state) {
  const ts = oauthStates.get(state);
  if (!ts) return false;
  if (Date.now() - ts > OAUTH_STATE_TTL_MS) {
    oauthStates.delete(state);
    return false;
  }
  oauthStates.delete(state);
  return true;
}

// Redirect to GitHub authorization URL
export const redirectToGitHub = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_CALLBACK_URL;
  if (!clientId || !redirectUri) {
    return res.status(500).json({ message: "GitHub OAuth not configured on server" });
  }

  const state = crypto.randomBytes(12).toString("hex");
  storeState(state);

  const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20user:email&state=${encodeURIComponent(
    state
  )}`;

  return res.redirect(url);
};

// Handle GitHub callback, exchange code for token, fetch profile, create/find user, and redirect to client with JWT
export const handleGitHubCallback = async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).json({ message: "Missing code in callback" });
  if (!state || !verifyAndDeleteState(state)) {
    console.warn("GitHub OAuth state missing or invalid", state);
    // Continue but warn — better to reject in production
    // return res.status(400).json({ message: "Invalid OAuth state" });
  }

  try {
    const tokenResp = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResp.data?.access_token;
    if (!accessToken) {
      console.error("GitHub token exchange failed:", tokenResp.data);
      const clientErrRedirect = `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=oauth_failed`;
      return res.redirect(clientErrRedirect);
    }

    // Fetch profile
    const userResp = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    });
    const emailsResp = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    });

    const profile = userResp.data || {};
    const emails = Array.isArray(emailsResp.data) ? emailsResp.data : [];
    const primaryEmailObj = emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified) || emails[0];
    const email = primaryEmailObj?.email || profile.email;

    // Find or create user
    let user = null;
    if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    // If user not found by email, try by username/login
    if (!user && profile.login) {
      user = await prisma.user.findUnique({ where: { username: profile.login } });
    }

    if (!user) {
      // Try to create with available info. If username conflicts, append suffix.
      let username = profile.login || (email ? email.split("@")[0] : `github_${Math.random().toString(36).substring(2, 8)}`);
      // Ensure username uniqueness
      let attempt = 0;
      while (attempt < 5) {
        try {
          user = await prisma.user.create({
            data: {
              username,
              email: email || null,
              password: "",
              avatar: profile.avatar_url || null,
              reputation: 0,
              level: "Beginner",
              canPostPublic: false,
              role: "user",
            },
          });
          break;
        } catch (err) {
          // If username unique constraint failed, append suffix and retry
          attempt += 1;
          username = `${username}_${Math.floor(Math.random() * 9000) + 1000}`;
        }
      }
    }

    if (!user) {
      console.error("Failed to create/find user for GitHub profile", profile);
      const clientErrRedirect = `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=oauth_failed`;
      return res.redirect(clientErrRedirect);
    }

    // Sign JWT
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not set; cannot sign token");
      const clientErrRedirect = `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=server_misconfigured`;
      return res.redirect(clientErrRedirect);
    }

    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "24h" });

    const clientRedirect = `${process.env.CLIENT_URL || "http://localhost:5173"}/login?token=${encodeURIComponent(token)}&username=${encodeURIComponent(user.username)}`;
    return res.redirect(clientRedirect);
  } catch (err) {
    console.error("GitHub OAuth callback error:", err?.response?.data || err.message || err);
    const clientErrRedirect = `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=oauth_failed`;
    return res.redirect(clientErrRedirect);
  }
};

async function registerUser(req, res) {
  try {
    console.log(' REGISTER - Request received:', req.body);
    
    const { username, password, email } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(' REGISTER - Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    console.log(' REGISTER - Checking existing users...');
    
    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({ 
      where: { username } 
    });
    if (existingUsername) {
      console.log(' REGISTER - Username already exists:', username);
      return res.status(409).json({ message: "Username already exists" });
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({ 
      where: { email } 
    });
    if (existingEmail) {
      console.log(' REGISTER - Email already exists:', email);
      return res.status(409).json({ message: "Email already exists" });
    }

    console.log(' REGISTER - Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(' REGISTER - Creating user...');
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        reputation: 0,
        level: "Beginner",
        canPostPublic: false,
        role: "user",
      },
    });

    console.log(' REGISTER - User created successfully:', user.id);

    res.status(201).json({ 
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (err) {
    console.error("REGISTER - Critical Error:", err);
    console.error("Error details:", {
      name: err.name,
      code: err.code,
      message: err.message,
      stack: err.stack
    });
    
    res.status(500).json({ 
      message: "Internal server error during registration",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

async function loginUser(req, res) {
  try {
    console.log('🔐 LOGIN - Request received:', { email: req.body.email });
    
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      console.log(' LOGIN - Missing email or password');
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error(' LOGIN - CRITICAL: JWT_SECRET is not defined!');
      return res.status(500).json({ message: "Server configuration error" });
    }

    console.log(' LOGIN - Querying database for user:', email);
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        reputation: true,
        level: true,
        role: true,
        avatar: true,
      }
    });
    
    if (!user) {
      console.log(' LOGIN - User not found:', email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log(' LOGIN - User found:', user.id);
    console.log(' LOGIN - Comparing passwords...');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(' LOGIN - Invalid password for user:', email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log(' LOGIN - Password valid, generating token...');

    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "24h" }
    );

    console.log(' LOGIN - Token generated successfully');

    const { password: _, ...userWithoutPassword } = user;

    console.log(' LOGIN - Successful for user:', user.username);

    res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error(" LOGIN - Critical Error:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    
    res.status(500).json({ 
      message: "Internal server error during login",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

const getMe = async (req, res) => {
  try {
    console.log('👤 GETME - Request received, user:', req.user);
    
    const userId = req.user?.id || req.userId;
    
    if (!userId) {
      console.log(' GETME - No user ID in request');
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log('👤 GETME - User ID:', userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        reputation: true,
        level: true,
        role: true,
        avatar: true,
        canPostPublic: true,
        createdAt: true,
      }
    });

    if (!user) {
      console.log(' GETME - User not found in database:', userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(' GETME - Successful for user:', user.username);

    res.status(200).json({ user });
  } catch (err) {
    console.error(" GETME - Critical Error:", err);
    console.error("Error details:", {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export default {
  registerUser,
  loginUser,
  getMe,
};
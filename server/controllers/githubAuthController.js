// server/controllers/githubAuthController.js
import axios from "axios";
import jwt from "jsonwebtoken";
import { prismaClient } from "../utils/prismaClient.js";

const prisma = prismaClient();

export const githubAuth = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || "http://localhost:3000/api/auth/github/callback";
  const scope = "user:email";
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  
  res.redirect(githubAuthUrl);
};

export const githubCallback = async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ message: "Authorization code not provided" });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI || "http://localhost:3000/api/auth/github/callback"
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return res.status(400).json({ message: "Failed to get access token" });
    }

    // Get user data from GitHub
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { id: githubId, login: username, avatar_url, email } = userResponse.data;

    // Get user email if not public
    let userEmail = email;
    if (!userEmail) {
      const emailResponse = await axios.get("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      
      const primaryEmail = emailResponse.data.find(email => email.primary);
      userEmail = primaryEmail ? primaryEmail.email : emailResponse.data[0].email;
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { githubId: githubId.toString() },
          { email: userEmail }
        ]
      }
    });

    if (!user) {
      // Create new user with GitHub data
      user = await prisma.user.create({
        data: {
          githubId: githubId.toString(),
          username: `github_${username}`,
          email: userEmail,
          avatar: avatar_url,
          password: "oauth_user", // Dummy password for OAuth users
          reputation: 0,
          level: "Beginner",
          canPostPublic: false,
          role: "user"
        }
      });
    } else if (!user.githubId) {
      // Link GitHub account to existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: { githubId: githubId.toString(), avatar: avatar_url }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || "24h" }
    );

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/oauth-success?token=${token}&username=${user.username}`);

  } catch (error) {
    console.error("GitHub OAuth error:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/oauth-error?message=Authentication failed`);
  }
};
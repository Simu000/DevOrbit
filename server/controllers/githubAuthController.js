// server/controllers/githubAuthController.js
import axios from "axios";
import jwt from "jsonwebtoken";
import { prismaClient } from "../utils/prismaClient.js";

const prisma = prismaClient();

export const githubAuth = (req, res) => {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      process.env.GITHUB_REDIRECT_URI || "http://localhost:3000/api/auth/github/callback"
    );
    const scope = "user:email";
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    console.log('Redirecting to GitHub OAuth:', githubAuthUrl);
    res.redirect(githubAuthUrl);
  } catch (error) {
    console.error('GitHub auth initiation error:', error);
    res.status(500).json({ message: "OAuth initiation failed" });
  }
};

export const githubCallback = async (req, res) => {
  const { code, error: githubError } = req.query;
  
  if (githubError) {
    console.error('GitHub OAuth error:', githubError);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-callback?error=github_oauth_denied`);
  }

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-callback?error=no_authorization_code`);
  }

  try {
    console.log('Exchanging code for access token...');
    
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
          "Content-Type": "application/json",
        },
      }
    );

    console.log('Token response:', tokenResponse.data);

    const { access_token, error: tokenError } = tokenResponse.data;

    if (tokenError) {
      console.error('Token exchange error:', tokenError);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-callback?error=token_exchange_failed`);
    }

    if (!access_token) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-callback?error=no_access_token`);
    }

    // Get user data from GitHub
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const { id: githubId, login: username, avatar_url, email } = userResponse.data;

    console.log('GitHub user data:', { githubId, username, email });

    // Get user email if not public
    let userEmail = email;
    if (!userEmail) {
      console.log('Fetching user emails...');
      const emailResponse = await axios.get("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      
      const primaryEmail = emailResponse.data.find(email => email.primary && email.verified);
      userEmail = primaryEmail ? primaryEmail.email : emailResponse.data[0]?.email;
    }

    if (!userEmail) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-callback?error=no_verified_email`);
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
      console.log('Creating new user...');
      user = await prisma.user.create({
        data: {
          githubId: githubId.toString(),
          username: `github_${username}`,
          email: userEmail,
          avatar: avatar_url,
          password: "oauth_user",
          reputation: 0,
          level: "Beginner",
          canPostPublic: false,
          role: "user"
        }
      });
    } else if (!user.githubId) {
      console.log('Linking GitHub account to existing user...');
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          githubId: githubId.toString(), 
          avatar: avatar_url 
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRY || "24h" }
    );

    console.log('OAuth successful, redirecting to frontend...');
    
    // Redirect to oauth-callback page with token
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/oauth-callback?token=${token}&username=${encodeURIComponent(user.username)}`);

  } catch (error) {
    console.error("GitHub OAuth error:", error.response?.data || error.message);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/oauth-callback?error=authentication_failed`);
  }
};
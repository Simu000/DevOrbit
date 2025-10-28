import { prismaClient } from "../utils/prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

const prisma = prismaClient();

async function registerUser(req, res) {
  const { username, password, email } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('📝 Attempting to register user:', { username, email });

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({ 
      where: { username } 
    });
    if (existingUsername) {
      console.log('❌ Username already exists:', username);
      return res.status(409).json({ message: "Username already exists" });
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({ 
      where: { email } 
    });
    if (existingEmail) {
      console.log('❌ Email already exists:', email);
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    console.log('✅ User registered successfully:', user.id);

    res.status(201).json({ 
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (err) {
    console.error("❌ Register Error:", err);
    console.error("Error details:", {
      code: err.code,
      meta: err.meta,
      message: err.message,
      stack: err.stack?.split('\n').slice(0, 3).join('\n')
    });
    
    // Handle Prisma unique constraint errors
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'field';
      return res.status(409).json({ 
        message: `This ${field} is already registered` 
      });
    }
    
    res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('❌ CRITICAL: JWT_SECRET is not defined in environment variables!');
      return res.status(500).json({ message: "Server configuration error" });
    }

    console.log('📊 Querying database for user...');
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
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log('✅ User found:', { id: user.id, username: user.username });
    console.log('🔑 Comparing passwords...');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log('✅ Password valid, generating token...');

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "24h" }
    );

    console.log('✅ Token generated successfully');

    // Don't send password to frontend
    const { password: _, ...userWithoutPassword } = user;

    console.log('✅ Login successful for user:', user.username);

    res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack?.split('\n').slice(0, 5).join('\n')
    });
    
    res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

const getMe = async (req, res) => {
  try {
    console.log('👤 GetMe request for user ID:', req.user?.id);

    if (!req.user || !req.user.id) {
      console.log('❌ No user ID in request');
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        reputation: true,
        level: true,
        role: true,
        avatar: true,
        canPostPublic: true,
      }
    });

    if (!user) {
      console.log('❌ User not found in database:', req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('✅ GetMe successful for user:', user.username);

    res.status(200).json({ user });
  } catch (err) {
    console.error("❌ Get Me Error:", err);
    console.error("Error details:", {
      message: err.message,
      stack: err.stack?.split('\n').slice(0, 3).join('\n')
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
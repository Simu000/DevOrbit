// controllers/authController.js
import { prismaClient } from "../utils/prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

const prisma = prismaClient();

async function registerUser(req, res) {
  try {
    console.log('📝 REGISTER - Request received:', req.body);
    
    const { username, password, email } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log('❌ REGISTER - Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    console.log('🔍 REGISTER - Checking existing users...');
    
    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({ 
      where: { username } 
    });
    if (existingUsername) {
      console.log('❌ REGISTER - Username already exists:', username);
      return res.status(409).json({ message: "Username already exists" });
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({ 
      where: { email } 
    });
    if (existingEmail) {
      console.log('❌ REGISTER - Email already exists:', email);
      return res.status(409).json({ message: "Email already exists" });
    }

    console.log('🔑 REGISTER - Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('💾 REGISTER - Creating user...');
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

    console.log('✅ REGISTER - User created successfully:', user.id);

    res.status(201).json({ 
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (err) {
    console.error("❌ REGISTER - Critical Error:", err);
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
      console.log('❌ LOGIN - Missing email or password');
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('❌ LOGIN - CRITICAL: JWT_SECRET is not defined!');
      return res.status(500).json({ message: "Server configuration error" });
    }

    console.log('📊 LOGIN - Querying database for user:', email);
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
      console.log('❌ LOGIN - User not found:', email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log('✅ LOGIN - User found:', user.id);
    console.log('🔑 LOGIN - Comparing passwords...');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ LOGIN - Invalid password for user:', email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log('✅ LOGIN - Password valid, generating token...');

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

    console.log('✅ LOGIN - Token generated successfully');

    // Don't send password to frontend
    const { password: _, ...userWithoutPassword } = user;

    console.log('🎉 LOGIN - Successful for user:', user.username);

    res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("❌ LOGIN - Critical Error:", err);
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
      console.log('❌ GETME - No user ID in request');
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
      console.log('❌ GETME - User not found in database:', userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('✅ GETME - Successful for user:', user.username);

    res.status(200).json({ user });
  } catch (err) {
    console.error("❌ GETME - Critical Error:", err);
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
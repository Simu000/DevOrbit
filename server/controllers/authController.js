import { prismaClient } from "../utils/prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

const prisma = prismaClient();

async function registerUser(req, res) {
  const { username, password, email } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({ 
      where: { username } 
    });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({ 
      where: { email } 
    });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        // NEW: Initialize reputation fields
        reputation: 0,
        level: "Beginner",
        canPostPublic: false,
        role: "user",
      },
    });

    res.status(201).json({ 
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (err) {
    console.error("Register Error:", err);
    
    // Handle Prisma unique constraint errors
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'field';
      return res.status(409).json({ 
        message: `This ${field} is already registered` 
      });
    }
    
    res.status(500).json({ message: "Internal server error" });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

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
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: user.role // Include role in token for authorization
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || "24h" }
    );

    // Don't send password to frontend
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

const getMe = async (req, res) => {
  try {
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
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Get Me Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  registerUser,
  loginUser,
  getMe,
};
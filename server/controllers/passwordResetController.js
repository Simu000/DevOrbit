// server/controllers/passwordResetController.js
import { prismaClient } from "../utils/prismaClient.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { validationResult } from "express-validator";

const prisma = prismaClient();

// Mock email service (replace with real email service)
const sendResetEmail = async (email, resetToken) => {
  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
  
  console.log(`Password reset email sent to: ${email}`);
  console.log(`Reset URL: ${resetUrl}`);
  
  // In production, use: nodemailer, SendGrid, etc.
  return true;
};

export const requestPasswordReset = async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists or not
      return res.json({ 
        message: "If an account with that email exists, a password reset link has been sent." 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Send reset email
    await sendResetEmail(email, resetToken);

    res.json({ 
      message: "If an account with that email exists, a password reset link has been sent." 
    });

  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired reset token" 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ 
      message: "Password reset successfully. You can now login with your new password." 
    });

  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyResetToken = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        email: true
      }
    });

    if (!user) {
      return res.status(400).json({ 
        valid: false,
        message: "Invalid or expired reset token" 
      });
    }

    res.json({ 
      valid: true,
      message: "Reset token is valid" 
    });

  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ 
      valid: false,
      message: "Server error" 
    });
  }
};
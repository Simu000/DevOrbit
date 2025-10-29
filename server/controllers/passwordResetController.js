import { prismaClient } from "../routes/utils/prismaClient.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { validationResult } from "express-validator";
import { sendResetEmail } from "../routes/utils/emailService.js"; // Import real email service

const prisma = prismaClient();

export const requestPasswordReset = async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    console.log(` Password reset requested for: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      console.log(`   User not found, but returning success for security`);
      return res.json({ 
        message: "If an account with that email exists, a password reset link has been sent." 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    console.log(`   Generated reset token for user: ${user.username}`);

    // Save reset token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Send REAL reset email
    const emailSent = await sendResetEmail(email, resetToken);

    if (!emailSent) {
      return res.status(500).json({ 
        message: "Failed to send reset email. Please try again." 
      });
    }

    console.log(`   Reset process completed for: ${email}`);

    res.json({ 
      message: "If an account with that email exists, a password reset link has been sent." 
    });

  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ message: "Server error while processing reset request" });
  }
};

export const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, password } = req.body;

  try {
    console.log(` Processing password reset with token`);

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      console.log(`    Invalid or expired reset token`);
      return res.status(400).json({ 
        message: "Invalid or expired reset token" 
      });
    }

    console.log(`    Valid token found for user: ${user.username}`);

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

    console.log(`   Password updated successfully for user: ${user.username}`);

    res.json({ 
      message: "Password reset successfully. You can now login with your new password." 
    });

  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Server error while resetting password" });
  }
};

export const verifyResetToken = async (req, res) => {
  const { token } = req.params;

  try {
    console.log(`Verifying reset token: ${token}`);

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        email: true,
        username: true
      }
    });

    if (!user) {
      console.log(`    Token invalid or expired`);
      return res.status(400).json({ 
        valid: false,
        message: "Invalid or expired reset token" 
      });
    }

    console.log(`   Token valid for user: ${user.username}`);

    res.json({ 
      valid: true,
      message: "Reset token is valid" 
    });

  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ 
      valid: false,
      message: "Server error while verifying token" 
    });
  }
};
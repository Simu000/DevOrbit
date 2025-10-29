// server/routes/passwordResetRoutes.js
import express from "express";
import { body } from "express-validator";
import {
  requestPasswordReset,
  resetPassword,
  verifyResetToken
} from "../controllers/passwordResetController.js";

const router = express.Router();

// Request password reset
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),
  ],
  requestPasswordReset
);

// Reset password with token
router.post(
  "/reset-password",
  [
    body("token")
      .notEmpty()
      .withMessage("Reset token is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
  ],
  resetPassword
);

// Verify reset token
router.get("/verify-reset-token/:token", verifyResetToken);

export default router;
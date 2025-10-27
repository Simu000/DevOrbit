// server/routes/passwordResetRoutes.js
import express from "express";
import { body } from "express-validator";
import {
  requestPasswordReset,
  resetPassword,
  verifyResetToken
} from "../controllers/passwordResetController.js";

const router = express.Router();

router.post(
  "/forgot-password",
  [
    body("email").isEmail().withMessage("Valid email is required"),
  ],
  requestPasswordReset
);

router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .matches(/\d/)
      .withMessage("Password must contain a number")
      .matches(/[!@#$%^&*]/)
      .withMessage("Password must contain a symbol"),
  ],
  resetPassword
);

router.get("/verify-reset-token/:token", verifyResetToken);

export default router;
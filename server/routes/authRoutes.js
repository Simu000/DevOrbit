import express from "express";
import { body } from "express-validator";
import authController from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { githubAuth, githubCallback } from "../controllers/githubAuthController.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .matches(/\d/)
      .withMessage("Password must contain a number")
      .matches(/[!@#$%^&*]/)
      .withMessage("Password must contain a symbol"),
  ],
  authController.registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authController.loginUser
);

router.get("/me", verifyToken, authController.getMe);
router.get("/github", githubAuth);
router.get("/github/callback", githubCallback);

export default router;

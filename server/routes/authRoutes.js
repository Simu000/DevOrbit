// routes/authRoutes.js
import express from "express";
import { body } from "express-validator";
import authController from "../controllers/authController.js"; // Default import
import { verifyToken } from "../middleware/authMiddleware.js";
import { githubAuth, githubCallback } from '../controllers/githubAuthController.js';

const router = express.Router();

// Add route debugging
router.use((req, res, next) => {
  console.log(`🔍 Auth Route Called: ${req.method} ${req.path}`);
  next();
});

router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
  ],
  authController.registerUser // Access via default export
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authController.loginUser // Access via default export
);

router.get("/me", verifyToken, authController.getMe); // Access via default export

// GitHub OAuth routes
router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);
// Test route to verify auth routes are working
router.get("/test", (req, res) => {
  console.log('Auth test route working');
  res.json({ 
    success: true, 
    message: "Auth routes are working!",
    timestamp: new Date().toISOString()
  });
});

export default router;
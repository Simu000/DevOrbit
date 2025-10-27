import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getUserReputation,
  getLeaderboard,
  getUserActivity,
  getUserBadges,
} from "../controllers/reputationController.js";

const router = express.Router();

// Get current user's reputation stats
router.get("/me", verifyToken, getUserReputation);

// Get specific user's reputation stats
router.get("/user/:id", getUserReputation);

// Get leaderboard
router.get("/leaderboard", getLeaderboard);

// Get user's activity feed
router.get("/activity/:id", getUserActivity);

// Get user's badges
router.get("/badges/:id", getUserBadges);

// Get current user's badges
router.get("/my-badges", verifyToken, getUserBadges);

export default router;
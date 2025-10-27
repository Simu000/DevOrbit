import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  rateTutorial,
  getTutorialRatings,
  getUserRating,
  deleteRating,
} from "../controllers/ratingController.js";

const router = express.Router();

// Rate a tutorial (create or update rating)
router.post("/:id/rate", verifyToken, rateTutorial);

// Get all ratings for a tutorial
router.get("/:id/ratings", getTutorialRatings);

// Get current user's rating for a tutorial
router.get("/:id/my-rating", verifyToken, getUserRating);

// Delete a rating
router.delete("/ratings/:id", verifyToken, deleteRating);

export default router;
import express from "express";
import { body } from "express-validator";
import {
  getTutorials,
  getTutorialById,
  createTutorial,
  updateTutorial,
  deleteTutorial,
} from "../controllers/tutorialController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // for protected routes

const router = express.Router();

router.get("/", getTutorials);
router.get("/:id", getTutorialById);
router.post(
  "/",
  verifyToken, // only logged-in users
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("videoUrl").isURL().withMessage("Valid video URL is required"),
  ],
  createTutorial
);

router.put(
  "/:id",
  verifyToken, // only logged-in users
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("videoUrl").isURL().withMessage("Valid video URL is required"),
  ],
  updateTutorial
);

router.delete("/:id", verifyToken, deleteTutorial); // only logged-in users

export default router;

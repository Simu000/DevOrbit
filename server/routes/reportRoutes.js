import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  reportTutorial,
  getAllReports,
  approveReport,
  rejectReport,
  restoreTutorial,
} from "../controllers/reportController.js";

const router = express.Router();

// Middleware to check if user is admin/moderator
const isAdminOrModerator = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "moderator") {
    return res.status(403).json({ message: "Admin or moderator access required" });
  }
  next();
};

// Report a tutorial
router.post("/:id/report", verifyToken, reportTutorial);

// Get all reports (admin/moderator only)
router.get("/", verifyToken, isAdminOrModerator, getAllReports);

// Approve a report (admin/moderator only)
router.put("/:id/approve", verifyToken, isAdminOrModerator, approveReport);

// Reject a report (admin/moderator only)
router.put("/:id/reject", verifyToken, isAdminOrModerator, rejectReport);

// Restore a hidden tutorial (admin/moderator only)
router.put("/:id/restore", verifyToken, isAdminOrModerator, restoreTutorial);

export default router;
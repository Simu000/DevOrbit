import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/authMiddleware.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is video
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  },
});

// Upload video endpoint
router.post("/video", verifyToken, upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file provided" });
    }

    // Upload to Cloudinary (or your preferred storage)
    const result = await uploadToCloudinary(req.file.buffer, {
      resource_type: "video",
      folder: "devorbit/tutorials",
    });

    res.json({
      message: "Video uploaded successfully",
      videoUrl: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
    });
  } catch (error) {
    console.error("Video upload error:", error);
    res.status(500).json({ 
      message: "Failed to upload video",
      error: error.message 
    });
  }
});

export default router;
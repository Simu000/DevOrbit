import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import tutorialRoutes from "./routes/tutorialRoutes.js";
import journalRoutes from "./routes/journal.js";
import supportRoutes from "./routes/supportRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import { createServer } from 'http';
import { initializeSocket } from './websocket/socketServer.js';
import ratingRoutes from "./routes/ratingRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import reputationRoutes from "./routes/reputationRoutes.js";
import passwordResetRoutes from "./routes/passwordResetRoutes.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server and initialize WebSocket
const server = createServer(app);
initializeSocket(server);

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads/videos'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|webm|ogg|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('video/');

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads/videos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple CORS for development
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (process.env.NODE_ENV === 'development' && req.body) {
    console.log('Body:', req.body);
  }
  console.log('Origin:', req.headers.origin);
  next();
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "DevOrbit Server is running!",
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    endpoints: {
      health: "/health",
      debug: "/api/debug",
      auth: "/api/auth/*",
      tutorials: "/api/tutorials",
      journal: "/api/journal",
      support: "/api/support",
      resources: "/api/resources",
      chat: "/api/chat/*",
      reports: "/api/reports",
      reputation: "/api/reputation",
      password_reset: "/api/auth/forgot-password",
      upload: "/api/upload/video"
    }
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug route
app.get('/api/debug', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: process.env.DATABASE_URL ? 'Configured' : 'Not configured',
    jwt: process.env.JWT_SECRET ? 'Configured' : 'Not configured',
    port: PORT,
    nodeVersion: process.version
  });
});

// Video upload route
app.post('/api/upload/video', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const videoUrl = `${req.protocol}://${req.get('host')}/uploads/videos/${req.file.filename}`;
    
    console.log('Video uploaded successfully:', req.file.filename);
    
    res.json({
      message: 'Video uploaded successfully',
      videoUrl: videoUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading video' });
  }
});

// Mount Routes
console.log('Mounting routes...');
app.use("/api/auth", authRoutes);
app.use("/api/auth", passwordResetRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/tutorials", tutorialRoutes);
app.use("/api/tutorials", ratingRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/reputation", reputationRoutes);
console.log('All routes mounted');

// Get all users (for testing)
app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        reputation: true,
        level: true,
      },
    });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// 404 handler - MUST BE AFTER ALL ROUTES
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({ 
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log("DevOrbit Server is running");
  console.log("Port: " + PORT);
  console.log("Environment: " + (process.env.NODE_ENV || 'development'));
  console.log("WebSocket: Initialized");
  console.log("Health check: /health");
  console.log("Debug info: /api/debug");
  console.log("Password reset: /api/auth/forgot-password");
  console.log("Video upload: /api/upload/video");
  console.log("Server ready to accept connections");
});
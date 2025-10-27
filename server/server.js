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

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server and initialize WebSocket
const server = createServer(app);
initializeSocket(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes); // Auth routes (register, login, /me)
app.use("/api/chat", chatRoutes); // Chat room and messaging routes
app.use("/api/tutorials", tutorialRoutes); // Tutorial CRUD routes
app.use("/api/journal", journalRoutes); // Journal CRUD routes
app.use("/api/support", supportRoutes); // Support forum routes (posts + comments)
app.use("/api/resources", resourceRoutes); // Resource/content hub routes
app.use("/api/auth", passwordResetRoutes); // Password reset routes

// NEW: DevOrbit routes
app.use("/api/tutorials", ratingRoutes); // Rating routes for tutorials
app.use("/api/reports", reportRoutes); // Report/moderation routes
app.use("/api/reputation", reputationRoutes); // Reputation system routes

// Optional test route: Get all users
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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("DevOrbit Server is running! ");
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

// Start server - ONLY CALL server.listen(), NOT app.listen()
server.listen(PORT, () => {
  console.log(` DevOrbit Server is running on http://localhost:${PORT}`);
  console.log(` WebSocket server initialized`);
  console.log(` Health check: http://localhost:${PORT}/health`);
});
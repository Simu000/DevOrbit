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

// CORS Configuration for Production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:4173',
      /\.vercel\.app$/,  // Allow all Vercel apps
      /\.netlify\.app$/,  // Allow all Netlify apps
      /\.onrender\.com$/,  // Allow all Render apps
    ];
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(origin);
      }
      return origin === pattern;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('⚠️  CORS blocked origin:', origin);
      callback(null, true); // Allow anyway for now, can restrict later
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight requests for 10 minutes
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (process.env.NODE_ENV === 'development') {
    console.log('Body:', req.body);
    console.log('Origin:', req.headers.origin);
  }
  next();
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "🚀 DevOrbit Server is running!",
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
      reputation: "/api/reputation"
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
    database: process.env.DATABASE_URL ? 'Configured ✅' : 'Not configured ❌',
    jwt: process.env.JWT_SECRET ? 'Configured ✅' : 'Not configured ❌',
    port: PORT,
    nodeVersion: process.version
  });
});

// Mount Routes
console.log('📦 Mounting routes...');
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/tutorials", tutorialRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/auth", passwordResetRoutes);
app.use("/api/tutorials", ratingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/reputation", reputationRoutes);
console.log('✅ All routes mounted');

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
  console.log('⚠️  404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({ 
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 SIGTERM received, shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 DevOrbit Server is running`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 WebSocket: Initialized`);
  console.log(`🔗 Health check: /health`);
  console.log(`📊 Debug info: /api/debug`);
  console.log(`\n✅ Server ready to accept connections\n`);
});
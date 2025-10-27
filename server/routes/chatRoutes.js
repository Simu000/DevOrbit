// server/routes/chatRoutes.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getChatRooms,
  getChatRoomById,
  createChatRoom,
  updateChatRoom,
  deleteChatRoom,
  getRoomMessages,
  addRoomMember,
  removeRoomMember,
  getMyChatRooms,
  createDirectMessageRoom
} from "../controllers/chatController.js";

const router = express.Router();

// Get all chat rooms (public and user's rooms)
router.get("/rooms", verifyToken, getChatRooms);

// Get user's chat rooms
router.get("/my-rooms", verifyToken, getMyChatRooms);

// Get specific chat room
router.get("/rooms/:id", verifyToken, getChatRoomById);

// Create new chat room
router.post("/rooms", verifyToken, createChatRoom);

// Create direct message room
router.post("/direct-message", verifyToken, createDirectMessageRoom);

// Update chat room
router.put("/rooms/:id", verifyToken, updateChatRoom);

// Delete chat room
router.delete("/rooms/:id", verifyToken, deleteChatRoom);

// Get room messages
router.get("/rooms/:id/messages", verifyToken, getRoomMessages);

// Add member to room
router.post("/rooms/:id/members", verifyToken, addRoomMember);

// Remove member from room
router.delete("/rooms/:id/members/:userId", verifyToken, removeRoomMember);

export default router;
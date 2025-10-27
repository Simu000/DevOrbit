import express from "express";
import { prismaClient } from "../utils/prismaClient.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const prisma = prismaClient();
const router = express.Router();

// GET all journal entries for logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const entries = await prisma.journal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    const formattedEntries = entries.map((entry) => ({
      id: entry.id,
      text: entry.text,
      mood: entry.mood,
      createdAt: entry.createdAt.toISOString(),
    }));

    res.json(formattedEntries);
  } catch (err) {
    console.error("Error fetching journal entries:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST new journal entry
router.post("/", verifyToken, async (req, res) => {
  const { text, mood } = req.body;

  if (!text || !mood) {
    return res.status(400).json({ message: "Text and mood are required" });
  }

  try {
    const entry = await prisma.journal.create({
      data: {
        text,
        mood,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      id: entry.id,
      text: entry.text,
      mood: entry.mood,
      createdAt: entry.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("Error creating journal entry:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT - Update journal entry
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { text, mood } = req.body;

  if (!text || !mood) {
    return res.status(400).json({ message: "Text and mood are required" });
  }

  try {
    // Check if entry exists and belongs to user
    const existingEntry = await prisma.journal.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id,
      },
    });

    if (!existingEntry) {
      return res.status(404).json({ message: "Entry not found or unauthorized" });
    }

    // Update the entry
    const updatedEntry = await prisma.journal.update({
      where: { id: parseInt(id) },
      data: { text, mood },
    });

    res.json({
      id: updatedEntry.id,
      text: updatedEntry.text,
      mood: updatedEntry.mood,
      createdAt: updatedEntry.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("Error updating journal entry:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE journal entry
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Check if entry exists and belongs to user
    const existingEntry = await prisma.journal.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id,
      },
    });

    if (!existingEntry) {
      return res.status(404).json({ message: "Entry not found or unauthorized" });
    }

    // Delete the entry
    await prisma.journal.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    console.error("Error deleting journal entry:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
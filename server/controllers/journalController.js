// journalController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Fetch all journal entries for logged-in user
export const getEntries = async (req, res) => {
  const userId = req.user.id;
  try {
    const entries = await prisma.journal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch entries" });
  }
};

// Add a new journal entry
export const addEntry = async (req, res) => {
  const userId = req.user.id;
  const { mood, text } = req.body;

  if (!mood || !text) return res.status(400).json({ message: "Mood and text are required" });

  try {
    const entry = await prisma.journal.create({
      data: { mood, text, userId },
    });
    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save entry" });
  }
};

// Update an entry
export const updateEntry = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { mood, text } = req.body;

  try {
    const entry = await prisma.journal.updateMany({
      where: { id: parseInt(id), userId },
      data: { mood, text },
    });

    if (entry.count === 0) return res.status(404).json({ message: "Entry not found or not authorized" });

    res.json({ message: "Updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update entry" });
  }
};

// Delete an entry
export const deleteEntry = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const entry = await prisma.journal.deleteMany({
      where: { id: parseInt(id), userId },
    });

    if (entry.count === 0) return res.status(404).json({ message: "Entry not found or not authorized" });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete entry" });
  }
};

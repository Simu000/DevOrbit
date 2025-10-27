import express from "express";
import { prismaClient } from "../utils/prismaClient.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const prisma = prismaClient();
const router = express.Router();

// GET all resources
router.get("/", async (req, res) => {
  const { category } = req.query;

  try {
    const resources = await prisma.resource.findMany({
      where: category ? { category } : {},
      include: {
        author: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(resources);
  } catch (err) {
    console.error("Error fetching resources:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET single resource by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const resource = await prisma.resource.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: { select: { id: true, username: true } },
      },
    });

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json(resource);
  } catch (err) {
    console.error("Error fetching resource:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST create new resource
router.post("/", verifyToken, async (req, res) => {
  const { title, description, url, category } = req.body;

  if (!title || !description || !url || !category) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        url,
        category,
        authorId: req.user.id,
      },
      include: {
        author: { select: { id: true, username: true } },
      },
    });

    res.status(201).json(resource);
  } catch (err) {
    console.error("Error creating resource:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update resource
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, url, category } = req.body;

  try {
    const resource = await prisma.resource.findUnique({
      where: { id: parseInt(id) },
    });

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (resource.authorId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedResource = await prisma.resource.update({
      where: { id: parseInt(id) },
      data: { title, description, url, category },
      include: {
        author: { select: { id: true, username: true } },
      },
    });

    res.json(updatedResource);
  } catch (err) {
    console.error("Error updating resource:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE resource
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const resource = await prisma.resource.findUnique({
      where: { id: parseInt(id) },
    });

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (resource.authorId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await prisma.resource.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Resource deleted successfully" });
  } catch (err) {
    console.error("Error deleting resource:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
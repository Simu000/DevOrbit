import express from "express";
import { prismaClient } from "./utils/prismaClient.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const prisma = prismaClient();
const router = express.Router();

// GET all support posts
router.get("/", async (req, res) => {
  try {
    const posts = await prisma.supportPost.findMany({
      include: {
        author: { select: { id: true, username: true } },
        comments: {
          include: {
            author: { select: { id: true, username: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET single post by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.supportPost.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: { select: { id: true, username: true } },
        comments: {
          include: {
            author: { select: { id: true, username: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST create new support post
router.post("/", verifyToken, async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  try {
    const post = await prisma.supportPost.create({
      data: {
        title,
        content,
        authorId: req.user.id,
      },
      include: {
        author: { select: { id: true, username: true } },
      },
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST add comment to a post
router.post("/:id/comments", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  try {
    const comment = await prisma.supportComment.create({
      data: {
        content,
        authorId: req.user.id,
        postId: parseInt(id),
      },
      include: {
        author: { select: { id: true, username: true } },
      },
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE post (only author can delete)
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.supportPost.findUnique({
      where: { id: parseInt(id) },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await prisma.supportPost.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
import { prismaClient } from "../utils/prismaClient.js";

const prisma = prismaClient();

// Add or update rating for a tutorial
export const rateTutorial = async (req, res) => {
  const { id } = req.params; // tutorial ID
  const { value, comment } = req.body;
  const userId = req.user.id;

  // Validate rating value
  if (!value || value < 1 || value > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    // Check if user already rated this tutorial
    const existingRating = await prisma.rating.findUnique({
      where: {
        tutorialId_userId: {
          tutorialId: parseInt(id),
          userId: userId,
        },
      },
    });

    let rating;
    if (existingRating) {
      // Update existing rating
      rating = await prisma.rating.update({
        where: { id: existingRating.id },
        data: { value, comment },
      });
    } else {
      // Create new rating
      rating = await prisma.rating.create({
        data: {
          value,
          comment,
          tutorialId: parseInt(id),
          userId,
        },
      });

      // Award points to tutorial author
      const tutorial = await prisma.tutorial.findUnique({
        where: { id: parseInt(id) },
      });

      if (tutorial) {
        const pointsAwarded = value >= 4 ? 10 : 5; // 4-5 stars = 10 points, 1-3 stars = 5 points

        await prisma.activity.create({
          data: {
            type: "received_rating",
            points: pointsAwarded,
            details: `Received ${value}-star rating`,
            userId: tutorial.authorId,
          },
        });

        await prisma.user.update({
          where: { id: tutorial.authorId },
          data: { reputation: { increment: pointsAwarded } },
        });
      }

      // Award points to rater
      await prisma.activity.create({
        data: {
          type: "gave_rating",
          points: 3,
          details: `Rated tutorial: ${tutorial.title}`,
          userId,
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { reputation: { increment: 3 } },
      });
    }

    // Recalculate average rating for tutorial
    const allRatings = await prisma.rating.findMany({
      where: { tutorialId: parseInt(id) },
    });

    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.value, 0) / allRatings.length
      : 0;

    await prisma.tutorial.update({
      where: { id: parseInt(id) },
      data: { averageRating },
    });

    res.status(201).json({
      message: existingRating ? "Rating updated" : "Rating added",
      rating,
    });
  } catch (err) {
    console.error("Error rating tutorial:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get ratings for a tutorial
export const getTutorialRatings = async (req, res) => {
  const { id } = req.params;

  try {
    const ratings = await prisma.rating.findMany({
      where: { tutorialId: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(ratings);
  } catch (err) {
    console.error("Error fetching ratings:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's rating for a specific tutorial
export const getUserRating = async (req, res) => {
  const { id } = req.params; // tutorial ID
  const userId = req.user.id;

  try {
    const rating = await prisma.rating.findUnique({
      where: {
        tutorialId_userId: {
          tutorialId: parseInt(id),
          userId,
        },
      },
    });

    res.json(rating);
  } catch (err) {
    console.error("Error fetching user rating:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete rating
export const deleteRating = async (req, res) => {
  const { id } = req.params; // rating ID
  const userId = req.user.id;

  try {
    const rating = await prisma.rating.findUnique({
      where: { id: parseInt(id) },
    });

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    if (rating.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await prisma.rating.delete({
      where: { id: parseInt(id) },
    });

    // Recalculate average rating
    const allRatings = await prisma.rating.findMany({
      where: { tutorialId: rating.tutorialId },
    });

    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.value, 0) / allRatings.length
      : 0;

    await prisma.tutorial.update({
      where: { id: rating.tutorialId },
      data: { averageRating },
    });

    res.json({ message: "Rating deleted successfully" });
  } catch (err) {
    console.error("Error deleting rating:", err);
    res.status(500).json({ message: "Server error" });
  }
};
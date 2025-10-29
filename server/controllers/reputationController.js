import { prismaClient } from "../routes/utils/prismaClient.js";

const prisma = prismaClient();

// Level thresholds
const LEVELS = {
  Beginner: 0,
  Contributor: 50,
  Expert: 200,
  Master: 500,
};

// Calculate user level based on reputation
const calculateLevel = (reputation) => {
  if (reputation >= LEVELS.Master) return "Master";
  if (reputation >= LEVELS.Expert) return "Expert";
  if (reputation >= LEVELS.Contributor) return "Contributor";
  return "Beginner";
};

// Award points and update reputation
export const awardPoints = async (userId, type, points, details) => {
  try {
    // Create activity record
    await prisma.activity.create({
      data: {
        type,
        points,
        details,
        userId,
      },
    });

    // Update user reputation
    const user = await prisma.user.update({
      where: { id: userId },
      data: { reputation: { increment: points } },
    });

    // Update level
    const newLevel = calculateLevel(user.reputation);
    if (newLevel !== user.level) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          level: newLevel,
          canPostPublic: user.reputation >= LEVELS.Contributor,
        },
      });

      // Award level-up badge
      await prisma.badge.create({
        data: {
          name: `${newLevel} Level Reached`,
          icon: getLevelIcon(newLevel),
          description: `Reached ${newLevel} level with ${user.reputation} points`,
          userId,
        },
      });
    }

    // Check for milestone badges
    await checkMilestoneBadges(user);

    return user;
  } catch (err) {
    console.error("Error awarding points:", err);
    throw err;
  }
};

// Get level icon
const getLevelIcon = (level) => {
  const icons = {
    Beginner: "🌱",
    Contributor: "🌿",
    Expert: "🌳",
    Master: "👑",
  };
  return icons[level] || "⭐";
};

// Check and award milestone badges
const checkMilestoneBadges = async (user) => {
  const milestones = [
    { reputation: 100, name: "Century Club", icon: "💯" },
    { reputation: 250, name: "Rising Star", icon: "⭐" },
    { reputation: 500, name: "Elite Contributor", icon: "🏆" },
    { reputation: 1000, name: "Legend", icon: "👑" },
  ];

  for (const milestone of milestones) {
    if (user.reputation >= milestone.reputation) {
      const existingBadge = await prisma.badge.findFirst({
        where: {
          userId: user.id,
          name: milestone.name,
        },
      });

      if (!existingBadge) {
        await prisma.badge.create({
          data: {
            name: milestone.name,
            icon: milestone.icon,
            description: `Earned ${milestone.reputation} reputation points`,
            userId: user.id,
          },
        });
      }
    }
  }
};

// Get user's reputation stats
export const getUserReputation = async (req, res) => {
  const userId = req.params.id || req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        username: true,
        reputation: true,
        level: true,
        avatar: true,
      },
    });

    const activities = await prisma.activity.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const badges = await prisma.badge.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { earnedAt: "desc" },
    });

    // Calculate next level progress
    const currentLevel = user.level;
    const nextLevel = currentLevel === "Master" ? "Master" : 
                     currentLevel === "Expert" ? "Master" :
                     currentLevel === "Contributor" ? "Expert" : "Contributor";
    
    const currentThreshold = LEVELS[currentLevel];
    const nextThreshold = LEVELS[nextLevel];
    const progress = nextLevel === "Master" && currentLevel === "Master" 
      ? 100 
      : ((user.reputation - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

    res.json({
      user,
      activities,
      badges,
      levelProgress: {
        current: currentLevel,
        next: nextLevel,
        progress: Math.min(progress, 100),
        pointsToNext: Math.max(0, nextThreshold - user.reputation),
      },
    });
  } catch (err) {
    console.error("Error fetching reputation:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  const { limit = 10, timeframe = "all" } = req.query;

  try {
    let users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        reputation: true,
        level: true,
        avatar: true,
        _count: {
          select: {
            tutorials: true,
            ratings: true,
          },
        },
      },
      orderBy: { reputation: "desc" },
      take: parseInt(limit),
    });

    res.json(users);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's activity feed
export const getUserActivity = async (req, res) => {
  const userId = req.params.id || req.user.id;
  const { limit = 50 } = req.query;

  try {
    const activities = await prisma.activity.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
    });

    res.json(activities);
  } catch (err) {
    console.error("Error fetching activity:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all badges for a user
export const getUserBadges = async (req, res) => {
  const userId = req.params.id || req.user.id;

  try {
    const badges = await prisma.badge.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { earnedAt: "desc" },
    });

    res.json(badges);
  } catch (err) {
    console.error("Error fetching badges:", err);
    res.status(500).json({ message: "Server error" });
  }
};
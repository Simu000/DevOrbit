import { prismaClient } from "../routes/utils/prismaClient.js";

const prisma = prismaClient();

// Report a tutorial
export const reportTutorial = async (req, res) => {
  const { id } = req.params; // tutorial ID
  const { reason, details } = req.body;
  const userId = req.user.id;

  if (!reason) {
    return res.status(400).json({ message: "Reason is required" });
  }

  try {
    // Check if user already reported this tutorial
    const existingReport = await prisma.report.findFirst({
      where: {
        tutorialId: parseInt(id),
        reporterId: userId,
      },
    });

    if (existingReport) {
      return res.status(400).json({ message: "You already reported this tutorial" });
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reason,
        details,
        tutorialId: parseInt(id),
        reporterId: userId,
      },
    });

    // Increment flag count on tutorial
    const tutorial = await prisma.tutorial.update({
      where: { id: parseInt(id) },
      data: { flagCount: { increment: 1 } },
    });

    // Auto-hide if flagged 3+ times
    if (tutorial.flagCount >= 3) {
      await prisma.tutorial.update({
        where: { id: parseInt(id) },
        data: { isPublic: false },
      });
    }

    res.status(201).json({
      message: "Report submitted successfully",
      report,
    });
  } catch (err) {
    console.error("Error reporting tutorial:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all reports (admin/moderator only)
export const getAllReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        tutorial: {
          select: {
            id: true,
            title: true,
            authorId: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve report (admin/moderator only)
export const approveReport = async (req, res) => {
  const { id } = req.params; // report ID

  try {
    const report = await prisma.report.update({
      where: { id: parseInt(id) },
      data: { status: "approved" },
    });

    // Hide the tutorial
    await prisma.tutorial.update({
      where: { id: report.tutorialId },
      data: { isPublic: false },
    });

    res.json({ message: "Report approved, tutorial hidden", report });
  } catch (err) {
    console.error("Error approving report:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject report (admin/moderator only)
export const rejectReport = async (req, res) => {
  const { id } = req.params; // report ID

  try {
    const report = await prisma.report.update({
      where: { id: parseInt(id) },
      data: { status: "rejected" },
    });

    // Decrease flag count
    await prisma.tutorial.update({
      where: { id: report.tutorialId },
      data: { flagCount: { decrement: 1 } },
    });

    res.json({ message: "Report rejected", report });
  } catch (err) {
    console.error("Error rejecting report:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Restore hidden tutorial (admin/moderator only)
export const restoreTutorial = async (req, res) => {
  const { id } = req.params; // tutorial ID

  try {
    await prisma.tutorial.update({
      where: { id: parseInt(id) },
      data: {
        isPublic: true,
        flagCount: 0,
      },
    });

    // Mark all reports as rejected
    await prisma.report.updateMany({
      where: { tutorialId: parseInt(id) },
      data: { status: "rejected" },
    });

    res.json({ message: "Tutorial restored successfully" });
  } catch (err) {
    console.error("Error restoring tutorial:", err);
    res.status(500).json({ message: "Server error" });
  }
};
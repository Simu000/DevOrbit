import { prismaClient } from "../utils/prismaClient.js";

const prisma = prismaClient();

// export async function getTutorials(req, res) {
//   try {
//     const tutorials = await prisma.tutorial.findMany({
//       include: {
//         author: {
//           select: {
//             id: true,
//             username: true,
//             reputation: true,
//             level: true,
//             avatar: true,
//           }
//         },
//         _count: {
//           select: {
//             ratings: true,
//           }
//         }
//       },
//       orderBy: { createdAt: 'desc' },
//     });
//     res.status(200).json(tutorials);
//   } catch (error) {
//     console.error("Get Tutorials Error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

export async function getTutorials(req, res) {
  try {
    const userId = req.user?.id; // Get current user ID if logged in

    let whereCondition = {};

    if (userId) {
      // Logged-in users can see:
      // 1. All public tutorials
      // 2. Their own tutorials (even if not public)
      // 3. Tutorials from users they follow (if you implement following)
      whereCondition = {
        OR: [
          { isPublic: true },
          { authorId: userId }, // Users can always see their own tutorials
        ],
      };
    } else {
      // Non-logged-in users only see public tutorials
      whereCondition = { isPublic: true };
    }

    const tutorials = await prisma.tutorial.findMany({
      where: whereCondition,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            reputation: true,
            level: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            ratings: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(tutorials);
  } catch (error) {
    console.error("Get Tutorials Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getTutorialById(req, res) {
  const { id } = req.params;
  try {
    const tutorial = await prisma.tutorial.findUnique({
      where: { id: Number(id) },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            reputation: true,
            level: true,
            avatar: true,
          },
        },
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!tutorial) {
      return res.status(404).json({ message: "Tutorial not found" });
    }

    // Increment view count
    await prisma.tutorial.update({
      where: { id: Number(id) },
      data: { views: { increment: 1 } },
    });

    res.status(200).json(tutorial);
  } catch (error) {
    console.error("Get Tutorial Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// export async function createTutorial(req, res) {
//   const { title, description, videoUrl, category, tags } = req.body;
//   const authorId = req.user?.id;

//   try {
//     // Check if user can post publicly (reputation-based)
//     const user = await prisma.user.findUnique({
//       where: { id: authorId },
//       select: { canPostPublic: true, reputation: true },
//     });

//     // New users (reputation < 50) start in sandbox mode
//     const isPublic = user.canPostPublic || user.reputation >= 50;

//     const tutorial = await prisma.tutorial.create({
//       data: {
//         title,
//         description,
//         videoUrl,
//         category: category || "General",
//         tags: tags || [],
//         authorId,
//         isPublic,
//       },
//       include: {
//         author: {
//           select: {
//             id: true,
//             username: true,
//             reputation: true,
//             level: true,
//           },
//         },
//       },
//     });

//     // Award reputation points for creating tutorial
//     await prisma.activity.create({
//       data: {
//         type: "tutorial_created",
//         points: 20,
//         details: `Created tutorial: ${title}`,
//         userId: authorId,
//       },
//     });

//     await prisma.user.update({
//       where: { id: authorId },
//       data: {
//         reputation: { increment: 20 },
//       },
//     });

//     // Update user level if needed
//     const updatedUser = await prisma.user.findUnique({
//       where: { id: authorId },
//     });

//     if (updatedUser.reputation >= 50 && updatedUser.level === "Beginner") {
//       await prisma.user.update({
//         where: { id: authorId },
//         data: {
//           level: "Contributor",
//           canPostPublic: true,
//         },
//       });

//       // Award badge for reaching Contributor
//       await prisma.badge.create({
//         data: {
//           name: "Contributor Level Reached",
//           icon: "🌿",
//           description: "Reached Contributor level with 50+ points",
//           userId: authorId,
//         },
//       });
//     }

//     res.status(201).json(tutorial);
//   } catch (error) {
//     console.error("Create Tutorial Error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

export async function createTutorial(req, res) {
  const { title, description, videoUrl, category, tags } = req.body;
  const authorId = req.user?.id;

  try {
    // Check if user can post publicly (reputation-based)
    const user = await prisma.user.findUnique({
      where: { id: authorId },
      select: { canPostPublic: true, reputation: true }
    });

    // NEW LOGIC: 
    // - Users with 50+ reputation: tutorials are public immediately
    // - Users with <50 reputation: tutorials are public but marked as "from beginner"
    // - ALL tutorials are visible to everyone, but beginners get a badge
    const isPublic = true; // Always public now
    const isFromBeginner = user.reputation < 50;

    const tutorial = await prisma.tutorial.create({
      data: { 
        title, 
        description, 
        videoUrl,
        category: category || "General",
        tags: tags || [],
        authorId,
        isPublic,
        // Add beginner flag for UI differentiation
        ...(isFromBeginner && { flagCount: -1 }) // Use -1 to indicate "beginner content"
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            reputation: true,
            level: true,
          }
        }
      }
    });

    // Award reputation points for creating tutorial
    await prisma.activity.create({
      data: {
        type: "tutorial_created",
        points: 20,
        details: `Created tutorial: ${title}`,
        userId: authorId,
      },
    });

    await prisma.user.update({
      where: { id: authorId },
      data: { 
        reputation: { increment: 20 },
      },
    });

    // Update user level if needed
    const updatedUser = await prisma.user.findUnique({
      where: { id: authorId },
    });

    if (updatedUser.reputation >= 50 && updatedUser.level === "Beginner") {
      await prisma.user.update({
        where: { id: authorId },
        data: { 
          level: "Contributor",
          canPostPublic: true,
        },
      });

      // Award badge for reaching Contributor
      await prisma.badge.create({
        data: {
          name: "Contributor Level Reached",
          icon: "🌿",
          description: "Reached Contributor level with 50+ points",
          userId: authorId,
        },
      });
    }

    res.status(201).json(tutorial);
  } catch (error) {
    console.error("Create Tutorial Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateTutorial(req, res) {
  const { id } = req.params;
  const { title, description, videoUrl, category, tags } = req.body;

  try {
    const tutorial = await prisma.tutorial.findUnique({
      where: { id: Number(id) },
    });

    if (!tutorial) {
      return res.status(404).json({ message: "Tutorial not found" });
    }

    // Authorization: only author can update
    if (tutorial.authorId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: Not the author" });
    }

    const updatedTutorial = await prisma.tutorial.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        videoUrl,
        ...(category && { category }),
        ...(tags && { tags }),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            reputation: true,
            level: true,
          },
        },
      },
    });

    res.status(200).json(updatedTutorial);
  } catch (error) {
    console.error("Update Tutorial Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteTutorial(req, res) {
  const { id } = req.params;

  try {
    const tutorial = await prisma.tutorial.findUnique({
      where: { id: Number(id) },
    });

    if (!tutorial) {
      return res.status(404).json({ message: "Tutorial not found" });
    }

    // Authorization: only author or admin can delete
    if (tutorial.authorId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Not authorized" });
    }

    await prisma.tutorial.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: "Tutorial deleted successfully" });
  } catch (err) {
    console.error("Delete Tutorial Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

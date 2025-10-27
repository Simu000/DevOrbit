// server/controllers/chatController.js
import { prismaClient } from "../utils/prismaClient.js";

const prisma = prismaClient();

// Get all chat rooms (public and user's rooms)
export const getChatRooms = async (req, res) => {
  try {
    const rooms = await prisma.chatRoom.findMany({
      where: {
        OR: [
          { type: "public" },
          { members: { some: { id: req.user.id } } }
        ]
      },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            avatar: true,
            reputation: true,
            level: true
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        _count: {
          select: {
            members: true,
            messages: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(rooms);
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's chat rooms
export const getMyChatRooms = async (req, res) => {
  try {
    const rooms = await prisma.chatRoom.findMany({
      where: {
        members: { some: { id: req.user.id } }
      },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        _count: {
          select: {
            members: true,
            messages: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(rooms);
  } catch (error) {
    console.error("Error fetching user rooms:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get specific chat room
export const getChatRoomById = async (req, res) => {
  const { id } = req.params;

  try {
    const room = await prisma.chatRoom.findUnique({
      where: { id: parseInt(id) },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            avatar: true,
            reputation: true,
            level: true
          }
        },
        messages: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!room) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    // Check if user is member (for private rooms)
    if (room.type === "private" && !room.members.some(member => member.id === req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(room);
  } catch (error) {
    console.error("Error fetching chat room:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new chat room
export const createChatRoom = async (req, res) => {
  const { name, description, type = "public" } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Room name is required" });
  }

  try {
    const room = await prisma.chatRoom.create({
      data: {
        name,
        description,
        type,
        members: {
          connect: [{ id: req.user.id }] // Add creator as member
        }
      },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(room);
  } catch (error) {
    console.error("Error creating chat room:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create direct message room
export const createDirectMessageRoom = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Check if direct message room already exists between these users
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        type: "direct",
        AND: [
          { members: { some: { id: req.user.id } } },
          { members: { some: { id: parseInt(userId) } } }
        ]
      },
      include: {
        members: true
      }
    });

    if (existingRoom) {
      return res.json(existingRoom);
    }

    // Create new direct message room
    const room = await prisma.chatRoom.create({
      data: {
        name: `Direct Message`,
        type: "direct",
        members: {
          connect: [
            { id: req.user.id },
            { id: parseInt(userId) }
          ]
        }
      },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(room);
  } catch (error) {
    console.error("Error creating direct message room:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update chat room
export const updateChatRoom = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    // Check if user is member of the room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: parseInt(id),
        members: { some: { id: req.user.id } }
      }
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found or access denied" });
    }

    const updatedRoom = await prisma.chatRoom.update({
      where: { id: parseInt(id) },
      data: { name, description },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.json(updatedRoom);
  } catch (error) {
    console.error("Error updating chat room:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete chat room
export const deleteChatRoom = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user is member of the room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: parseInt(id),
        members: { some: { id: req.user.id } }
      }
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found or access denied" });
    }

    await prisma.chatRoom.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "Chat room deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat room:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get room messages
export const getRoomMessages = async (req, res) => {
  const { id } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  try {
    // Check if user has access to the room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { type: "public" },
          { members: { some: { id: req.user.id } } }
        ]
      }
    });

    if (!room) {
      return res.status(403).json({ message: "Access denied to this room" });
    }

    const messages = await prisma.message.findMany({
      where: { roomId: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json(messages.reverse()); // Return in chronological order
  } catch (error) {
    console.error("Error fetching room messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add member to room
export const addRoomMember = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Check if current user is member of the room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: parseInt(id),
        members: { some: { id: req.user.id } }
      }
    });

    if (!room) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedRoom = await prisma.chatRoom.update({
      where: { id: parseInt(id) },
      data: {
        members: {
          connect: { id: parseInt(userId) }
        }
      },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.json(updatedRoom);
  } catch (error) {
    console.error("Error adding member to room:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove member from room
export const removeRoomMember = async (req, res) => {
  const { id, userId } = req.params;

  try {
    // Check if current user is member of the room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: parseInt(id),
        members: { some: { id: req.user.id } }
      }
    });

    if (!room) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedRoom = await prisma.chatRoom.update({
      where: { id: parseInt(id) },
      data: {
        members: {
          disconnect: { id: parseInt(userId) }
        }
      },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.json(updatedRoom);
  } catch (error) {
    console.error("Error removing member from room:", error);
    res.status(500).json({ message: "Server error" });
  }
};
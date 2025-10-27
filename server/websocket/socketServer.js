// server/websocket/socketServer.js (Enhanced version)
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token'));
      }
      socket.userId = decoded.id;
      socket.username = decoded.username;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`🔗 User ${socket.username} (${socket.userId}) connected`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Load user's rooms and join them
    loadAndJoinUserRooms(socket);

    // Handle joining specific rooms
    socket.on('join_room', async (roomId) => {
      socket.join(`room_${roomId}`);
      console.log(`👥 User ${socket.username} joined room ${roomId}`);
      
      // Load previous messages for this room
      try {
        const messages = await prisma.message.findMany({
          where: { roomId: parseInt(roomId) },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' },
          take: 50
        });
        
        socket.emit('room_messages', { roomId, messages });
      } catch (error) {
        console.error('Error loading room messages:', error);
      }
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(`room_${roomId}`);
      console.log(`🚪 User ${socket.username} left room ${roomId}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { roomId, content, encrypted = false } = data;
        
        if (!content || !content.trim()) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        // Verify user has access to the room
        const room = await prisma.chatRoom.findFirst({
          where: {
            id: parseInt(roomId),
            OR: [
              { type: "public" },
              { members: { some: { id: socket.userId } } }
            ]
          }
        });

        if (!room) {
          socket.emit('error', { message: 'Access denied to this room' });
          return;
        }

        // Save message to database
        const message = await prisma.message.create({
          data: {
            content: content.trim(),
            encrypted,
            roomId: parseInt(roomId),
            userId: socket.userId,
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              }
            }
          }
        });

        console.log(`💬 User ${socket.username} sent message in room ${roomId}`);

        // Broadcast to everyone in the room
        io.to(`room_${roomId}`).emit('new_message', message);
        
        // Send notification to other users in the room
        socket.to(`room_${roomId}`).emit('message_notification', {
          roomId,
          message: `New message from ${socket.username}`,
          sender: socket.username
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (roomId) => {
      socket.to(`room_${roomId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.username,
        roomId
      });
    });

    socket.on('typing_stop', (roomId) => {
      socket.to(`room_${roomId}`).emit('user_stop_typing', {
        userId: socket.userId,
        roomId
      });
    });

    // Handle room creation notifications
    socket.on('room_created', (room) => {
      // Notify relevant users about new room
      if (room.type === 'public') {
        io.emit('new_public_room', room);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User ${socket.username} disconnected`);
    });
  });

  return io;
};

// Helper function to load and join user's rooms
const loadAndJoinUserRooms = async (socket) => {
  try {
    const userRooms = await prisma.chatRoom.findMany({
      where: {
        members: { some: { id: socket.userId } }
      },
      select: { id: true }
    });

    userRooms.forEach(room => {
      socket.join(`room_${room.id}`);
    });

    console.log(`✅ User ${socket.username} joined ${userRooms.length} rooms`);
  } catch (error) {
    console.error('Error loading user rooms:', error);
  }
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
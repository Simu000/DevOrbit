import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext.jsx';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const { user } = useContext(AuthContext);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:3000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      setSocket(newSocket);

      // Listen for online users
      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      // Listen for new messages
      newSocket.on('new_message', (message) => {
        setMessages(prev => ({
          ...prev,
          [message.roomId]: [...(prev[message.roomId] || []), message]
        }));
      });

      // Typing indicators
      newSocket.on('user_typing', (data) => {
        setTypingUsers(prev => ({
          ...prev,
          [data.roomId]: [...new Set([...(prev[data.roomId] || []), data.username])]
        }));
      });

      newSocket.on('user_stop_typing', (data) => {
        setTypingUsers(prev => ({
          ...prev,
          [data.roomId]: (prev[data.roomId] || []).filter(username => username !== data.username)
        }));
      });

      // Error handling
      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    } else {
      // Clean up socket if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('join_room', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket) {
      socket.emit('leave_room', roomId);
    }
  };

  const sendMessage = (roomId, content, encrypted = false) => {
    if (socket) {
      socket.emit('send_message', { roomId, content, encrypted });
    }
  };

  const startTyping = (roomId) => {
    if (socket) {
      socket.emit('typing_start', roomId);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to automatically stop typing
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(roomId);
      }, 3000);
    }
  };

  const stopTyping = (roomId) => {
    if (socket) {
      socket.emit('typing_stop', roomId);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  return (
    <ChatContext.Provider value={{
      socket,
      onlineUsers,
      messages,
      typingUsers,
      joinRoom,
      leaveRoom,
      sendMessage,
      startTyping,
      stopTyping
    }}>
      {children}
    </ChatContext.Provider>
  );
};
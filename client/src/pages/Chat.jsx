import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { ChatContext } from "../context/ChatContext.jsx";
import axios from "axios";

const Chat = () => {
  const { user } = useContext(AuthContext);
  const { 
    socket, 
    messages, 
    typingUsers, 
    joinRoom, 
    leaveRoom, 
    sendMessage, 
    startTyping, 
    stopTyping 
  } = useContext(ChatContext);
  
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: "", description: "", type: "public" });
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchRooms();
    fetchUsers();
  }, [user]);

  // Join room when selected
  useEffect(() => {
    if (selectedRoom && socket) {
      joinRoom(selectedRoom.id);
      
      // Load initial messages from database
      fetchRoomMessages(selectedRoom.id);
    }

    return () => {
      if (selectedRoom && socket) {
        leaveRoom(selectedRoom.id);
      }
    };
  }, [selectedRoom, socket, joinRoom, leaveRoom]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedRoom]);

  // Handle typing timeout
  useEffect(() => {
    if (isTyping && selectedRoom) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedRoom.id);
        setIsTyping(false);
      }, 3000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, selectedRoom, stopTyping]);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/api/chat/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/users");
      setUsers(res.data.filter(u => u.id !== user.id)); // Exclude current user
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchRoomMessages = async (roomId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:3000/api/chat/rooms/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Note: Real-time messages will come through WebSocket, this is just initial load
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      // Send via WebSocket for real-time delivery
      sendMessage(selectedRoom.id, newMessage.trim());
      setNewMessage("");
      
      // Stop typing indicator
      stopTyping(selectedRoom.id);
      setIsTyping(false);
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message");
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Start typing indicator
    if (selectedRoom && !isTyping) {
      startTyping(selectedRoom.id);
      setIsTyping(true);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/chat/rooms",
        roomForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowCreateRoom(false);
      setRoomForm({ name: "", description: "", type: "public" });
      fetchRooms(); // Refresh rooms list
    } catch (err) {
      console.error("Error creating room:", err);
      alert("Failed to create room");
    }
  };

  // Get messages for current room
  const roomMessages = selectedRoom ? messages[selectedRoom.id] || [] : [];
  const currentTypingUsers = selectedRoom ? typingUsers[selectedRoom.id] || [] : [];

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading chat...</div>;
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 80px)" }}>
      {/* Sidebar - Chat Rooms */}
      <div style={{ 
        width: "300px", 
        borderRight: "1px solid var(--border-color)",
        backgroundColor: "var(--bg-secondary)",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color)" }}>
          <h2 style={{ margin: "0 0 15px 0" }}>💬 Chat Rooms</h2>
          <button
            onClick={() => setShowCreateRoom(true)}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            ➕ Create Room
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {rooms.map(room => (
            <div
              key={room.id}
              onClick={() => handleSelectRoom(room)}
              style={{
                padding: "15px",
                borderBottom: "1px solid var(--border-color)",
                cursor: "pointer",
                backgroundColor: selectedRoom?.id === room.id ? "var(--accent-color)" : "transparent",
                color: selectedRoom?.id === room.id ? "white" : "var(--text-primary)",
                transition: "all 0.2s"
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                {room.type === "direct" ? "👤" : "👥"} {room.name}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>
                {room.members?.length || 0} members
                {room.messages?.[0] && (
                  <div style={{ marginTop: "5px", fontStyle: "italic" }}>
                    {room.messages[0].user?.username}: {room.messages[0].content}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Online Users */}
        <div style={{ 
          padding: "15px", 
          borderTop: "1px solid var(--border-color)",
          backgroundColor: "var(--card-bg)"
        }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>🟢 Online Users</h4>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            {socket ? "Connected" : "Connecting..."}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div style={{ 
              padding: "15px 20px", 
              borderBottom: "1px solid var(--border-color)",
              backgroundColor: "var(--card-bg)"
            }}>
              <h3 style={{ margin: 0 }}>
                {selectedRoom.type === "direct" ? "👤" : "👥"} {selectedRoom.name}
              </h3>
              <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>
                {selectedRoom.description}
              </p>
              {currentTypingUsers.length > 0 && (
                <p style={{ 
                  margin: "5px 0 0 0", 
                  fontSize: "12px", 
                  color: "var(--accent-color)",
                  fontStyle: "italic"
                }}>
                  {currentTypingUsers.join(', ')} {currentTypingUsers.length === 1 ? 'is' : 'are'} typing...
                </p>
              )}
            </div>

            {/* Messages */}
            <div style={{ 
              flex: 1, 
              padding: "20px", 
              overflowY: "auto",
              backgroundColor: "var(--bg-primary)"
            }}>
              {roomMessages.length === 0 ? (
                <div style={{ 
                  textAlign: "center", 
                  padding: "40px",
                  color: "var(--text-secondary)"
                }}>
                  <div style={{ fontSize: "48px", marginBottom: "10px" }}>💬</div>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                roomMessages.map(message => (
                  <div
                    key={message.id}
                    style={{
                      marginBottom: "15px",
                      display: "flex",
                      flexDirection: message.userId === user.id ? "row-reverse" : "row",
                      alignItems: "flex-start",
                      gap: "10px"
                    }}
                  >
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "#e0e0e0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px"
                    }}>
                      {message.user?.avatar ? (
                        <img 
                          src={message.user.avatar} 
                          alt={message.user.username}
                          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        message.user?.username?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <div style={{
                      maxWidth: "70%",
                      backgroundColor: message.userId === user.id ? "#4CAF50" : "var(--card-bg)",
                      color: message.userId === user.id ? "white" : "var(--text-primary)",
                      padding: "10px 15px",
                      borderRadius: "15px",
                      border: message.userId === user.id ? "none" : "1px solid var(--border-color)"
                    }}>
                      <div style={{ 
                        fontSize: "12px", 
                        opacity: 0.8,
                        marginBottom: "5px"
                      }}>
                        {message.user?.username}
                      </div>
                      <div>{message.content}</div>
                      <div style={{ 
                        fontSize: "11px", 
                        opacity: 0.6,
                        marginTop: "5px",
                        textAlign: "right"
                      }}>
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} style={{ 
              padding: "20px", 
              borderTop: "1px solid var(--border-color)",
              backgroundColor: "var(--card-bg)"
            }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "25px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--input-bg)",
                    color: "var(--text-primary)"
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: newMessage.trim() ? "#4CAF50" : "#cccccc",
                    color: "white",
                    border: "none",
                    borderRadius: "25px",
                    cursor: newMessage.trim() ? "pointer" : "not-allowed",
                    fontWeight: "bold"
                  }}
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ 
            flex: 1, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            color: "var(--text-secondary)"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>💬</div>
              <h3>Select a chat room to start messaging</h3>
              <p>Or create a new room to collaborate with others</p>
              {!socket && (
                <p style={{ 
                  marginTop: "10px", 
                  color: "#ff9800",
                  fontSize: "14px"
                }}>
                  🔄 Connecting to chat server...
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "var(--card-bg)",
            padding: "30px",
            borderRadius: "10px",
            width: "90%",
            maxWidth: "500px"
          }}>
            <h3>Create Chat Room</h3>
            <form onSubmit={handleCreateRoom}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Room Name
                </label>
                <input
                  type="text"
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--input-bg)",
                    color: "var(--text-primary)"
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Description
                </label>
                <input
                  type="text"
                  value={roomForm.description}
                  onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--input-bg)",
                    color: "var(--text-primary)"
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Room Type
                </label>
                <select
                  value={roomForm.type}
                  onChange={(e) => setRoomForm({...roomForm, type: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--input-bg)",
                    color: "var(--text-primary)"
                  }}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateRoom(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "5px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "transparent",
                    color: "var(--text-primary)",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    borderRadius: "5px",
                    border: "none",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
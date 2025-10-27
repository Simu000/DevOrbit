// src/components/ChatWindow.jsx
import { useState, useEffect, useRef, useContext } from 'react';
import { ChatContext } from '../context/ChatContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

const ChatWindow = ({ room }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { messages, sendMessage, startTyping, stopTyping, typingUsers } = useContext(ChatContext);
  const { user } = useContext(AuthContext);

  const roomMessages = messages[room.id] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  useEffect(() => {
    const typingTimeout = setTimeout(() => {
      if (isTyping) {
        stopTyping(room.id);
        setIsTyping(false);
      }
    }, 1000);

    return () => clearTimeout(typingTimeout);
  }, [isTyping, room.id, stopTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage(room.id, newMessage.trim());
    setNewMessage('');
    stopTyping(room.id);
    setIsTyping(false);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      startTyping(room.id);
      setIsTyping(true);
    }
  };

  const currentTypingUsers = typingUsers[room.id] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat Header */}
      <div style={{ 
        padding: '15px 20px', 
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--card-bg)'
      }}>
        <h3 style={{ margin: 0 }}>
          {room.type === 'direct' ? '👤' : '👥'} {room.name}
        </h3>
        {currentTypingUsers.length > 0 && (
          <p style={{ 
            margin: '5px 0 0 0', 
            fontSize: '14px', 
            color: 'var(--text-secondary)',
            fontStyle: 'italic'
          }}>
            {currentTypingUsers.join(', ')} {currentTypingUsers.length === 1 ? 'is' : 'are'} typing...
          </p>
        )}
      </div>

      {/* Messages */}
      <div style={{ 
        flex: 1, 
        padding: '20px', 
        overflowY: 'auto',
        backgroundColor: 'var(--bg-primary)'
      }}>
        {roomMessages.map(message => (
          <div
            key={message.id}
            style={{
              marginBottom: '15px',
              display: 'flex',
              flexDirection: message.userId === user.id ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>
              {message.user?.avatar ? (
                <img 
                  src={message.user.avatar} 
                  alt={message.user.username}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                message.user?.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div style={{
              maxWidth: '70%',
              backgroundColor: message.userId === user.id ? '#4CAF50' : 'var(--card-bg)',
              color: message.userId === user.id ? 'white' : 'var(--text-primary)',
              padding: '10px 15px',
              borderRadius: '15px',
              border: message.userId === user.id ? 'none' : '1px solid var(--border-color)'
            }}>
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.8,
                marginBottom: '5px'
              }}>
                {message.user?.username}
              </div>
              <div>{message.content}</div>
              <div style={{ 
                fontSize: '11px', 
                opacity: 0.6,
                marginTop: '5px',
                textAlign: 'right'
              }}>
                {new Date(message.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} style={{ 
        padding: '20px', 
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--card-bg)'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '25px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '12px 24px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
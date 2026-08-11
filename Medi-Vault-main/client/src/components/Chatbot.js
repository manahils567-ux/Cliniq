import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaComment } from 'react-icons/fa';
import axios from 'axios';
import './Chatbot.css';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      // Use the full server URL for the API call
      const response = await axios.post('http://localhost:5000/api/chatbot/message', 
        { message: input },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        const botMessage = {
          text: response.data.message,
          sender: 'bot',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      let errorMessage = 'Sorry, I couldn\'t process your request. Please try again.';
      
      // Handle specific error cases
      if (error.response?.status === 503) {
        if (error.response.data.error === 'RATE_LIMIT_EXCEEDED') {
          errorMessage = 'I\'m receiving too many requests right now. Please try again in a few moments.';
        } else if (error.response.data.error === 'QUOTA_EXCEEDED') {
          errorMessage = 'Service is temporarily unavailable. Please try again later.';
        }
      }

      const botErrorMessage = {
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, botErrorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {!isOpen && (
        <button onClick={toggleChatbot} className="chatbot-toggle-btn">
          <FaComment />
          <span>Chat with MediAssistant</span>
        </button>
      )}
      
      {isOpen && (
        <div className="chatbot-popup">
          <div className="chatbot-container">
            <div className="chatbot-header">
              <div className="bot-avatar">
                <FaRobot />
              </div>
              <h2>MediAssistant</h2>
              <button onClick={toggleChatbot} className="close-chatbot">
                <FaTimes />
              </button>
            </div>

            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="welcome-message">
                  <p>Hello! I'm your MediAssistant. How can I help you with your health records today?</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'} ${message.isError ? 'error-message' : ''}`}
                >
                  <p>{message.text}</p>
                  <span className="timestamp">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {isTyping && (
                <div className="bot-message typing">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="chat-input-form">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="chat-input"
              />
              <button type="submit" className="send-button" disabled={!input.trim() || isTyping}>
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
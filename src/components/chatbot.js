import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import awsmobile from '../aws-exports';
import './chatbot.css';
import { ToastContainer, toast } from 'react-toastify';

const API_URL = awsmobile.aws_cloud_logic_custom.find(api => api.name === 'chatbot')?.endpoint;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();

  const fetchChatResponse = async (userMessage) => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_URL}/openai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${errorText}`);
      }

      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        setMessages((prev) => [
          ...prev,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: data.choices[0].message.content },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch chat response:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = () => {
    if (userInput.trim()) {
      fetchChatResponse(userInput);
      setUserInput('');
    } else {
      toast.warning('Please enter a message.');
    }
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : 'closed'}`}>
      {/* Chatbot Toggle Button */}
      <div className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span className="chatbot-icon">🤖</span>
      </div>

      {/* Expanded Chat Body */}
      {isOpen && (
        <div className="chatbot-body">
          {user ? (
            <>
              <div className="chat-window">
                {messages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.role}`}>
                    <p>{msg.content}</p>
                  </div>
                ))}
                {isGenerating && (
                  <div className="chat-message assistant typing">
                    <p>Typing...</p>
                  </div>
                )}
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isGenerating}
                />
                <button onClick={handleSend} disabled={isGenerating}>
                  {isGenerating ? 'Sending...' : 'Send'}
                </button>
              </div>
            </>
          ) : (
            <div className="chatbot-login-prompt">
              <p>Please log in to use the chatbot.</p>
            </div>
          )}
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default ChatBot;

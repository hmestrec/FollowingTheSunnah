import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Authenticator } from '@aws-amplify/ui-react';
import './chatbot.css';

const API_URL = 'https://gys32ivdv4.execute-api.us-east-1.amazonaws.com/prd/openai'; // Updated to include the correct endpoint

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchChatResponse = async (userMessage) => {
    setIsGenerating(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userMessage }), // Pass userMessage to your API
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${errorText}`);
      }

      const data = await response.json();

      // Add the assistant's response to the chat messages
      if (data.assistantMessage) {
        setMessages((prev) => [
          ...prev,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: data.assistantMessage },
        ]);
      } else {
        throw new Error('No response from the server');
      }
    } catch (error) {
      console.error('Failed to fetch chat response:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
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
    <div className="chatbot-container">
      <div className="chatbot-header" onClick={() => setIsOpen(!isOpen)}>
        <span>{isOpen ? 'Close ChatBot' : 'Open ChatBot'}</span>
      </div>
      {isOpen && (
        <Authenticator>
          {({ signOut, user }) => (
            <div className="chatbot-body">
              {user ? (
                <>
                  <div className="chat-window">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`chat-message ${msg.role}`}
                        style={{
                          minHeight: '40px',
                          height: 'auto',
                          maxWidth: '250px',
                        }}
                      >
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
                  <button onClick={signOut} style={{ marginTop: '10px' }}>
                    Sign Out
                  </button>
                </>
              ) : (
                <p>Please log in to use the chatbot.</p>
              )}
            </div>
          )}
        </Authenticator>
      )}
      <ToastContainer />
    </div>
  );
};

export default ChatBot;

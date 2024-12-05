import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Authenticator } from '@aws-amplify/ui-react';
import './chatbot.css';

const API_URL = 'https://api.openai.com/v1/chat/completions';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false); // Track if the AI is generating a response

  const fetchChatResponse = async (userMessage) => {
    setIsGenerating(true); // Set "generating" state to true
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`, // Ensure the correct API key
            },
            body: JSON.stringify({
              model: 'ft:gpt-3.5-turbo-0125:followingsunnah::AaryDruC', // Ensure the correct model ID
              messages: [...messages, { role: 'user', content: userMessage }],
              max_tokens: 200,
            }),
          });
          
  
      const data = await response.json();
  
      // console.log('API Response:', data); // Log the full response to debug
  
      if (data.choices && data.choices.length > 0) {
        const assistantMessage = data.choices[0].message.content;
  
        setMessages((prev) => [
          ...prev,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: assistantMessage },
        ]);
      } else {
        throw new Error('No choices returned in the API response');
      }
    } catch (error) {
      //console.error('Failed to fetch chat response:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false); // Reset "generating" state
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
                          minHeight: '40px', // Minimum height for short messages
                          height: 'auto', // Adjust height based on content
                          maxWidth: '250px', // Optional: cap the width for long messages
                        }}
                      >
                        <p>{msg.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="chat-input">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your message..."
                      disabled={isGenerating} // Disable input while AI is generating a response
                    />
                    <button onClick={handleSend} disabled={isGenerating}>
                      {isGenerating ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                  <button onClick={signOut} style={{ marginTop: '10px' }}>Sign Out</button>
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

import React, { useState } from "react";
import { useAuth } from "../AuthContext"; // Import the AuthContext
import awsconfig from "../../aws-exports"; // Ensure this is correctly imported
import styles from "./ChatBot.module.css"; // Import the CSS module

const API_URL = awsconfig.aws_cloud_logic_custom.find(
  (api) => api.name === "chatbot"
)?.endpoint;

const ChatBot = () => {
  const { user } = useAuth(); // Use the AuthContext to get user info
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleToggleChatbot = () => {
    if (!user) {
      setShowPopup(true); // Show popup if not authenticated
      setTimeout(() => setShowPopup(false), 3000); // Auto-hide popup after 3 seconds
      return;
    }
    setIsOpen(!isOpen);
  };

  const fetchChatResponse = async (userMessage) => {
    setIsGenerating(true);

    try {
      const token = user.signInUserSession.idToken.jwtToken; // Get token from the user object

      const response = await fetch(`${API_URL}/openai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass the token for authentication
        },
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
          { role: "user", content: userMessage },
          { role: "assistant", content: data.choices[0].message.content },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch chat response:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = () => {
    if (userInput.trim()) {
      fetchChatResponse(userInput);
      setUserInput("");
    }
  };

  return (
    <div className={styles.chatbotContainer}>
      {/* Chatbot Toggle Button */}
      <div className={styles.chatbotToggle} onClick={handleToggleChatbot}>
        <span className={styles.chatbotIcon}>🤖</span>
        {showPopup && (
          <div className={styles.popup}>
            <p>Please log in to use the chatbot.</p>
          </div>
        )}
      </div>

      {/* Expanded Chat Body */}
      {isOpen && user && (
        <div className={styles.chatbotBody}>
          <div className={styles.chatWindow}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${styles.chatMessage} ${styles[msg.role]}`}
              >
                <p>{msg.content}</p>
              </div>
            ))}
            {isGenerating && (
              <div
                className={`${styles.chatMessage} ${styles.assistant} ${styles.typing}`}
              >
                <p>Typing...</p>
              </div>
            )}
          </div>
          <div className={styles.chatInput}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isGenerating}
              className={styles.inputField}
            />
            <button
              onClick={handleSend}
              disabled={isGenerating}
              className={styles.sendButton}
            >
              {isGenerating ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;

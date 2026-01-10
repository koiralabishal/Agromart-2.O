import React, { useState } from "react";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import { RiRobot2Line } from "react-icons/ri"; // Using a robot icon that looks closer to the image
import "./Styles/ChatView.css";

const ChatView = ({ onClose }) => {
  const [messages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hello! How can I help with your farm operations today?",
    },
    {
      id: 2,
      type: "user",
      text: "What's the optimal time to harvest wheat?",
    },
    {
      id: 3,
      type: "bot",
      text: "Optimal wheat harvest time depends on moisture content, usually around 18-20%.",
    },
  ]);

  return (
    <div className="chat-view-container">
      <div className="chat-header">
        <h1 className="chat-header-title">AI Farm Assistant</h1>
        {onClose && (
          <button className="chat-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        )}
      </div>

      <div className="chat-body">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message-row ${msg.type}`}>
            {msg.type === "bot" && <RiRobot2Line className="bot-avatar-icon" />}
            <div className={`message-content ${msg.type}`}>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-footer">
        <div className="chat-input-area">
          <input type="text" placeholder="Ask a question..." />
          <FaPaperPlane className="chat-send-icon" />
        </div>
      </div>
    </div>
  );
};

export default ChatView;

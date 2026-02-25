import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./Styles/ChatView.css";

const ChatView = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "bot",
      message:
        "Hello! I am your Agromart AI Assistant. How can I help with your farming or marketplace operations today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      message: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    // Create a placeholder for the bot message that will be updated streaming
    const botMessageId = Date.now() + 1;
    const initialBotMessage = {
      id: botMessageId,
      role: "bot",
      message: "",
    };
    
    setMessages((prev) => [...prev, initialBotMessage]);

    try {
      const response = await fetch("http://localhost:8001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to AI Assistant");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let cumulativeMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        cumulativeMessage += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId ? { ...msg, message: cumulativeMessage } : msg
          )
        );
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                message:
                  "Sorry, I'm having trouble connecting to the AgroMart AI service. Please ensure the backend is running.",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`chat-view-container ${isMaximized ? "maximized" : ""}`}>
      <div className="chat-header">
        <h1 className="chat-header-title">AI Farm Assistant</h1>
        <div className="chat-header-actions">
          <button
            className="chat-action-btn"
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? <FiMinimize2 /> : <FiMaximize2 />}
          </button>
          {onClose && (
            <button
              className="chat-close-btn"
              onClick={onClose}
              aria-label="Close Chat"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      <div className="chat-body">
        {messages.map((msg, index) => {
          const isLastMessage = index === messages.length - 1;
          const showTypingForThis = isLoading && isLastMessage && msg.role === "bot" && !msg.message;
          
          return (
            <div key={msg.id} className={`chat-message-row ${msg.role}`}>
              {msg.role === "bot" && <RiRobot2Line className="bot-avatar-icon" />}
              <div className={`message-content ${msg.role} ${showTypingForThis ? "typing" : ""}`}>
                {showTypingForThis ? (
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : msg.role === "bot" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.message}
                  </ReactMarkdown>
                ) : (
                  <p>{msg.message}</p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-footer">
        <form className="chat-input-area" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!input.trim() || isLoading}
          >
            <FaPaperPlane className="chat-send-icon" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;

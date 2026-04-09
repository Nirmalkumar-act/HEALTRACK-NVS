import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../api/api";
import "../styles/Chatbot.css";

// Emergency keywords that trigger instant frontend warning
const EMERGENCY_KEYWORDS = [
  "chest pain", "heart attack", "can't breathe", "cannot breathe",
  "shortness of breath", "unconscious", "suicide", "kill myself",
  "overdose", "stroke", "seizure", "severe bleeding", "choking",
  "not breathing", "losing consciousness", "dying"
];

const MAX_CHARS = 2000;

const WELCOME_MESSAGE = {
  id: "welcome",
  sender: "bot",
  text: "Hello! I'm the HealTrack AI Medical Assistant.\n\nI can help you understand symptoms, provide general health information, and guide you on when to seek professional care.\n\n**Please note:** I am not a substitute for professional medical advice. For emergencies, call **112** or **108** immediately.",
  isWelcome: true,
  timestamp: new Date()
};

// Simple markdown-to-HTML converter for bold, lists, line breaks
function renderMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "• $1")
    .replace(/\n/g, "<br/>");
}

function MessageBubble({ msg }) {
  const isBot = msg.sender === "bot";
  const isEmergency = msg.isEmergency;

  return (
    <div className={`ht-chat-row ${isBot ? "bot" : "user"} ${isEmergency ? "emergency" : ""}`}>
      {isBot && (
        <div className={`ht-avatar ${isEmergency ? "emergency-avatar" : ""}`}>
          {isEmergency ? "🚨" : "AI"}
        </div>
      )}
      <div className={`ht-bubble ${isBot ? "bot" : "user"} ${isEmergency ? "emergency-bubble" : ""} ${msg.isWelcome ? "welcome-bubble" : ""}`}>
        <div
          className="ht-bubble-text"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
        />
        {msg.timestamp && (
          <div className="ht-timestamp">
            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="ht-chat-row bot">
      <div className="ht-avatar">AI</div>
      <div className="ht-bubble bot typing-bubble">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}

function EmergencyBanner() {
  return (
    <div className="ht-emergency-banner">
      <span className="ht-emergency-icon">🚨</span>
      <div>
        <strong>Medical Emergency?</strong>
        <span> Call <a href="tel:112">112</a> or <a href="tel:108">108</a> immediately</span>
      </div>
    </div>
  );
}

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    if (val.length > MAX_CHARS) return;
    setInput(val);
    setCharCount(val.length);

    // Live emergency detection
    const lower = val.toLowerCase();
    const hasEmergency = EMERGENCY_KEYWORDS.some(kw => lower.includes(kw));
    setShowEmergencyBanner(hasEmergency);
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setCharCount(0);
    setLoading(true);
    setShowEmergencyBanner(false);

    try {
      const response = await api.post("/ai/chat", { message: trimmed });

      const reply = response.data?.reply || "No response received. Please try again.";
      const isEmergency = reply.startsWith("🚨");

      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: reply,
        isEmergency,
        timestamp: new Date()
      };

      // Slight delay for natural feel
      setTimeout(() => {
        setMessages(prev => [...prev, botMsg]);
        setLoading(false);
      }, 400);

    } catch (err) {
      const status = err.response?.status;
      let errorText = "⚠️ Unable to connect to AI assistant. Please check your connection and try again.";

      if (status === 400) {
        errorText = "⚠️ " + (err.response?.data?.reply || "Invalid request. Please rephrase your message.");
      } else if (status === 429) {
        errorText = "⚠️ The assistant is currently busy. Please wait a moment and try again.";
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: "bot",
        text: errorText,
        timestamp: new Date()
      }]);
      setLoading(false);
    }
  }, [input, loading]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setCharCount(0);
    setShowEmergencyBanner(false);
    inputRef.current?.focus();
  };

  const charPercent = (charCount / MAX_CHARS) * 100;
  const charWarning = charCount > MAX_CHARS * 0.85;

  return (
    <div className="ht-page">
      <div className="ht-container">

        {/* ── Header ── */}
        <div className="ht-header">
          <div className="ht-header-left">
            <div className="ht-header-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="#E8F4FD"/>
                <path d="M14 6v16M6 14h16" stroke="#1A6FA8" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1 className="ht-title">HealTrack AI Assistant</h1>
              <p className="ht-subtitle">Medical information support · Not a substitute for a doctor</p>
            </div>
          </div>
          <div className="ht-header-actions">
            <div className="ht-status-dot" title="Service online" />
            <button
              className="ht-clear-btn"
              onClick={clearChat}
              title="Clear conversation"
              aria-label="Clear conversation"
            >
              Clear
            </button>
          </div>
        </div>

        {/* ── Emergency Banner ── */}
        {showEmergencyBanner && <EmergencyBanner />}

        {/* ── Chat Area ── */}
        <div className="ht-chat-area" role="log" aria-live="polite" aria-label="Chat messages">
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* ── Disclaimer Strip ── */}
        <div className="ht-disclaimer">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0}}>
            <circle cx="7" cy="7" r="6" stroke="#8A9BB0" strokeWidth="1.2"/>
            <path d="M7 5v4M7 10v.5" stroke="#8A9BB0" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          For medical emergencies call 112 · Responses are informational only · Always consult a doctor
        </div>

        {/* ── Input Area ── */}
        <div className="ht-input-area">
          <div className="ht-input-wrapper">
            <textarea
              ref={inputRef}
              className="ht-input"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms or ask a health question... (Enter to send)"
              rows={2}
              aria-label="Type your health question"
              aria-multiline="true"
              disabled={loading}
            />
            {charCount > 0 && (
              <div className={`ht-char-count ${charWarning ? "warning" : ""}`}>
                {charCount}/{MAX_CHARS}
              </div>
            )}
          </div>
          <button
            className="ht-send-btn"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M18 10L3 3l3 7-3 7 15-7z" fill="currentColor"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";

import { chat } from "../utils/api";

export default function Chatbot({ isOpen, onClose }) {
  const [messages, setMessages] = useState(() => [
    {
      role: "bot",
      text: "Hi! Ask me about football, or how to use this app.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const canSend = useMemo(() => {
    return !isSending && input.trim().length > 0;
  }, [input, isSending]);

  useEffect(() => {
    if (!isOpen) return;
    // focus after render
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isOpen]);

  const send = async () => {
    if (!canSend) return;
    const userText = input.trim();
    setInput("");
    setIsSending(true);

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    try {
      const result = await chat(userText);
      const replyText = (result?.reply || "").toString().trim();
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: replyText || "I couldn't generate a reply for that. Try rephrasing.",
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "I couldn't reach the server right now. Make sure the backend is running.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-panel" role="dialog" aria-label="Chatbot">
      <div className="chatbot-header">
        <div className="chatbot-title">Chat</div>
        <button
          type="button"
          className="chatbot-close"
          onClick={onClose}
          aria-label="Close chatbot"
          title="Close"
        >
          ×
        </button>
      </div>

      <div className="chatbot-messages" ref={scrollRef}>
        {messages.map((m, idx) => (
          <div
            key={`${m.role}-${idx}`}
            className={`chatbot-message ${m.role === "user" ? "user" : "bot"}`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="chatbot-input-row">
        <input
          ref={inputRef}
          className="chatbot-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a question…"
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />
        <button
          type="button"
          className="btn-primary chatbot-send"
          onClick={send}
          disabled={!canSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}

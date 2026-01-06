import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Chatbot from "./Chatbot";

export default function BackButton({ fallbackTo = "/dashboard", className = "" }) {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackTo, { replace: true });
  };

  return (
    <div className={`floating-actions ${className}`.trim()}>
      <button
        type="button"
        className="btn-primary back-button"
        onClick={handleBack}
      >
        Back
      </button>

      <button
        type="button"
        className="btn-primary chat-icon-button"
        aria-label="Open chatbot"
        title="Chat"
        onClick={() => setIsChatOpen(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
        </svg>
      </button>

      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}

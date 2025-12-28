import React from "react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ fallbackTo = "/dashboard", className = "" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackTo, { replace: true });
  };

  return (
    <button
      type="button"
      className={`btn-primary back-button ${className}`.trim()}
      onClick={handleBack}
    >
      Back
    </button>
  );
}

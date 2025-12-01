// components/RatingMeter.jsx
import React from "react";
import "./RatingMeter.css";

export default function RatingMeter({ rating = 0 }) {
  const pct = Math.min(100, Math.max(0, (rating / 100) * 100));

  return (
    <div className="rating-meter">
      <div className="rating-fill" style={{ width: `${pct}%` }}></div>
      <span className="rating-value">{rating}</span>
    </div>
  );
}

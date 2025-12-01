// components/TeamRatingDisplay.jsx
import React, { useEffect, useState } from "react";
import "./TeamRatingDisplay.css";

export default function TeamRatingDisplay({ rating }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    let end = rating;
    let duration = 400; // ms
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      const eased = start + (end - start) * progress;
      setDisplayValue(Number(eased.toFixed(1)));

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [rating]);

  return (
    <div className="team-rating-display">
      ⭐ {displayValue}
      <div className="rating-bar">
        <div
          className="rating-bar-fill"
          style={{ width: `${(displayValue / 100) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}

// components/Pitch.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/Pitch.css";

export default function Pitch({
  pitchRef,
  formationPoints,
  assigned,
  players,
  allPlayers,
  onDrop,
  onRemovePlayer,
  movePlayersEnabled,
  drawArrowsEnabled,
  freePositions,
  setFreePositions,
  arrows,
  setArrows,
}) {
  const localPitchRef = useRef(null);
  const containerRef = pitchRef ?? localPitchRef;

  const [movingIndex, setMovingIndex] = useState(null);
  const [drawing, setDrawing] = useState(null); // { x1, y1, x2, y2 }

  const playerLookup = useMemo(() => {
    const merged = [...(players || []), ...(allPlayers || [])].filter(Boolean);
    const map = new Map();
    merged.forEach((p) => {
      if (p?.name) map.set(p.name, p);
    });
    return map;
  }, [players, allPlayers]);

  const getPercentFromEvent = (e) => {
    const el = containerRef?.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const clamp = (v) => Math.max(0, Math.min(100, v));
    return { xPercent: clamp(x), yPercent: clamp(y) };
  };

  // Global move listeners (drag player markers when movePlayersEnabled)
  useEffect(() => {
    if (!movePlayersEnabled) {
      setMovingIndex(null);
      return;
    }
    if (movingIndex === null) return;
    if (!setFreePositions) return;

    const onMouseMove = (e) => {
      const pos = getPercentFromEvent(e);
      if (!pos) return;
      setFreePositions((prev) => ({
        ...(prev || {}),
        [movingIndex]: pos,
      }));
    };

    const onMouseUp = () => setMovingIndex(null);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [movePlayersEnabled, movingIndex, setFreePositions]);

  // Global draw listeners (draw arrows when drawArrowsEnabled)
  useEffect(() => {
    if (!drawArrowsEnabled) {
      setDrawing(null);
      return;
    }
    if (!drawing) return;
    if (!setArrows) return;

    const onMouseMove = (e) => {
      const pos = getPercentFromEvent(e);
      if (!pos) return;
      setDrawing((prev) => (prev ? { ...prev, x2: pos.xPercent, y2: pos.yPercent } : prev));
    };

    const onMouseUp = () => {
      setArrows((prev) => {
        const next = Array.isArray(prev) ? [...prev] : [];
        // Avoid adding ultra-short arrows
        const dx = (drawing.x2 ?? drawing.x1) - drawing.x1;
        const dy = (drawing.y2 ?? drawing.y1) - drawing.y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= 1) {
          next.push({
            x1: drawing.x1,
            y1: drawing.y1,
            x2: drawing.x2 ?? drawing.x1,
            y2: drawing.y2 ?? drawing.y1,
          });
        }
        return next;
      });
      setDrawing(null);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [drawArrowsEnabled, drawing, setArrows]);

  return (
    <div
      ref={containerRef}
      className="pitch-container"
      onMouseDown={(e) => {
        if (!drawArrowsEnabled) return;
        // Don't start drawing if user clicks a player
        if (e.target.closest?.(".player-dot-wrapper")) return;
        const pos = getPercentFromEvent(e);
        if (!pos) return;
        setDrawing({ x1: pos.xPercent, y1: pos.yPercent, x2: pos.xPercent, y2: pos.yPercent });
      }}
      onDrop={(e) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData("text/plain");
        let payload = null;
        try {
          payload = raw ? JSON.parse(raw) : null;
        } catch (err) {
          console.error("Invalid drag payload:", err);
        }

        // Support either a raw player object or { player, ...meta }
        const player = payload?.player ?? payload;
        onDrop?.(e, player);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="goal-box left" />
      <div className="penalty-box left"></div>
      <div className="penalty-box left big"></div>
      <div className="center-line"></div>
      <div className="center-circle"></div>
      <div className="penalty-box right"></div>
      <div className="penalty-box right big"></div>
      <div className="goal-box right" />

      {/* Arrow annotations */}
      <svg className="pitch-annotations" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill="black" />
          </marker>
        </defs>
        {(arrows || []).map((a, i) => (
          <line
            key={i}
            x1={a.x1}
            y1={a.y1}
            x2={a.x2}
            y2={a.y2}
            stroke="black"
            strokeWidth="0.6"
            markerEnd="url(#arrowhead)"
          />
        ))}
        {drawing && (
          <line
            x1={drawing.x1}
            y1={drawing.y1}
            x2={drawing.x2}
            y2={drawing.y2}
            stroke="black"
            strokeWidth="0.6"
            markerEnd="url(#arrowhead)"
          />
        )}
      </svg>

      {formationPoints.map((p, index) => {
        const playerName = assigned?.[index];
        const playerObj = playerName ? playerLookup.get(playerName) : null;

        const free = freePositions?.[index];
        const left = (movePlayersEnabled && free ? free.xPercent : p.xPercent) + "%";
        const top = (movePlayersEnabled && free ? free.yPercent : p.yPercent) + "%";

        return (
          <div
            key={index}
            className="player-dot-wrapper"
            style={{ left, top }}
            onMouseDown={(e) => {
              if (!movePlayersEnabled) return;
              if (!playerObj) return;
              e.preventDefault();
              e.stopPropagation();
              setMovingIndex(index);
              const pos = getPercentFromEvent(e);
              if (pos && setFreePositions) {
                setFreePositions((prev) => ({ ...(prev || {}), [index]: pos }));
              }
            }}
          >
            {playerObj && (
              <div
                className="player-info-card"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePlayer?.(playerObj.name, index);
                }}
              >
                <strong>{playerObj.name}</strong>
                {onRemovePlayer && (
                  <>
                    <br />
                    {playerObj.position} — ⭐{playerObj.rating}
                  </>
                )}
              </div>
            )}

            <div
              className="player-dot"
              style={{ background: playerObj ? "#ffd700" : "#ffffff88" }}
            />
          </div>
        );
      })}
    </div>
  );
}

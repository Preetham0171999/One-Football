import React, { useEffect, useMemo, useRef, useState } from "react";
import { authFetch } from "../utils/api";
import Pitch from "../components/Pitch";
import { getFormationCoordinates } from "../utils/formationUtils";
import { buildTeamFromAssigned, getTeamRatings } from "../utils/ratingUtils";
import "./CompareAnalyses.css";

const SLOT_COUNT = 4;

function getFormationRolesBucketed(formation) {
  const [d, m, a] = (formation || "").split("-").map(Number);
  if (![d, m, a].every((n) => Number.isFinite(n))) return [];
  return [
    "goalkeeper",
    ...Array(d).fill("defense"),
    ...Array(m).fill("midfield"),
    ...Array(a).fill("attack"),
  ];
}

function toHorizontal(points) {
  return (points || []).map((p) => ({
    ...p,
    xPercent: p.yPercent,
    yPercent: 100 - p.xPercent,
  }));
}

function applyFreePositions(points, freePositions) {
  if (!freePositions) return points;
  return (points || []).map((p, idx) => {
    const free = freePositions[idx] || freePositions[String(idx)];
    if (!free) return p;
    return {
      ...p,
      xPercent: Number.isFinite(free.xPercent) ? free.xPercent : p.xPercent,
      yPercent: Number.isFinite(free.yPercent) ? free.yPercent : p.yPercent,
    };
  });
}

export default function CompareAnalyses() {
  const [analyses, setAnalyses] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const [selectedIds, setSelectedIds] = useState(Array(SLOT_COUNT).fill(""));
  const selectedIdsRef = useRef(selectedIds);
  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  const [slots, setSlots] = useState(
    Array(SLOT_COUNT)
      .fill(0)
      .map(() => ({ status: "empty", analysis: null }))
  );

  const loadAnalysesList = async () => {
    setIsLoadingList(true);
    try {
      const res = await authFetch(`/analysis`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setAnalyses(data.analyses || []);
    } catch (err) {
      console.error("Load analyses list failed:", err);
      setAnalyses([]);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    loadAnalysesList();
  }, []);

  const setSlot = (slotIndex, next) => {
    setSlots((prev) => {
      const copy = [...prev];
      copy[slotIndex] = next;
      return copy;
    });
  };

  const loadSlotData = async (slotIndex, analysisId) => {
    if (!analysisId) {
      setSlot(slotIndex, { status: "empty", analysis: null });
      return;
    }

    setSlot(slotIndex, { status: "loading", analysis: null });

    try {
      const res = await authFetch(`/analysis/${analysisId}`);
      if (!res.ok) throw new Error(await res.text());
      const analysis = await res.json();

      const teamName = analysis?.team;
      let allPlayers = [];
      if (teamName) {
        const pres = await authFetch(`/players/${teamName}`);
        if (!pres.ok) throw new Error(await pres.text());
        const pdata = await pres.json();
        allPlayers = pdata.players || [];
      }

      const formation = analysis?.formation || "4-3-3";
      const basePoints = getFormationCoordinates(formation) || [];
      const rotated = toHorizontal(basePoints);
      const formationPoints = applyFreePositions(rotated, analysis?.freePositions);

      const formationRoles = getFormationRolesBucketed(formation);
      const assigned = analysis?.assigned || {};
      const { team } = buildTeamFromAssigned(assigned, allPlayers, formationRoles);
      const rating = getTeamRatings(team).average;

      // Ignore stale responses (user changed dropdown mid-flight)
      if (selectedIdsRef.current[slotIndex] !== String(analysisId)) return;

      setSlot(slotIndex, {
        status: "ready",
        analysis: {
          ...analysis,
          formation,
          formationPoints,
          allPlayers,
          rating,
        },
      });
    } catch (err) {
      console.error("Load compare slot failed:", err);
      if (selectedIdsRef.current[slotIndex] !== String(analysisId)) return;
      setSlot(slotIndex, {
        status: "error",
        error: String(err?.message || err),
        analysis: null,
      });
    }
  };

  const handleSelect = (slotIndex, value) => {
    setSelectedIds((prev) => {
      const next = [...prev];
      next[slotIndex] = value;
      return next;
    });
    loadSlotData(slotIndex, value);
  };

  const analysisOptions = useMemo(() => {
    return (analyses || []).map((a) => ({
      id: String(a.id),
      label: `${a.name || "(unnamed)"}${a.team ? ` — ${a.team}` : ""}`,
    }));
  }, [analyses]);

  return (
    <div className="compare-analyses-container">
      <div className="compare-header">
        <h2>Compare saved analyses</h2>
        <button
          type="button"
          className="compare-refresh"
          onClick={loadAnalysesList}
          disabled={isLoadingList}
        >
          {isLoadingList ? "Loading…" : "Refresh"}
        </button>
      </div>

      <div className="compare-controls">
        {Array(SLOT_COUNT)
          .fill(0)
          .map((_, i) => (
            <div className="compare-control" key={i}>
              <label className="compare-label">Slot {i + 1}</label>
              <select
                className="compare-select"
                value={selectedIds[i]}
                onChange={(e) => handleSelect(i, e.target.value)}
                disabled={isLoadingList}
              >
                <option value="">(empty)</option>
                {analysisOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
      </div>

      <div className="compare-grid">
        {slots.map((slot, i) => {
          if (slot.status === "empty") {
            return (
              <div key={i} className="compare-card compare-card--empty">
                <div className="compare-card-title">Slot {i + 1}</div>
                <div className="compare-card-subtitle">Select an analysis to view</div>
              </div>
            );
          }

          if (slot.status === "loading") {
            return (
              <div key={i} className="compare-card">
                <div className="compare-card-title">Slot {i + 1}</div>
                <div className="compare-card-subtitle">Loading…</div>
              </div>
            );
          }

          if (slot.status === "error") {
            return (
              <div key={i} className="compare-card">
                <div className="compare-card-title">Slot {i + 1}</div>
                <div className="compare-card-subtitle">Failed to load</div>
                <pre className="compare-error">{slot.error}</pre>
              </div>
            );
          }

          const a = slot.analysis;
          const points = a?.formationPoints || [];
          const assigned = a?.assigned || {};
          const allPlayers = a?.allPlayers || [];
          const arrows = a?.arrows || [];

          return (
            <div key={i} className="compare-card">
              <div className="compare-card-title">{a?.name || `Slot ${i + 1}`}</div>
              <div className="compare-meta">
                <div>Team: {a?.team || "—"}</div>
                <div>Formation: {a?.formation || "—"}</div>
                <div>Rating: ⭐ {Number(a?.rating || 0).toFixed(2)}</div>
              </div>

              <div className="compare-pitch-wrapper">
                <Pitch
                  formationPoints={points}
                  assigned={assigned}
                  players={[]}
                  allPlayers={allPlayers}
                  onDrop={undefined}
                  onRemovePlayer={undefined}
                  movePlayersEnabled={false}
                  drawArrowsEnabled={false}
                  freePositions={{}}
                  setFreePositions={undefined}
                  arrows={arrows}
                  setArrows={undefined}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authFetch } from "../utils/api";

import "./AddTeam.css";

export default function AddTeam() {
  const navigate = useNavigate();
  const location = useLocation();

  const emptyPlayers = useMemo(
    () => Array.from({ length: 11 }, () => ({ name: "", position: "", rating: "" })),
    []
  );

  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState(emptyPlayers);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const backTo = location.state?.from || "/team";

  const validate = () => {
    const name = (teamName || "").trim();
    if (!name) return { ok: false, message: "Team name is required" };

    const normalizedPlayers = players.map((pl) => ({
      name: (pl.name || "").trim(),
      position: (pl.position || "").trim(),
      rating: (pl.rating || "").trim(),
    }));

    for (let i = 0; i < normalizedPlayers.length; i++) {
      if (!normalizedPlayers[i].name) {
        return { ok: false, message: `Player ${i + 1} name is required` };
      }
      if (!normalizedPlayers[i].position) {
        return { ok: false, message: `Player ${i + 1} position is required` };
      }
      if (normalizedPlayers[i].rating) {
        const r = Number(normalizedPlayers[i].rating);
        if (!Number.isFinite(r) || r < 1 || r > 99) {
          return { ok: false, message: `Player ${i + 1} rating must be 1-99` };
        }
      }
    }

    return { ok: true, name, normalizedPlayers };
  };

  const onCreate = async () => {
    setError("");

    const result = validate();
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSaving(true);
    try {
      await authFetch(`/custom-teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.name,
          players: result.normalizedPlayers.map((p) => ({
            name: p.name,
            position: p.position,
            rating: p.rating ? Number(p.rating) : undefined,
          })),
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          const detail = payload?.detail || "Failed to create team";
          throw new Error(detail);
        }
        return res.json();
      });

      navigate(`/team?team=${encodeURIComponent(result.name)}`, { replace: true });
    } catch (e) {
      setError(e?.message || "Failed to create team");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-team-page">
      <div className="bg-panel add-team-panel" role="main" aria-label="Add custom team">
        <div className="modal-header">
          <h3>Create your team</h3>
          <button
            type="button"
            className="modal-close"
            onClick={() => navigate(backTo)}
            disabled={saving}
          >
            Back
          </button>
        </div>

        <div className="modal-body">
          <label className="modal-label">
            Team name
            <input
              className="modal-input"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g., My Dream XI"
            />
          </label>

          <div className="modal-subtitle">11 Players</div>

          <div className="custom-team-grid">
            {players.map((p, idx) => (
              <div key={idx} className="custom-player-row">
                <div className="custom-player-index">{idx + 1}</div>
                <input
                  className="modal-input"
                  value={p.name}
                  onChange={(e) => {
                    const next = [...players];
                    next[idx] = { ...next[idx], name: e.target.value };
                    setPlayers(next);
                  }}
                  placeholder="Player name"
                />

                <select
                  className="modal-select"
                  value={p.position}
                  onChange={(e) => {
                    const next = [...players];
                    next[idx] = { ...next[idx], position: e.target.value };
                    setPlayers(next);
                  }}
                >
                  <option value="">Position</option>
                  <option value="Goalkeeper">Goalkeeper</option>
                  <option value="Defender">Defender</option>
                  <option value="Midfielder">Midfielder</option>
                  <option value="Forward">Forward</option>
                </select>

                <input
                  className="modal-input"
                  value={p.rating}
                  onChange={(e) => {
                    const next = [...players];
                    next[idx] = { ...next[idx], rating: e.target.value };
                    setPlayers(next);
                  }}
                  placeholder="Rating (1-99)"
                  inputMode="numeric"
                />
              </div>
            ))}
          </div>

          {error && <div className="modal-error">{error}</div>}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="modal-secondary"
            onClick={() => navigate(backTo)}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="button" className="modal-primary" disabled={saving} onClick={onCreate}>
            {saving ? "Saving…" : "Create Team"}
          </button>
        </div>
      </div>
    </div>
  );
}

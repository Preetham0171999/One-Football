import React, { useEffect, useMemo, useState } from "react";
import { authFetch } from "../utils/api";
import "../styles/auth.css";
import "./StaticPanel.css";

function normalizeTeamKey(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function getStrategyForTeam(teamName) {
  const key = normalizeTeamKey(teamName);

  const presets = {
    arsenal: {
      formation: "4-3-3",
      style: "Positional play, controlled build-up, aggressive counter-press",
      keys: ["Overloads in half-spaces", "High line + compact rest defense", "Quick switches to isolate wingers"],
    },
    barcelona: {
      formation: "4-3-3",
      style: "Patient build-up, third-man runs, dominate possession",
      keys: ["Play through midfield triangles", "Use fullbacks for width", "Press immediately after loss"],
    },
    bayernmunich: {
      formation: "4-2-3-1",
      style: "High press, fast wing progression, relentless chance creation",
      keys: ["Win ball high", "Attack wide then cut-backs", "Vertical passes into the 10"],
    },
    juventus: {
      formation: "3-5-2",
      style: "Compact mid-block, controlled transitions, strong central presence",
      keys: ["Protect central zones", "Progress via wing-backs", "Direct play to split strikers"],
    },
    liverpool: {
      formation: "4-3-3",
      style: "Intense pressing, rapid transitions, wide overloads",
      keys: ["Counter-pressing triggers", "Early crosses and cut-backs", "Run beyond the back line"],
    },
    manchesterunited: {
      formation: "4-2-3-1",
      style: "Transition-focused, quick vertical attacks, exploit space behind",
      keys: ["Fast breaks after regain", "Isolate winger 1v1", "Protect build-up with double pivot"],
    },
    psg: {
      formation: "4-3-3",
      style: "Control with talent, isolate star attackers, attack the box quickly",
      keys: ["Create 1v1s in wide areas", "Underlaps from midfield", "Fast combinations near the box"],
    },
    realmadrid: {
      formation: "4-3-3",
      style: "Flexible structure, big-game transitions, patient probing",
      keys: ["Switch tempo on cue", "Exploit half-space runs", "Protect counters with smart rest defense"],
    },
  };

  const preset = presets[key];
  if (preset) return preset;

  return {
    formation: "4-3-3",
    style: "Balanced build-up, disciplined defending, quick transitions",
    keys: ["Keep compact shape", "Progress via wide channels", "Create 2v1s near the touchline"],
  };
}

export default function Strategies() {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTeams = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await authFetch("/teams");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTeams(Array.isArray(data?.teams) ? data.teams : []);
    } catch (err) {
      console.error("Teams fetch failed:", err);
      setTeams([]);
      setError(String(err?.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const rows = useMemo(() => {
    return (teams || []).map((team) => ({
      team,
      ...getStrategyForTeam(team),
    }));
  }, [teams]);

  return (
    <div className="auth-page">
      <div className="bg-panel no-bg static-panel" style={{ maxWidth: 900, width: "92%", padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ margin: 0 }}>Strategies</h2>
          <button
            type="button"
            className="btn-primary"
            onClick={loadTeams}
            disabled={isLoading}
            style={{ width: "auto", padding: "0.55rem 0.9rem", fontSize: "1rem" }}
          >
            {isLoading ? "Loading…" : "Refresh"}
          </button>
        </div>

        <p style={{ marginTop: 8, color: "#ddd" }}>
          Best-fit tactical ideas for each team (formation + playstyle).
        </p>

        {error && (
          <div style={{ marginTop: 10, color: "#ffd700", fontWeight: 600 }}>
            {error}
          </div>
        )}

        {!isLoading && !error && rows.length === 0 && (
          <div style={{ marginTop: 10, color: "#ddd" }}>No teams found.</div>
        )}

        {rows.length > 0 && (
          <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
            {rows.map((r) => (
              <div
                key={r.team}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: "rgba(0, 0, 0, 0.25)",
                  color: "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 800 }}>{r.team}</div>
                  <div style={{ color: "#ddd" }}>
                    Formation: <strong style={{ color: "#fff" }}>{r.formation}</strong>
                  </div>
                </div>

                <div style={{ marginTop: 6, color: "#ddd" }}>{r.style}</div>

                <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 18, color: "#ddd" }}>
                  {r.keys.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

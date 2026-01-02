import React, { useEffect, useMemo, useState } from "react";
import { authFetch } from "../utils/api";
import "../styles/auth.css";
import "./StaticPanel.css";
import "./Leagues.css";

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

export default function Leagues() {
  const [leagueInput, setLeagueInput] = useState("");
  const [leagues, setLeagues] = useState([]);
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(false);

  const [table, setTable] = useState([]);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [error, setError] = useState("");

  const leaguesByKey = useMemo(() => {
    const map = new Map();
    (leagues || []).forEach((l) => {
      if (!l) return;
      if (l.id) map.set(normalize(l.id), l);
      if (l.name) map.set(normalize(l.name), l);
      if (l.abbr) map.set(normalize(l.abbr), l);
    });
    return map;
  }, [leagues]);

  const selectedLeague = useMemo(() => {
    return leaguesByKey.get(normalize(leagueInput)) || null;
  }, [leaguesByKey, leagueInput]);

  const loadLeagues = async () => {
    setIsLoadingLeagues(true);
    setError("");
    try {
      const res = await authFetch(`/leagues`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setLeagues(data.leagues || []);
    } catch (err) {
      console.error("Leagues fetch failed:", err);
      setLeagues([]);
      setError(String(err?.message || err));
    } finally {
      setIsLoadingLeagues(false);
    }
  };

  const loadStandings = async (leagueId) => {
    if (!leagueId) return;
    setIsLoadingTable(true);
    setError("");
    try {
      const season = new Date().getFullYear();
      const res = await authFetch(`/leagues/${encodeURIComponent(leagueId)}/standings?season=${season}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTable(data.standings || []);
    } catch (err) {
      console.error("Standings fetch failed:", err);
      setTable([]);
      setError(String(err?.message || err));
    } finally {
      setIsLoadingTable(false);
    }
  };

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    if (!selectedLeague?.id) return;
    loadStandings(selectedLeague.id);
  }, [selectedLeague?.id]);

  return (
    <div className="auth-page">
      <div className="bg-panel no-bg static-panel leagues-panel">
        <div className="leagues-header">
          <h2>Leagues</h2>
          <button
            type="button"
            className="btn-primary leagues-refresh"
            onClick={loadLeagues}
            disabled={isLoadingLeagues}
          >
            {isLoadingLeagues ? "Loading…" : "Refresh"}
          </button>
        </div>

        <div className="leagues-controls">
          <label className="leagues-label">Select a league</label>
          <input
            className="leagues-input"
            list="league-options"
            value={leagueInput}
            onChange={(e) => setLeagueInput(e.target.value)}
            placeholder={isLoadingLeagues ? "Loading leagues…" : "Type league name (e.g., Premier League)"}
            disabled={isLoadingLeagues}
            autoComplete="off"
          />
          <datalist id="league-options">
            {(leagues || []).map((l) => (
              <option key={l.id} value={l.name || l.id} />
            ))}
          </datalist>

          {selectedLeague && (
            <div className="leagues-selected">
              Selected: <strong>{selectedLeague.name}</strong>
              {selectedLeague.abbr ? ` (${selectedLeague.abbr})` : ""}
            </div>
          )}
        </div>

        {error && <div className="leagues-error">{error}</div>}

        <div className="leagues-table-wrap">
          {isLoadingTable && <div className="leagues-muted">Loading table…</div>}

          {!isLoadingTable && !error && selectedLeague && table.length === 0 && (
            <div className="leagues-muted">No table available.</div>
          )}

          {!isLoadingTable && table.length > 0 && (
            <table className="leagues-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team</th>
                  <th>P</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>GD</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row) => (
                  <tr key={row.teamId || row.teamName || row.rank}>
                    <td>{row.rank}</td>
                    <td>{row.teamName}</td>
                    <td>{row.played}</td>
                    <td>{row.wins}</td>
                    <td>{row.draws}</td>
                    <td>{row.losses}</td>
                    <td>{row.goalDifference}</td>
                    <td>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

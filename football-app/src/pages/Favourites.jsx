import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/api";
import { getFavouriteTeams, toggleFavouriteTeam } from "../utils/favourites";
import "./Favourites.css";

export default function Favourites() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [favourites, setFavourites] = useState(() => getFavouriteTeams());
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadTeams() {
      setLoading(true);
      setError("");
      try {
        const res = await authFetch("/teams");
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(data?.teams) ? data.teams : [];
        if (mounted) setTeams(list);
      } catch (e) {
        if (mounted) setError("Failed to load teams");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadTeams();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredTeams = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((t) => String(t).toLowerCase().includes(q));
  }, [teams, query]);

  const onToggle = (team) => {
    const next = toggleFavouriteTeam(team);
    setFavourites(next);
  };

  const favouritesSorted = useMemo(() => {
    return [...favourites].sort((a, b) => a.localeCompare(b));
  }, [favourites]);

  return (
    <div className="favourites-page">
      <div className="bg-panel static-panel favourites-panel">
        <div className="favourites-header">
          <h2>Favourites</h2>
          <p className="favourites-subtitle">
            Pick teams you want to follow and jump to their stats anytime.
          </p>
        </div>

        <div className="favourites-section">
          <div className="favourites-section-title">
            Your favourite teams ({favouritesSorted.length})
          </div>

          {favouritesSorted.length === 0 ? (
            <div className="favourites-empty">No favourites yet. Add some below.</div>
          ) : (
            <div className="favourites-chips">
              {favouritesSorted.map((team) => (
                <div key={team} className="favourites-chip">
                  <span className="favourites-chip-name">{team}</span>
                  <div className="favourites-chip-actions">
                    <button
                      type="button"
                      className="btn-primary favourites-chip-btn"
                      onClick={() => navigate(`/team?team=${encodeURIComponent(team)}`)}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      className="favourites-chip-remove"
                      onClick={() => onToggle(team)}
                      aria-label={`Remove ${team} from favourites`}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="favourites-section">
          <div className="favourites-toolbar">
            <div className="favourites-section-title">All teams</div>
            <input
              className="favourites-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teams…"
            />
          </div>

          {loading && <div className="favourites-muted">Loading teams…</div>}
          {error && <div className="favourites-error">{error}</div>}

          {!loading && !error && (
            <div className="favourites-list">
              {filteredTeams.map((team) => {
                const name = String(team);
                const checked = favourites.includes(name);
                return (
                  <label key={name} className="favourites-row">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(name)}
                    />
                    <span className="favourites-row-name">{name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

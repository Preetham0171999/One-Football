import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/api";
import "../styles/auth.css";
import "./News.css";

function formatPublished(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export default function News() {
  const [items, setItems] = useState([]);
  const [source, setSource] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await authFetch(`/news/latest`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(data.items || []);
      setSource(data.source || "");
    } catch (err) {
      console.error("News fetch failed:", err);
      setItems([]);
      setSource("");
      setError(String(err?.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="auth-page">
      <div className="bg-panel no-bg news-panel">
        <div className="news-header">
          <h2>Latest football news</h2>
          <button
            type="button"
            className="btn-primary news-refresh"
            onClick={load}
            disabled={isLoading}
          >
            {isLoading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {error && <div className="news-error">{error}</div>}

        {!error && !isLoading && items.length === 0 && (
          <div className="news-muted">No news available right now.</div>
        )}

        <ul className="news-list">
          {items.map((n) => (
            <li key={`${n.link || ""}-${n.title || ""}`} className="news-item">
              <a
                className="news-link"
                href={n.link}
                target="_blank"
                rel="noreferrer"
              >
                {n.title}
              </a>
              {n.published && (
                <div className="news-date">{formatPublished(n.published)}</div>
              )}
            </li>
          ))}
        </ul>

        {source && <div className="news-source">Source: {source}</div>}
      </div>
    </div>
  );
}

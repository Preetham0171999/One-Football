const STORAGE_KEY = "favouriteTeams";

export function getFavouriteTeams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setFavouriteTeams(teams) {
  const unique = Array.from(new Set((teams || []).map(String))).filter(Boolean);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  return unique;
}

export function toggleFavouriteTeam(teamName) {
  const team = String(teamName || "").trim();
  if (!team) return getFavouriteTeams();

  const current = getFavouriteTeams();
  const exists = current.includes(team);
  const next = exists ? current.filter((t) => t !== team) : [...current, team];
  return setFavouriteTeams(next);
}

export function isFavouriteTeam(teamName) {
  const team = String(teamName || "").trim();
  if (!team) return false;
  return getFavouriteTeams().includes(team);
}

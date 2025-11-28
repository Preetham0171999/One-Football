// src/utils/ratingUtils.js

// normalize incoming position strings into our canonical buckets


export function normalizePosition(pos) {
  if (!pos || typeof pos !== "string") return "";

  const p = pos.toLowerCase();

  if (p === "goalkeeper") return "goalkeeper";
  if (p === "defender") return "defense";
  if (p === "midfielder") return "midfield";
  if (p === "forward") return "attack";

  return "";
}


/**
 * Adjust a single player's rating depending on their natural position vs assigned role.
 * - If same role (normalized) => full rating
 * - If different role (and assigned is goalkeeper) => special handling (we choose 0.5 penalty)
 * - Else => 0.8 multiplier as requested
 *
 * @param {Object} player - { name, position, rating }
 * @param {string} assignedRole - "defense"|"midfield"|"attack"|"goalkeeper"
 * @param {Object} [opts] - optional thresholds/multipliers
 */
export function getAdjustedRating(player, assignedRole, opts = {}) {
  if (!player) return 0;
  const { goalkeeperMultiplier = 0.5, crossPositionMultiplier = 0.8 } = opts;

  const actual = normalizePosition(player.position);
  const assigned = (assignedRole || "").toLowerCase();

  if (!actual || !assigned) return player.rating || 0;

  // same role -> full rating
  if (actual === assigned) return player.rating;

  // goalkeeper special handling: if assigned is goalkeeper but player isn't, heavy penalty
  if (assigned === "goalkeeper" && actual !== "goalkeeper") {
    return (player.rating || 0) * goalkeeperMultiplier;
  }

  // otherwise different out-of-position multiplier
  return (player.rating || 0) * crossPositionMultiplier;
}

/**
 * Compute total + average + breakdown from a "team" object:
 * team = { defense: [playerObj], midfield: [...], attack: [...], goalkeeper: [...] }
 *
 * Returns { total, average, counts: { defense, midfield, attack, goalkeeper } }
 */
export function getTeamRatings(team = {}, opts = {}) {
  const roles = ["defense", "midfield", "attack", "goalkeeper"];
  let total = 0;
  let count = 0;
  const counts = { defense: 0, midfield: 0, attack: 0, goalkeeper: 0 };
  const breakdown = { defense: 0, midfield: 0, attack: 0, goalkeeper: 0 };

  roles.forEach(role => {
    const list = Array.isArray(team[role]) ? team[role] : [];
    list.forEach(player => {
      const adjusted = getAdjustedRating(player, role, opts);
      breakdown[role] += adjusted;
      counts[role] += 1;
      total += adjusted;
      count += 1;
    });
  });

  const average = count > 0 ? Number((total / count).toFixed(2)) : 0;
  return { total: Number(total.toFixed(2)), average, counts, breakdown };
}

/**
 * Helper: build a `team` object from assigned mapping (slotIndex -> playerName),
 * given an array allPlayers (full roster) and formationRoles (array mapping slotIndex->role).
 *
 * Returns { team, missing: [playerNamesNotFound] }
 */
export function buildTeamFromAssigned(assigned = {}, allPlayers = [], formationRoles = []) {
  const newTeam = { defense: [], midfield: [], attack: [], goalkeeper: [] };
  const missing = [];

  Object.entries(assigned).forEach(([slotIndexStr, playerName]) => {
    const slotIndex = Number(slotIndexStr);
    const role = formationRoles[slotIndex];
    if (!role) {
      // ignore unrecognized slots
      return;
    }

    const playerObj = allPlayers.find(p => p.name === playerName);
    if (playerObj) {
      newTeam[role] = newTeam[role] || [];
      newTeam[role].push(playerObj);
    } else {
      missing.push(playerName);
    }
  });

  return { team: newTeam, missing };
}

// utils/dragUtils.js
import { buildTeamFromAssigned, getTeamRatings } from "./ratingUtils";

export function handleDragStart(e, player) {
  e.dataTransfer.setData("text/plain", JSON.stringify(player));
}

export function createHandleDrop({
  formationPoints,
  setAssigned,
  setPlayers,
  setSubs,
  side,
  flipY,
  playerList,
  formationRoles,
  setTeamRating,
}) {
  return function handleDrop(e, player) {
    if (!e?.currentTarget || !player) return;

    const rect = e.currentTarget.getBoundingClientRect();

    let dropX = ((e.clientX - rect.left) / rect.width) * 100;
    let dropY = ((e.clientY - rect.top) / rect.height) * 100;

    const shouldFlipY = typeof flipY === "boolean" ? flipY : side === "right";

    // ✅ Flip Y only when requested (match bottom-half pitch logic)
    if (shouldFlipY) {
      dropY = 100 - dropY;
    }

    let closestIndex = null;
    let smallestDist = Infinity;

    formationPoints.forEach((p, index) => {
      const dx = p.xPercent - dropX;
      const dy = p.yPercent - dropY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < smallestDist) {
        smallestDist = dist;
        closestIndex = index;
      }
    });

    if (closestIndex === null) return;

    setAssigned((prev) => {
      const updated = { ...prev };
      const existingPlayerName = prev[closestIndex];

      // ✅ Only manage subs if setSubs + side exist
      if (setSubs && side) {
        setSubs((prevSubs) => {
          let next = prevSubs[side].filter(
            (p) => p.name !== player.name
          );

          if (
            existingPlayerName &&
            existingPlayerName !== player.name
          ) {
            const existingPlayer = playerList.find(
              (p) => p.name === existingPlayerName
            );

            if (
              existingPlayer &&
              !next.some((p) => p.name === existingPlayer.name)
            ) {
              next = [...next, existingPlayer];
            }
          }

          return { ...prevSubs, [side]: next };
        });
      }

      updated[closestIndex] = player.name;

      const { team } = buildTeamFromAssigned(
        updated,
        playerList,
        formationRoles
      );

      setTeamRating(getTeamRatings(team).average);
      return updated;
    });

    setPlayers((prev) =>
      prev.filter((p) => p.name !== player.name)
    );
  };
}


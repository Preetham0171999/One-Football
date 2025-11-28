// src/utils/formationUtils.js

// Map each formation to number of players in each "line"

import "../components/TeamBuilder.css"

// src/utils/formationUtils.js

// src/utils/formationUtils.js

export const formationMap = {
  "4-3-3": [4, 3, 3],
  "4-4-2": [4, 4, 2],
  "3-5-2": [3, 5, 2],
  "4-2-3-1": [4, 2, 3, 1],
};

// Generate coordinates (PERCENT based!)
export function getFormationCoordinates(formation) {
  const structure = formationMap[formation];
  if (!structure) return [];

  const points = [];
  const totalLines = structure.length;

  structure.forEach((count, lineIndex) => {
    const y = ((lineIndex + 1) / (totalLines + 1)) * 100;  // PERCENT
    const gap = 100 / (count + 1);

    for (let i = 0; i < count; i++) {
      points.push({
        xPercent: (i + 1) * gap,  // IMPORTANT
        yPercent: y,
      });
    }
  });

  return points;
}

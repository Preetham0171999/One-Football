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

  // Generate all field players (lines from top to bottom)
  structure.forEach((count, lineIndex) => {
    const y = ((lineIndex + 1) / (totalLines + 1)) * 100; // vertical %
    const gap = 100 / (count + 1); // horizontal spacing

    for (let i = 0; i < count; i++) {
      points.push({
        xPercent: (i + 1) * gap,
        yPercent: y,
      });
    }
  });

  // Add goalkeeper at the top (opposite side) so it does not interfere with formation lines
  points.unshift({
    xPercent: 50,   // center horizontally
    yPercent: 5,    // near top
    role: "goalkeeper" // optional
  });

  return points;
}

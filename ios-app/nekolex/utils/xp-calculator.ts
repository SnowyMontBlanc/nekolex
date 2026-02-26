// XP thresholds for each level
// Level N requires LEVEL_THRESHOLDS[N-1] total XP
const LEVEL_THRESHOLDS = [
  0,    // Lv1: 0 XP
  100,  // Lv2: 100 XP
  250,  // Lv3: 250 XP
  500,  // Lv4: 500 XP
  800,  // Lv5: 800 XP
  1200, // Lv6: 1200 XP
  1700, // Lv7: 1700 XP
  2300, // Lv8: 2300 XP
  3000, // Lv9: 3000 XP
  4000, // Lv10: 4000 XP
];

// XP rewards
export const XP_REWARDS = {
  DISCOVER_BREED: 10,
  QUIZ_CORRECT: 5,
  QUIZ_PERFECT: 20,
} as const;

export function calculateLevel(totalXp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function xpForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    // Beyond defined levels, use a formula
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (currentLevel - LEVEL_THRESHOLDS.length) * 1500;
  }
  return LEVEL_THRESHOLDS[currentLevel]; // currentLevel is 1-indexed, so this is the next level threshold
}

export function xpProgress(totalXp: number): {
  current: number;
  required: number;
  percentage: number;
} {
  const level = calculateLevel(totalXp);
  const currentLevelXp = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextLevelXp = xpForNextLevel(level);
  const progressXp = totalXp - currentLevelXp;
  const requiredXp = nextLevelXp - currentLevelXp;

  return {
    current: progressXp,
    required: requiredXp,
    percentage: requiredXp > 0 ? Math.min((progressXp / requiredXp) * 100, 100) : 100,
  };
}

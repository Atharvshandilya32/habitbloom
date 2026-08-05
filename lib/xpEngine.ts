export const XP_CONSTANTS = {
  HABIT_COMPLETION: 10,
  STREAK_BONUS: 5,
};

export function getLevelFromXp(xp: number): number {
  // Level requirement is (level - 1) * level * 50
  // Lvl 1 = 0 XP, Lvl 2 = 100 XP, Lvl 3 = 300 XP
  let level = 1;
  while (xp >= (level) * (level + 1) * 50) {
    level++;
  }
  return level;
}

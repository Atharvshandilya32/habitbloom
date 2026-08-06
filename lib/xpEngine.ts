import { Habit, HabitLog } from './habitTypes';
import { getCurrentStreak } from './habitUtils';

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

/**
 * Calculates the total XP earned by a user based on their habit logs and streaks.
 */
export function calculateTotalXp(habits: Habit[], logs: HabitLog): number {
  if (!logs) return 0;

  // 1. Base XP from all completed logs
  const completedLogsCount = Object.keys(logs).filter((key) => logs[key] === true).length;
  let totalXp = completedLogsCount * XP_CONSTANTS.HABIT_COMPLETION;

  // 2. Bonus XP for current streaks
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  habits.forEach((habit) => {
    const streak = getCurrentStreak(habit, logs, year, month, daysInMonth);
    if (streak > 2) {
      // Small bonus for maintaining a streak (e.g. 5 XP per day of streak over 2)
      totalXp += (streak - 2) * XP_CONSTANTS.STREAK_BONUS;
    }
  });

  return totalXp;
}

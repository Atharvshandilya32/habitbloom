import { Habit, HabitLog } from './habitTypes';
import { getCurrentStreak } from './habitUtils';

export const XP_CONSTANTS = {
  HABIT_COMPLETION: 10,
  STREAK_BONUS: 5,
};

export function getLevelFromXp(xp: number): number {
  let level = 1;
  while (xp >= (level) * (level + 1) * 50) {
    level++;
  }
  return level;
}

export function getXpForLevel(level: number): number {
  return (level - 1) * level * 50;
}

export interface UniverseTier {
  level: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  motivation: string;
}

export const UNIVERSE_TIERS: UniverseTier[] = [
  { level: 1, title: 'Seed', subtitle: 'A new beginning in the soil', icon: '🌱', color: 'from-emerald-400 to-emerald-600', motivation: 'Every giant oak was once a seed.' },
  { level: 3, title: 'Sprout', subtitle: 'Breaking through the surface', icon: '🌿', color: 'from-emerald-500 to-teal-500', motivation: 'You have broken through the resistance.' },
  { level: 5, title: 'Tree', subtitle: 'Rooted firmly in discipline', icon: '🌳', color: 'from-teal-500 to-cyan-600', motivation: 'You are building a foundation that will last.' },
  { level: 8, title: 'Forest', subtitle: 'A thriving ecosystem of habits', icon: '🌲', color: 'from-cyan-500 to-blue-600', motivation: 'Your consistency is shaping your environment.' },
  { level: 12, title: 'Island', subtitle: 'A sanctuary of focus', icon: '🏝', color: 'from-blue-500 to-indigo-600', motivation: 'You have created an oasis of discipline.' },
  { level: 16, title: 'Mountain', subtitle: 'Reaching new peaks', icon: '⛰', color: 'from-indigo-500 to-violet-600', motivation: 'The climb was hard, but the view is breathtaking.' },
  { level: 20, title: 'Kingdom', subtitle: 'Master of your own domain', icon: '🏰', color: 'from-violet-500 to-purple-600', motivation: 'You are the architect of your own life.' },
  { level: 25, title: 'Earth Guardian', subtitle: 'Protector of the long-term vision', icon: '🌎', color: 'from-purple-500 to-fuchsia-600', motivation: 'You inspire your future self and those around you.' },
  { level: 35, title: 'Solar Architect', subtitle: 'Radiating energy and progress', icon: '☀️', color: 'from-fuchsia-500 to-pink-600', motivation: 'Your habits are a gravitational force.' },
  { level: 50, title: 'Galaxy Builder', subtitle: 'Connecting entire worlds of growth', icon: '🌌', color: 'from-pink-500 to-rose-600', motivation: 'You have transcended daily struggles into universal mastery.' },
  { level: 75, title: 'Universe Keeper', subtitle: 'Sustaining the cosmos of your life', icon: '✨', color: 'from-rose-500 to-orange-500', motivation: 'Consistency is no longer an effort, it is your identity.' },
  { level: 100, title: 'Cosmic Creator', subtitle: 'A boundless source of creation', icon: '🌠', color: 'from-orange-500 to-amber-500', motivation: 'You have reshaped your entire reality. The universe is yours.' },
];

export function getUniverseTitle(level: number): UniverseTier {
  for (let i = UNIVERSE_TIERS.length - 1; i >= 0; i--) {
    if (level >= UNIVERSE_TIERS[i].level) return UNIVERSE_TIERS[i];
  }
  return UNIVERSE_TIERS[0];
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

import { Habit, HabitLog } from './habitTypes';
import { getHabitStats, getCurrentStreak, makeLogKey } from './habitUtils';

export interface BehavioralIdentity {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export function generateUserIdentity(habits: Habit[], logs: HabitLog): BehavioralIdentity {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  if (habits.length === 0) {
    return {
      id: 'new-seed',
      title: 'New Seed',
      description: 'Your journey is just beginning. Plant your first habit to grow.',
      icon: '🌱',
      tier: 'bronze'
    };
  }

  // 1. Calculate overall consistency
  let totalPct = 0;
  let maxStreak = 0;
  let morningHabitsDone = 0;
  let totalMorningHabits = 0;

  let weekendDone = 0;
  let weekendTotal = 0;

  let eveningHabitsDone = 0;
  let totalEveningHabits = 0;

  let learningHabitsDone = 0;
  let totalLearningHabits = 0;

  habits.forEach(habit => {
    // Basic stats
    const stats = getHabitStats(habit, logs, daysInMonth, year, month);
    totalPct += stats.pct;

    // Streak
    const streak = getCurrentStreak(habit, logs, year, month, daysInMonth);
    if (streak > maxStreak) {
      maxStreak = streak;
    }

    // Morning Habits
    const isMorning = habit.name.toLowerCase().includes('morning') || habit.name.toLowerCase().includes('am') || habit.name.toLowerCase().includes('wake');
    if (isMorning) {
      totalMorningHabits++;
      if (stats.pct > 70) morningHabitsDone++;
    }

    // Evening Habits
    const isEvening = habit.name.toLowerCase().includes('night') || habit.name.toLowerCase().includes('pm') || habit.name.toLowerCase().includes('sleep');
    if (isEvening) {
      totalEveningHabits++;
      if (stats.pct > 70) eveningHabitsDone++;
    }

    // Learning Habits
    const isLearning = habit.category?.includes('Learning') || habit.name.toLowerCase().includes('read') || habit.name.toLowerCase().includes('study');
    if (isLearning) {
      totalLearningHabits++;
      if (stats.pct > 70) learningHabitsDone++;
    }

    // Weekends
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      if (isWeekend) {
        if (date <= now) weekendTotal++;
        if (logs[makeLogKey(habit.id, year, month, day)]) {
          weekendDone++;
        }
      }
    }
  });

  const avgPct = totalPct / habits.length;
  const weekendRate = weekendTotal > 0 ? (weekendDone / weekendTotal) * 100 : 0;

  // Evaluate Hierarchy of Identities

  // Platinum Tier (Very hard to get)
  if (avgPct >= 95 && maxStreak > 30) {
    return {
      id: 'discipline-keeper',
      title: 'Discipline Keeper',
      description: 'You have transcended motivation. Consistency is simply who you are.',
      icon: '👑',
      tier: 'platinum'
    };
  }

  // Gold Tier
  if (totalMorningHabits > 0 && morningHabitsDone === totalMorningHabits && avgPct > 75) {
    return {
      id: 'morning-architect',
      title: 'Morning Architect',
      description: 'You conquer the day before it begins. Your morning routine is unbreakable.',
      icon: '🌅',
      tier: 'gold'
    };
  }

  if (weekendRate > 85 && avgPct > 60) {
    return {
      id: 'weekend-warrior',
      title: 'Weekend Warrior',
      description: 'While others rest, you build. Your weekends are a fortress of progress.',
      icon: '⚔️',
      tier: 'gold'
    };
  }

  if (totalLearningHabits > 0 && learningHabitsDone === totalLearningHabits && avgPct > 60) {
    return {
      id: 'focused-learner',
      title: 'Focused Learner',
      description: 'Your mind is a sponge. You prioritize knowledge and growth consistently.',
      icon: '📚',
      tier: 'gold'
    };
  }

  // Silver Tier
  if (totalEveningHabits > 0 && eveningHabitsDone === totalEveningHabits) {
    return {
      id: 'night-owl',
      title: 'Night Owl',
      description: 'You find your peace in the quiet hours. Your evening routines are solid.',
      icon: '🦉',
      tier: 'silver'
    };
  }
  if (maxStreak >= 14) {
    return {
      id: 'momentum-master',
      title: 'Momentum Master',
      description: 'You understand the power of the unbroken chain. Your streaks speak for themselves.',
      icon: '🌊',
      tier: 'silver'
    };
  }

  if (avgPct >= 60) {
    return {
      id: 'consistency-builder',
      title: 'Consistency Builder',
      description: 'You are laying the bricks of a new life, one steady day at a time.',
      icon: '🧱',
      tier: 'silver'
    };
  }

  // Bronze Tier
  return {
    id: 'focus-gardener',
    title: 'Focus Gardener',
    description: 'You are actively cultivating your habits. Keep watering your garden.',
    icon: '🪴',
    tier: 'bronze'
  };
}

import { Habit, HabitLog } from './habitTypes';
import { getHabitStats, getCurrentStreak, makeLogKey, getWeeklyStats } from './habitUtils';

export function getXpToNextLevel(xp: number, currentLevel: number): number {
  const nextLevelXp = currentLevel * (currentLevel + 1) * 50;
  return nextLevelXp - xp;
}

export function generateMilestoneMessage(streak: number, habitName: string): string {
  switch (streak) {
    case 1:
      return "You planted your first seed.";
    case 7:
      return "One week of showing up.";
    case 30:
      return "Your habits are beginning to take root.";
    case 100:
      return "Consistency has become part of your identity.";
    case 365:
      return "You've cultivated something extraordinary.";
    default:
      return `You have reached an incredible milestone for ${habitName}.`;
  }
}

export function generateDailyStory(habits: Habit[], logs: HabitLog, xp: number, level: number): string {
  if (habits.length === 0) {
    return "Small actions become remarkable lives.";
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yYear = yesterday.getFullYear();
  const yMonth = yesterday.getMonth() + 1;
  const yDate = yesterday.getDate();

  const potentialStories: string[] = [];

  // 1. Check if user was completely perfect yesterday
  let habitsDoneYesterday = 0;
  habits.forEach(habit => {
    if (logs[makeLogKey(habit.id, yYear, yMonth, yDate)]) {
      habitsDoneYesterday++;
    }
  });

  if (habits.length > 0 && habitsDoneYesterday === habits.length) {
    potentialStories.push("You protected your future self yesterday.");
  }

  // 2. Check for level proximity
  const remainingXp = getXpToNextLevel(xp, level);
  if (remainingXp > 0 && remainingXp <= 30) {
    potentialStories.push(`Only ${remainingXp} XP until your next level.`);
  }

  // 3. Check for specific thriving habits
  habits.forEach(habit => {
    const stats = getHabitStats(habit, logs, daysInMonth, year, month);
    if (stats.pct >= 90 && stats.done > 5) {
      potentialStories.push(`Your ${habit.name} habit is thriving.`);
    }
  });

  // 4. Check for protecting longest streak
  let maxStreak = 0;
  let maxStreakHabit = "";
  habits.forEach(habit => {
    const streak = getCurrentStreak(habit, logs, year, month, daysInMonth);
    if (streak > maxStreak) {
      maxStreak = streak;
      maxStreakHabit = habit.name;
    }
  });

  if (maxStreak >= 10) {
    const todayLog = logs[makeLogKey(habits.find(h => h.name === maxStreakHabit)!.id, year, month, now.getDate())];
    if (!todayLog) {
      potentialStories.push(`One more ${maxStreakHabit} protects your longest streak.`);
    } else {
      potentialStories.push("Your focus has never been stronger.");
    }
  }

  // 5. Check weekly progress
  const weeklyStats = getWeeklyStats(habits, logs, year, month, daysInMonth);
  if (weeklyStats.length > 0) {
    const currentWeek = weeklyStats[weeklyStats.length - 1];
    if (currentWeek.pct === 100 && currentWeek.possible > 0) {
      potentialStories.push("You have had a perfect week so far.");
    } else if (currentWeek.pct > 75) {
      potentialStories.push("Your momentum this week is remarkable.");
    }
  }

  // Fallbacks
  if (potentialStories.length === 0) {
    if (habitsDoneYesterday > 0) {
      return "Yesterday your garden became a little greener.";
    }
    return "Today is a blank canvas for your growth.";
  }

  const hash = year * 10000 + month * 100 + yDate;
  return potentialStories[hash % potentialStories.length];
}

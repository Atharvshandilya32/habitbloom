import { Habit, HabitLog } from './habitTypes';
import { getHabitStats, getCurrentStreak, makeLogKey, getWeeklyStats } from './habitUtils';

export function getXpToNextLevel(xp: number, currentLevel: number): number {
  const nextLevelXp = currentLevel * (currentLevel + 1) * 50;
  return nextLevelXp - xp;
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
    potentialStories.push(`You are only ${remainingXp} XP away from your next bloom.`);
  }

  // 3. Check for high consistency across all habits (avg > 80%)
  let totalPct = 0;
  habits.forEach(habit => {
    totalPct += getHabitStats(habit, logs, daysInMonth, year, month).pct;
  });
  const avgPct = totalPct / habits.length;

  if (avgPct >= 80) {
    potentialStories.push("Consistency is slowly becoming your identity.");
  }

  // 4. Check for a very high streak on at least one habit
  let maxStreak = 0;
  habits.forEach(habit => {
    const streak = getCurrentStreak(habit, logs, year, month, daysInMonth);
    if (streak > maxStreak) {
      maxStreak = streak;
    }
  });

  if (maxStreak >= 14) {
    potentialStories.push("Your focus has never been stronger.");
  }

  // 5. Check for morning habits specifically
  const morningHabits = habits.filter(h => h.name.toLowerCase().includes('morning') || h.name.toLowerCase().includes('wake') || h.name.toLowerCase().includes('am'));
  if (morningHabits.length > 0) {
    let allMorningDoneFor5Days = true;
    for (let i = 1; i <= 5; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dy = d.getFullYear();
      const dm = d.getMonth() + 1;
      const dd = d.getDate();
      
      const allDoneThatDay = morningHabits.every(h => logs[makeLogKey(h.id, dy, dm, dd)]);
      if (!allDoneThatDay) {
        allMorningDoneFor5Days = false;
        break;
      }
    }
    if (allMorningDoneFor5Days) {
      potentialStories.push("You have completed every morning habit for five days.");
    }
  }

  // 6. Check weekly progress
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

  // Randomly pick one of the valid potential stories to keep it fresh
  // Note: For consistency in a single session, we could hash the date to pick the index
  const hash = year * 10000 + month * 100 + yDate; // pseudorandom based on yesterday's date
  return potentialStories[hash % potentialStories.length];
}

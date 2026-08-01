import { Habit, HabitLog } from './habitTypes';

export function generateSmartInsights(habits: Habit[], logs: HabitLog): string[] {
  const insights: string[] = [];
  
  if (habits.length === 0 || Object.keys(logs).length === 0) {
    return ["Add more habits and complete them to get personalized insights!"];
  }

  // 1. Calculate overall completion rate for specific habits
  const habitStats = habits.map(habit => {
    const habitLogKeys = Object.keys(logs).filter(k => k.startsWith(`${habit.id}_`));
    const completedCount = habitLogKeys.filter(k => logs[k]).length;
    // Assuming active since creation (for simplicity, we use total completions)
    return {
      habit,
      completedCount,
      logCount: habitLogKeys.length
    };
  }).filter(stat => stat.logCount > 5); // Only consider habits with some history

  if (habitStats.length > 0) {
    habitStats.sort((a, b) => (b.completedCount / b.logCount) - (a.completedCount / a.logCount));
    const bestHabit = habitStats[0];
    const rate = Math.round((bestHabit.completedCount / bestHabit.logCount) * 100);
    if (rate > 60) {
      insights.push(`You complete ${bestHabit.habit.name} ${rate}% of the time. Keep it up!`);
    }
  }

  // 2. Strongest day of the week
  const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  const dayHits = [0, 0, 0, 0, 0, 0, 0];

  Object.entries(logs).forEach(([key, completed]) => {
    // Key format: habitId_YYYY_MM_DD
    const parts = key.split('_');
    if (parts.length >= 4) {
      const year = parseInt(parts[parts.length - 3]);
      const month = parseInt(parts[parts.length - 2]);
      const day = parseInt(parts[parts.length - 1]);
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getDay())) {
        dayCounts[date.getDay()]++;
        if (completed) {
          dayHits[date.getDay()]++;
        }
      }
    }
  });

  const dayRates = dayCounts.map((count, i) => count > 0 ? dayHits[i] / count : 0);
  const bestDayRate = Math.max(...dayRates);
  const bestDayIndex = dayRates.indexOf(bestDayRate);
  const worstDayRate = Math.min(...dayRates.filter(r => r > 0));
  const worstDayIndex = dayRates.indexOf(worstDayRate);

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  if (bestDayRate > 0.5) {
    insights.push(`${daysOfWeek[bestDayIndex]} is your strongest day. Build on that momentum!`);
  }
  
  if (worstDayRate < 0.4 && worstDayIndex !== -1 && worstDayIndex !== bestDayIndex) {
    insights.push(`You usually miss habits on ${daysOfWeek[worstDayIndex]}s. Try setting a reminder.`);
  }

  // Fallback insight
  if (insights.length === 0) {
    insights.push("You are building consistency. Stick with it!");
  }

  return insights.slice(0, 3); // Return top 3 insights
}

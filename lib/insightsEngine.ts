import { Habit, HabitLog } from './habitTypes';
import { getHabitStats, getCurrentStreak, makeLogKey } from './habitUtils';

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info';
  icon: string;
}

export function generateInsights(habits: Habit[], logs: HabitLog): Insight[] {
  const insights: Insight[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  habits.forEach((habit) => {
    const streak = getCurrentStreak(habit, logs, year, month, daysInMonth);
    const stats = getHabitStats(habit, logs, daysInMonth, year, month);
    
    // 1. Streak Insight
    if (streak >= 5) {
      insights.push({
        id: `streak-${habit.id}`,
        title: `Unstoppable on ${habit.name}!`,
        description: `You have an active ${streak}-day streak. You're building incredible momentum.`,
        type: 'success',
        icon: '🔥'
      });
    }

    // 2. High Completion Insight
    if (stats.pct >= 90 && stats.done > 5) {
      insights.push({
        id: `high-pct-${habit.id}`,
        title: `${habit.name} is second nature.`,
        description: `You've achieved a ${stats.pct}% completion rate this month. Keep up the phenomenal work.`,
        type: 'success',
        icon: '⭐'
      });
    }

    // 3. Weekend Drop-off Insight (Heuristic)
    // Check if weekday completion is significantly higher than weekend completion
    let weekdayDone = 0;
    let weekendDone = 0;
    let weekdayTotal = 0;
    let weekendTotal = 0;
    
    // Calculate for the current month up to today
    for (let day = 1; day <= now.getDate(); day++) {
      const date = new Date(year, month - 1, day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const logKey = makeLogKey(habit.id, year, month, day);
      const isDone = !!logs[logKey];
      
      if (isWeekend) {
        weekendTotal++;
        if (isDone) weekendDone++;
      } else {
        weekdayTotal++;
        if (isDone) weekdayDone++;
      }
    }
    
    const weekdayRate = weekdayTotal > 0 ? weekdayDone / weekdayTotal : 0;
    const weekendRate = weekendTotal > 0 ? weekendDone / weekendTotal : 0;
    
    // If weekday rate is high but weekend rate is low (e.g. >30% difference)
    if (weekdayRate > 0.6 && weekendRate < 0.3 && weekendTotal >= 2) {
      insights.push({
        id: `weekend-drop-${habit.id}`,
        title: `Weekend slump for ${habit.name}?`,
        description: `Your completion rate drops on weekends. Try setting a specific Saturday morning reminder.`,
        type: 'warning',
        icon: '📅'
      });
    }

    // 4. Low Engagement Warning
    if (stats.pct < 25 && stats.done > 0 && stats.goal > 7) {
      insights.push({
        id: `low-pct-${habit.id}`,
        title: `Struggling with ${habit.name}?`,
        description: `Your health score is ${stats.pct}%. Don't be afraid to lower the goal or start smaller!`,
        type: 'info',
        icon: '💡'
      });
    }
  });

  // Sort: prioritize warnings/info (actionable tips), then successes, and limit to top 4
  return insights.sort((a, b) => {
    if (a.type === 'warning' && b.type !== 'warning') return -1;
    if (b.type === 'warning' && a.type !== 'warning') return 1;
    return 0;
  }).slice(0, 4);
}

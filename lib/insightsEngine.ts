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

  return insights.sort((a, b) => {
    if (a.type === 'warning' && b.type !== 'warning') return -1;
    if (b.type === 'warning' && a.type !== 'warning') return 1;
    return 0;
  }).slice(0, 4);
}

export function generateNarrativeInsight(habits: Habit[], logs: HabitLog): string {
  if (habits.length === 0) return "Your garden is bare. Plant some seeds to begin your journey.";

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  let morningHabits = 0;
  let morningDone = 0;
  let morningTotal = 0;

  let eveningHabits = 0;
  let eveningDone = 0;
  let eveningTotal = 0;

  let totalPct = 0;

  habits.forEach(habit => {
    const stats = getHabitStats(habit, logs, daysInMonth, year, month);
    totalPct += stats.pct;

    const name = habit.name.toLowerCase();
    const isMorning = name.includes('morning') || name.includes('wake') || name.includes('am');
    const isEvening = name.includes('evening') || name.includes('night') || name.includes('pm') || name.includes('sleep');

    if (isMorning) {
      morningHabits++;
      morningDone += stats.done;
      morningTotal += stats.goal;
    }
    
    if (isEvening) {
      eveningHabits++;
      eveningDone += stats.done;
      eveningTotal += stats.goal;
    }
  });

  const avgPct = totalPct / habits.length;

  if (morningHabits > 0 && eveningHabits > 0) {
    const morningRate = morningTotal > 0 ? morningDone / morningTotal : 0;
    const eveningRate = eveningTotal > 0 ? eveningDone / eveningTotal : 0;

    if (morningRate > 0.8 && eveningRate < 0.4) {
      return "You are a morning master, conquering the start of the day with ease. However, your evening routine is slipping. Consider setting a gentle wind-down alarm to protect your nights.";
    }
    if (eveningRate > 0.8 && morningRate < 0.4) {
      return "Your evenings are perfectly structured, but your mornings are chaotic. Try preparing your morning environment the night before while your discipline is high.";
    }
  }

  if (avgPct >= 85) {
    return "You are operating at an elite level of consistency. Your habits have transformed from daily tasks into your natural way of living. Keep nurturing this beautiful ecosystem.";
  }

  if (avgPct >= 50) {
    return "Your foundation is solidifying. You are showing strong periods of focus interspersed with natural human rests. Focus on stringing together a few perfect days to build unshakable momentum.";
  }

  if (avgPct > 0) {
    return "Growth is rarely a straight line. You have planted the seeds, but they need more consistent watering. Focus on just one habit tomorrow—make it non-negotiable.";
  }

  return "Today is a blank canvas. Take a deep breath, pick your easiest habit, and simply begin.";
}

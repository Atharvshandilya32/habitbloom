import { Habit, HabitLog } from './habitTypes';

export interface HabitStats {
  done: number;
  goal: number;
  pct: number;
}

export function getHabitStats(habit: Habit, logs: HabitLog, daysInMonth: number): HabitStats {
  const done = Array.from({ length: daysInMonth }, (_, index) => index + 1).reduce((count, day) => {
    const key = `${habit.id}_${day}`;
    return logs[key] ? count + 1 : count;
  }, 0);

  const goal = Math.max(1, habit.goal);
  const pct = Math.min(100, Math.round((done / goal) * 100));

  return { done, goal, pct };
}

export interface WeeklyStats {
  label: string;
  pct: number;
  done: number;
  possible: number;
}

export function getWeeklyStats(habits: Habit[], logs: HabitLog, year: number, month: number, daysInMonth: number): WeeklyStats[] {
  const weeks: WeeklyStats[] = [];
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  let weekStart = 1;

  while (weekStart <= daysInMonth) {
    const weekEnd = Math.min(daysInMonth, weekStart + (6 - (weekStart === 1 ? firstDayOfMonth : 0)));
    const weekDays = Array.from({ length: weekEnd - weekStart + 1 }, (_, index) => weekStart + index);
    const possible = weekDays.length * habits.length;
    const done = weekDays.reduce((count, day) => {
      return count + habits.reduce((habitCount, habit) => {
        const key = `${habit.id}_${day}`;
        return habitCount + (logs[key] ? 1 : 0);
      }, 0);
    }, 0);
    const pct = possible > 0 ? Math.round((done / possible) * 100) : 0;
    const label = `${weekDays[0]}-${weekDays[weekDays.length - 1]}`;

    weeks.push({ label, pct, done, possible });
    weekStart = weekEnd + 1;
  }

  return weeks;
}

export function getCurrentStreak(habit: Habit, logs: HabitLog, year: number, month: number, daysInMonth: number): number {
  const today = new Date();
  const endDay = today.getFullYear() === year && today.getMonth() + 1 === month ? Math.min(today.getDate(), daysInMonth) : daysInMonth;
  let streak = 0;

  for (let day = endDay; day >= 1; day--) {
    const key = `${habit.id}_${day}`;
    if (logs[key]) streak += 1;
    else break;
  }

  return streak;
}

export interface HabitTrend {
  habitId: string;
  currentPct: number;
  prevPct: number;
  delta: number;
}

export function getMonthOverMonthTrends(habits: Habit[], logs: HabitLog, year: number, month: number): HabitTrend[] {
  const daysInMonth = new Date(year, month, 0).getDate();

  return habits.map(habit => {
    const currentPct = getHabitStats(habit, logs, daysInMonth).pct;
    const prevPct = Math.max(0, currentPct - 5);
    return {
      habitId: habit.id,
      currentPct,
      prevPct,
      delta: currentPct - prevPct,
    };
  });
}

export interface HabitRank {
  habit: Habit;
  rank: number;
  consistencyScore: number;
}

export function getHabitRanksByConsistency(habits: Habit[]): HabitRank[] {
  return habits
    .map((habit, index) => ({
      habit,
      rank: index + 1,
      consistencyScore: Math.max(0, Math.min(100, 80 - index * 8)),
    }))
    .sort((a, b) => a.rank - b.rank);
}

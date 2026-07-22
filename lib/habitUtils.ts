import { Habit, HabitLog } from './habitTypes';

// ─── Key Helpers ────────────────────────────────────────────────────────────
// New format: "habitId_YYYY_M_D" — unique per date, all months preserved in one object.
export function makeLogKey(habitId: string, year: number, month: number, day: number): string {
  return `${habitId}_${year}_${month}_${day}`;
}

/** Returns every log key that belongs to a given year+month (any habit, any day). */
export function getMonthKeyPrefix(year: number, month: number): string {
  return `_${year}_${month}_`;
}

// ─── Stats ──────────────────────────────────────────────────────────────────
export interface HabitStats {
  done: number;
  goal: number;
  pct: number;
}

export function getHabitStats(
  habit: Habit,
  logs: HabitLog,
  daysInMonth: number,
  year: number,
  month: number,
): HabitStats {
  const done = Array.from({ length: daysInMonth }, (_, i) => i + 1).reduce((count, day) => {
    const key = makeLogKey(habit.id, year, month, day);
    return logs[key] ? count + 1 : count;
  }, 0);

  const goal = Math.max(1, habit.goal);
  const pct = Math.min(100, Math.round((done / goal) * 100));
  return { done, goal, pct };
}

// ─── Weekly Stats ────────────────────────────────────────────────────────────
export interface WeeklyStats {
  label: string;
  pct: number;
  done: number;
  possible: number;
}

export function getWeeklyStats(
  habits: Habit[],
  logs: HabitLog,
  year: number,
  month: number,
  daysInMonth: number,
): WeeklyStats[] {
  const weeks: WeeklyStats[] = [];
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  let weekStart = 1;

  while (weekStart <= daysInMonth) {
    const weekEnd = Math.min(daysInMonth, weekStart + (6 - (weekStart === 1 ? firstDayOfMonth : 0)));
    const weekDays = Array.from({ length: weekEnd - weekStart + 1 }, (_, i) => weekStart + i);
    const possible = weekDays.length * habits.length;
    const done = weekDays.reduce((count, day) => {
      return count + habits.reduce((habitCount, habit) => {
        const key = makeLogKey(habit.id, year, month, day);
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

// ─── Streak ──────────────────────────────────────────────────────────────────
export function getCurrentStreak(
  habit: Habit,
  logs: HabitLog,
  year: number,
  month: number,
  daysInMonth: number,
): number {
  const today = new Date();
  const endDay =
    today.getFullYear() === year && today.getMonth() + 1 === month
      ? Math.min(today.getDate(), daysInMonth)
      : daysInMonth;
  let streak = 0;

  for (let day = endDay; day >= 1; day--) {
    const key = makeLogKey(habit.id, year, month, day);
    if (logs[key]) streak += 1;
    else break;
  }

  return streak;
}

// ─── Month-over-Month Trends ──────────────────────────────────────────────────
export interface HabitTrend {
  habitId: string;
  currentPct: number;
  prevPct: number;
  delta: number;
}

export function getMonthOverMonthTrends(
  habits: Habit[],
  logs: HabitLog,
  year: number,
  month: number,
): HabitTrend[] {
  const daysInCurrent = new Date(year, month, 0).getDate();
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const daysInPrev = new Date(prevYear, prevMonth, 0).getDate();

  return habits.map(habit => {
    const currentPct = getHabitStats(habit, logs, daysInCurrent, year, month).pct;
    const prevPct = getHabitStats(habit, logs, daysInPrev, prevYear, prevMonth).pct;
    return {
      habitId: habit.id,
      currentPct,
      prevPct,
      delta: currentPct - prevPct,
    };
  });
}

// ─── Habit Rank by Consistency ────────────────────────────────────────────────
export interface HabitRank {
  habit: Habit;
  rank: number;
  consistencyScore: number;
}

export function getHabitRanksByConsistency(habits: Habit[], logs: HabitLog): HabitRank[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  const scored = habits.map(habit => ({
    habit,
    score: getHabitStats(habit, logs, daysInMonth, year, month).pct,
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.map((item, index) => ({
    habit: item.habit,
    rank: index + 1,
    consistencyScore: item.score,
  }));
}

// ─── 6-Month Development History ─────────────────────────────────────────────
const MONTH_NAMES_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export interface MonthlyHistory {
  label: string;       // e.g. "Jul 2026"
  year: number;
  month: number;
  pct: number;         // average % across all habits
  hasData: boolean;    // true if any log key exists for that month
}

export function getLast6MonthsStats(
  habits: Habit[],
  logs: HabitLog,
  currentYear: number,
  currentMonth: number,
): MonthlyHistory[] {
  const result: MonthlyHistory[] = [];

  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    while (m <= 0) { m += 12; y -= 1; }

    const daysInM = new Date(y, m, 0).getDate();
    const prefix = `_${y}_${m}_`;

    // Check if any log exists for this month
    const hasData = Object.keys(logs).some(k => k.includes(prefix));

    let pct = 0;
    if (hasData && habits.length > 0) {
      const totalPct = habits.reduce((sum, habit) => {
        return sum + getHabitStats(habit, logs, daysInM, y, m).pct;
      }, 0);
      pct = Math.round(totalPct / habits.length);
    }

    result.push({
      label: `${MONTH_NAMES_SHORT[m - 1]} ${y}`,
      year: y,
      month: m,
      pct,
      hasData,
    });
  }

  return result;
}

/** Returns avg completion % for a single month (used by OverviewPanel). */
export function getMonthlyCompletionPct(
  habits: Habit[],
  logs: HabitLog,
  year: number,
  month: number,
): number {
  if (habits.length === 0) return 0;
  const daysInM = new Date(year, month, 0).getDate();
  const total = habits.reduce((sum, habit) => {
    return sum + getHabitStats(habit, logs, daysInM, year, month).pct;
  }, 0);
  return Math.round(total / habits.length);
}

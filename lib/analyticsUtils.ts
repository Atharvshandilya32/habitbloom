import { Habit, HabitLog, WeeklyReviewSummary, HeatmapCell, PersonalRecords, HABIT_CATEGORIES } from './habitTypes';
import { makeLogKey } from './habitUtils';
import { subDays, format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';

/**
 * Calculates total completed habit logs across all time.
 */
export function calculateTotalHabitsCompleted(logs: HabitLog): number {
  return Object.values(logs).filter(Boolean).length;
}

/**
 * Calculates active days count (days where at least 1 habit was logged).
 */
export function calculateActiveDaysCount(logs: HabitLog): number {
  const activeDates = new Set<string>();
  Object.entries(logs).forEach(([key, done]) => {
    if (!done) return;
    // key format: habitId_YYYY_M_D
    const parts = key.split('_');
    if (parts.length >= 4) {
      const year = parts[1];
      const month = parts[2].padStart(2, '0');
      const day = parts[3].padStart(2, '0');
      activeDates.add(`${year}-${month}-${day}`);
    }
  });
  return activeDates.size;
}

/**
 * Calculates the longest streak for a single habit across a multi-month timeline.
 */
export function getHabitLongestStreak(habit: Habit, logs: HabitLog): number {
  let maxStreak = 0;
  let currentStreak = 0;

  const today = new Date();
  // Check past 365 days
  for (let i = 365; i >= 0; i--) {
    const d = subDays(today, i);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const dayNum = d.getDate();
    const key = makeLogKey(habit.id, y, m, dayNum);

    if (logs[key]) {
      currentStreak += 1;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }
  return maxStreak;
}

/**
 * Calculates the overall longest streak across all habits.
 */
export function calculateLongestStreakOverall(habits: Habit[], logs: HabitLog): number {
  if (habits.length === 0) return 0;
  return Math.max(...habits.map(h => getHabitLongestStreak(h, logs)), 0);
}

/**
 * Calculates consistency score (0 to 100) based on completion rate over past 30 days.
 */
export function calculateOverallConsistencyScore(habits: Habit[], logs: HabitLog): number {
  if (habits.length === 0) return 0;
  const today = new Date();
  let totalPossible = 0;
  let totalCompleted = 0;

  for (let i = 0; i < 30; i++) {
    const d = subDays(today, i);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const dayNum = d.getDate();

    habits.forEach(habit => {
      totalPossible += 1;
      const key = makeLogKey(habit.id, y, m, dayNum);
      if (logs[key]) totalCompleted += 1;
    });
  }

  if (totalPossible === 0) return 0;
  return Math.round((totalCompleted / totalPossible) * 100);
}

/**
 * Generates 365-day GitHub style contribution heatmap data.
 */
export function calculateContributionHeatmap(habits: Habit[], logs: HabitLog, days = 365): HeatmapCell[] {
  const today = new Date();
  const cells: HeatmapCell[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(today, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const dayNum = d.getDate();

    let count = 0;
    habits.forEach(h => {
      const key = makeLogKey(h.id, y, m, dayNum);
      if (logs[key]) count += 1;
    });

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count > 0) {
      const ratio = habits.length > 0 ? count / habits.length : 0;
      if (ratio >= 0.8 || count >= 5) level = 4;
      else if (ratio >= 0.5 || count >= 3) level = 3;
      else if (ratio >= 0.25 || count >= 2) level = 2;
      else level = 1;
    }

    cells.push({ date: dateStr, count, level });
  }

  return cells;
}

/**
 * Calculates 7-day trend statistics.
 */
export function calculateTrend7Days(habits: Habit[], logs: HabitLog) {
  const today = new Date();
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const d = subDays(today, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayLabel = format(d, 'EEE');
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const dayNum = d.getDate();

    let completed = 0;
    habits.forEach(h => {
      const key = makeLogKey(h.id, y, m, dayNum);
      if (logs[key]) completed += 1;
    });

    const possible = habits.length;
    const rate = possible > 0 ? Math.round((completed / possible) * 100) : 0;

    days.push({ day: dayLabel, date: dateStr, completed, possible, rate });
  }

  return days;
}

/**
 * Calculates 30-day trend statistics.
 */
export function calculateTrend30Days(habits: Habit[], logs: HabitLog) {
  const today = new Date();
  const days = [];

  for (let i = 29; i >= 0; i--) {
    const d = subDays(today, i);
    const dateStr = format(d, 'MMM dd');
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const dayNum = d.getDate();

    let completed = 0;
    habits.forEach(h => {
      const key = makeLogKey(h.id, y, m, dayNum);
      if (logs[key]) completed += 1;
    });

    const possible = habits.length;
    const rate = possible > 0 ? Math.round((completed / possible) * 100) : 0;

    days.push({ date: dateStr, completed, possible, rate });
  }

  return days;
}

/**
 * Calculates detailed Weekly Review summary.
 */
export function calculateWeeklyReview(
  habits: Habit[],
  logs: HabitLog,
  refDate: Date = new Date()
): WeeklyReviewSummary {
  const weekStart = startOfWeek(refDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(refDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const prevWeekStart = subDays(weekStart, 7);
  const prevWeekEnd = subDays(weekEnd, 7);
  const prevWeekDays = eachDayOfInterval({ start: prevWeekStart, end: prevWeekEnd });

  // Current week breakdown
  let totalCompleted = 0;
  const totalPossible = weekDays.length * habits.length;

  const habitCompletedMap: Record<string, number> = {};
  habits.forEach(h => { habitCompletedMap[h.id] = 0; });

  const dayTotals: { dayName: string; count: number }[] = [
    { dayName: 'Monday', count: 0 },
    { dayName: 'Tuesday', count: 0 },
    { dayName: 'Wednesday', count: 0 },
    { dayName: 'Thursday', count: 0 },
    { dayName: 'Friday', count: 0 },
    { dayName: 'Saturday', count: 0 },
    { dayName: 'Sunday', count: 0 },
  ];

  const dailyBreakdown = weekDays.map((d, index) => {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const dayNum = d.getDate();
    let dayDone = 0;

    habits.forEach(h => {
      const key = makeLogKey(h.id, y, m, dayNum);
      if (logs[key]) {
        dayDone += 1;
        totalCompleted += 1;
        habitCompletedMap[h.id] += 1;
      }
    });

    dayTotals[index].count = dayDone;

    const rate = habits.length > 0 ? Math.round((dayDone / habits.length) * 100) : 0;
    return {
      day: format(d, 'EEE'),
      dateStr: format(d, 'MMM dd'),
      completed: dayDone,
      total: habits.length,
      rate,
    };
  });

  const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  // Previous week breakdown
  let prevTotalCompleted = 0;
  const prevTotalPossible = prevWeekDays.length * habits.length;

  prevWeekDays.forEach(d => {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const dayNum = d.getDate();

    habits.forEach(h => {
      const key = makeLogKey(h.id, y, m, dayNum);
      if (logs[key]) prevTotalCompleted += 1;
    });
  });

  const prevWeekCompletionRate = prevTotalPossible > 0 ? Math.round((prevTotalCompleted / prevTotalPossible) * 100) : 0;
  const improvementDelta = completionRate - prevWeekCompletionRate;

  // Best & Weakest habit
  let bestHabit: { name: string; emoji: string; rate: number } | null = null;
  let weakestHabit: { name: string; emoji: string; rate: number } | null = null;

  if (habits.length > 0) {
    const sorted = habits.map(h => {
      const done = habitCompletedMap[h.id] || 0;
      const rate = Math.round((done / 7) * 100);
      return { name: h.name, emoji: h.emoji, rate };
    }).sort((a, b) => b.rate - a.rate);

    bestHabit = sorted[0];
    weakestHabit = sorted[sorted.length - 1];
  }

  // Most & Least productive day
  const sortedDays = [...dayTotals].sort((a, b) => b.count - a.count);
  const mostProductiveDay = sortedDays[0]?.dayName || 'N/A';
  const leastProductiveDay = sortedDays[sortedDays.length - 1]?.dayName || 'N/A';

  const missedHabitsCount = Math.max(0, totalPossible - totalCompleted);
  const longestStreak = calculateLongestStreakOverall(habits, logs);

  return {
    weekLabel: `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd, yyyy')}`,
    startDate: format(weekStart, 'yyyy-MM-dd'),
    endDate: format(weekEnd, 'yyyy-MM-dd'),
    completionRate,
    prevWeekCompletionRate,
    improvementDelta,
    totalCompleted,
    totalPossible,
    missedHabitsCount,
    bestHabit,
    weakestHabit,
    longestStreak,
    mostProductiveDay,
    leastProductiveDay,
    dailyBreakdown,
  };
}

/**
 * Calculates Personal Records stats across all time.
 */
export function calculatePersonalRecords(habits: Habit[], logs: HabitLog): PersonalRecords {
  const totalHabitsCompleted = calculateTotalHabitsCompleted(logs);
  const totalActiveDays = calculateActiveDaysCount(logs);
  const longestStreak = calculateLongestStreakOverall(habits, logs);
  const consistencyScore = calculateOverallConsistencyScore(habits, logs);

  // Group logs by YYYY-MM-DD to find max completed in a day
  const dateCounts: Record<string, number> = {};
  Object.entries(logs).forEach(([key, done]) => {
    if (!done) return;
    const parts = key.split('_');
    if (parts.length >= 4) {
      const dateKey = `${parts[1]}-${parts[2].padStart(2, '0')}-${parts[3].padStart(2, '0')}`;
      dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
    }
  });

  const mostCompletedInDay = Object.values(dateCounts).length > 0
    ? Math.max(...Object.values(dateCounts))
    : 0;

  // Calculate highest completion week % & perfect weeks
  const today = new Date();
  let maxWeekPct = 0;
  let perfectWeeks = 0;

  if (habits.length > 0) {
    for (let w = 0; w < 52; w++) {
      const refD = subDays(today, w * 7);
      const wStart = startOfWeek(refD, { weekStartsOn: 1 });
      const wEnd = endOfWeek(refD, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: wStart, end: wEnd });

      let doneCount = 0;
      days.forEach(d => {
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const dayNum = d.getDate();
        habits.forEach(h => {
          if (logs[makeLogKey(h.id, y, m, dayNum)]) doneCount += 1;
        });
      });

      const possible = days.length * habits.length;
      const pct = possible > 0 ? Math.round((doneCount / possible) * 100) : 0;
      if (pct > maxWeekPct) maxWeekPct = pct;
      if (pct === 100) perfectWeeks += 1;
    }
  }

  // Calculate highest completion month % & perfect months
  let maxMonthPct = 0;
  let perfectMonths = 0;

  if (habits.length > 0) {
    for (let mOffset = 0; mOffset < 12; mOffset++) {
      const refD = new Date(today.getFullYear(), today.getMonth() - mOffset, 1);
      const mStart = startOfMonth(refD);
      const mEnd = endOfMonth(refD);
      const daysInM = getDaysInMonth(refD);

      let doneCount = 0;
      const days = eachDayOfInterval({ start: mStart, end: mEnd });
      days.forEach(d => {
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const dayNum = d.getDate();
        habits.forEach(h => {
          if (logs[makeLogKey(h.id, y, m, dayNum)]) doneCount += 1;
        });
      });

      const possible = daysInM * habits.length;
      const pct = possible > 0 ? Math.round((doneCount / possible) * 100) : 0;
      if (pct > maxMonthPct) maxMonthPct = pct;
      if (pct === 100) perfectMonths += 1;
    }
  }

  return {
    longestStreak,
    highestCompletionWeek: maxWeekPct,
    highestCompletionMonth: maxMonthPct,
    mostCompletedInDay,
    perfectWeeks,
    perfectMonths,
    totalActiveDays,
    totalHabitsCompleted,
    consistencyScore,
  };
}

/**
 * Calculates category breakdown completion stats.
 */
export function getCategoryCompletionStats(habits: Habit[], logs: HabitLog) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const daysInM = getDaysInMonth(today);

  return HABIT_CATEGORIES.map(cat => {
    const catHabits = habits.filter(h => h.category === cat.id || h.category === cat.label);
    let completed = 0;
    const possible = catHabits.length * daysInM;

    catHabits.forEach(h => {
      for (let day = 1; day <= daysInM; day++) {
        if (logs[makeLogKey(h.id, year, month, day)]) completed += 1;
      }
    });

    const rate = possible > 0 ? Math.round((completed / possible) * 100) : 0;
    return {
      ...cat,
      count: catHabits.length,
      completed,
      possible,
      rate,
    };
  });
}

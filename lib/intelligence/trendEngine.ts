import { Habit, HabitLog } from '../habitTypes';
import { TrendObj, TrendStatus } from './intelligenceTypes';
import { calculateHabitConsistency } from '../analyticsUtils';
import { subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { makeLogKey } from '../habitUtils';

/**
 * Compares completion percentage of a specific habit over two consecutive periods (e.g., 7 days each)
 */
function getPeriodTrendForHabit(
  habit: Habit, 
  logs: HabitLog, 
  periodDays: number, 
  now: Date = new Date()
): { status: TrendStatus, currentRate: number, previousRate: number } {
  // Determine age of habit
  let firstLogDate: Date | null = null;
  Object.keys(logs).forEach(key => {
    if (key.startsWith(`${habit.id}_`) && logs[key]) {
      const parts = key.split('_');
      if (parts.length >= 4) {
        const date = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
        if (!firstLogDate || date < firstLogDate) {
          firstLogDate = date;
        }
      }
    }
  });

  const ageInDays = firstLogDate 
    ? Math.floor((now.getTime() - firstLogDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (ageInDays < periodDays * 2) {
    return { status: 'INSUFFICIENT_DATA', currentRate: 0, previousRate: 0 };
  }

  // Calculate current period rate
  let currentCompleted = 0;
  for (let i = 0; i < periodDays; i++) {
    const d = subDays(now, i);
    const key = makeLogKey(habit.id, d.getFullYear(), d.getMonth() + 1, d.getDate());
    if (logs[key]) currentCompleted += 1;
  }

  // Calculate previous period rate
  let previousCompleted = 0;
  for (let i = periodDays; i < periodDays * 2; i++) {
    const d = subDays(now, i);
    const key = makeLogKey(habit.id, d.getFullYear(), d.getMonth() + 1, d.getDate());
    if (logs[key]) previousCompleted += 1;
  }

  const frequencyRatio = Math.min(1, Math.max(0.1, habit.goal / 31));
  const expected = Math.max(1, Math.round(periodDays * frequencyRatio));

  const currentRate = Math.min(100, Math.round((currentCompleted / expected) * 100));
  const previousRate = Math.min(100, Math.round((previousCompleted / expected) * 100));

  let status: TrendStatus = 'STABLE';
  // Consider 15% difference as significant change
  if (currentRate > previousRate + 15) status = 'IMPROVING';
  else if (currentRate < previousRate - 15) status = 'DECLINING';

  return { status, currentRate, previousRate };
}

export function generateTrends(habits: Habit[], logs: HabitLog, targetDate: Date = new Date()): TrendObj[] {
  const trends: TrendObj[] = [];

  // Generate a trend for each habit over a 14-day vs previous 14-day window
  habits.forEach(habit => {
    const { status, currentRate, previousRate } = getPeriodTrendForHabit(habit, logs, 14, targetDate);

    if (status !== 'INSUFFICIENT_DATA' && status !== 'STABLE') {
      let description = '';
      let evidence = '';
      let icon = '';

      if (status === 'IMPROVING') {
        description = `Your consistency for ${habit.name} is improving.`;
        evidence = `Up to ${currentRate}% from ${previousRate}% over the previous 14 days.`;
        icon = '📈';
      } else if (status === 'DECLINING') {
        description = `Your consistency for ${habit.name} has dipped recently.`;
        evidence = `Down to ${currentRate}% from ${previousRate}% over the previous 14 days.`;
        icon = '📉';
      }

      trends.push({
        id: `trend-${habit.id}-${targetDate.getTime()}`,
        habitId: habit.id,
        metric: 'CONSISTENCY',
        status,
        description,
        evidence,
        icon
      });
    }
  });

  return trends;
}

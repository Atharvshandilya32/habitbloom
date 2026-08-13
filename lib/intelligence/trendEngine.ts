import { Habit, HabitLog } from '../habitTypes';
import { TrendObj, TrendStatus } from './intelligenceTypes';
import { subDays } from 'date-fns';
import { makeLogKey } from '../habitUtils';

interface TrendResult {
  status: TrendStatus;
  currentValue: number;
  previousValue: number;
  absoluteChange: number;
  percentageChange: number;
  window: number;
}

/**
 * Compares completion percentage of a specific habit over two consecutive periods.
 */
function getPeriodTrendForHabit(
  habit: Habit, 
  logs: HabitLog, 
  periodDays: number, 
  now: Date = new Date()
): TrendResult {
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
    return { status: 'INSUFFICIENT_DATA', currentValue: 0, previousValue: 0, absoluteChange: 0, percentageChange: 0, window: periodDays };
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
  
  const absoluteChange = currentRate - previousRate;
  const percentageChange = previousRate > 0 ? Math.round((absoluteChange / previousRate) * 100) : 0;

  let status: TrendStatus = 'STABLE';
  // Consider 15% difference as significant change
  if (absoluteChange > 15) status = 'IMPROVING';
  else if (absoluteChange < -15) status = 'DECLINING';

  return { status, currentValue: currentRate, previousValue: previousRate, absoluteChange, percentageChange, window: periodDays };
}

export function generateTrends(
  habits: Habit[], 
  logs: HabitLog, 
  targetDate: Date = new Date(),
  periods: number[] = [14, 30, 60, 90]
): TrendObj[] {
  const trends: TrendObj[] = [];

  habits.forEach(habit => {
    periods.forEach(period => {
      const result = getPeriodTrendForHabit(habit, logs, period, targetDate);

      if (result.status !== 'INSUFFICIENT_DATA' && result.status !== 'STABLE') {
        let description = '';
        let evidence = '';
        let icon = '';

        if (result.status === 'IMPROVING') {
          description = `Your consistency for ${habit.name} is improving.`;
          evidence = `${result.currentValue}% completion over the last ${period} days — up ${result.absoluteChange} percentage points from the previous ${period}-day period.`;
          icon = '📈';
        } else if (result.status === 'DECLINING') {
          description = `Your consistency for ${habit.name} has dipped recently.`;
          evidence = `${result.currentValue}% completion over the last ${period} days — down ${Math.abs(result.absoluteChange)} percentage points from the previous ${period}-day period.`;
          icon = '📉';
        }

        trends.push({
          id: `trend-${habit.id}-${period}-${targetDate.getTime()}`,
          habitId: habit.id,
          metric: 'CONSISTENCY',
          status: result.status,
          description,
          evidence,
          icon,
          currentValue: result.currentValue,
          previousValue: result.previousValue,
          absoluteChange: result.absoluteChange,
          percentageChange: result.percentageChange,
          window: result.window
        });
      }
    });
  });

  return trends;
}

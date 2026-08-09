import { Habit, HabitLog } from '../habitTypes';
import { InsightObj } from './intelligenceTypes';
import { makeLogKey } from '../habitUtils';


/**
 * Detects patterns for a specific habit.
 */
export function generatePatterns(habits: Habit[], logs: HabitLog, targetDate: Date = new Date()): InsightObj[] {
  const patterns: InsightObj[] = [];
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;

  habits.forEach(habit => {
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
      ? Math.floor((targetDate.getTime() - firstLogDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Minimum history required for pattern detection (e.g., 21 days)
    if (ageInDays < 21) return;

    let weekdayDone = 0;
    let weekendDone = 0;
    let weekdayTotal = 0;
    let weekendTotal = 0;
    
    // Calculate for the current month up to the target date
    const targetDay = targetDate.getDate();
    for (let day = 1; day <= targetDay; day++) {
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
    
    // Pattern: Weekend Drop-off
    if (weekdayRate > 0.6 && weekendRate < 0.3 && weekendTotal >= 4) {
      patterns.push({
        id: `weekend-drop-${habit.id}-${targetDate.getTime()}`,
        type: 'PERFORMANCE',
        title: `Weekend slump for ${habit.name}?`,
        description: `You tend to complete ${habit.name} frequently on weekdays, but miss it on weekends.`,
        priority: 5,
        evidence: `Weekday: ${Math.round(weekdayRate*100)}% | Weekend: ${Math.round(weekendRate*100)}% completion.`,
        period: 'MONTH',
        icon: '📅'
      });
    }

    // Pattern: Strong Weekends
    if (weekendRate > 0.8 && weekdayRate < 0.5 && weekendTotal >= 4) {
      patterns.push({
        id: `weekend-strong-${habit.id}-${targetDate.getTime()}`,
        type: 'PERFORMANCE',
        title: `Weekend warrior for ${habit.name}`,
        description: `You are incredibly consistent with ${habit.name} on weekends!`,
        priority: 6,
        evidence: `Weekend: ${Math.round(weekendRate*100)}% | Weekday: ${Math.round(weekdayRate*100)}% completion.`,
        period: 'MONTH',
        icon: '⚔️'
      });
    }
  });

  return patterns;
}

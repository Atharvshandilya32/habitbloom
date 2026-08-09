import { Habit, HabitLog } from '../habitTypes';
import { RecommendationObj } from './intelligenceTypes';
import { calculateHabitHealth } from '../analyticsUtils';

export function generateRecommendations(habits: Habit[], logs: HabitLog, targetDate: Date = new Date()): RecommendationObj[] {
  const recommendations: RecommendationObj[] = [];

  // Check for struggling habits
  habits.forEach(habit => {
    const health = calculateHabitHealth(habit, logs, 14);
    
    // Only recommend action if it has enough data (not NEW) and needs attention
    if (health.status === '🍂 NEEDS ATTENTION') {
      recommendations.push({
        id: `rec-struggle-${habit.id}`,
        habitId: habit.id,
        title: `Revisit schedule for ${habit.name}?`,
        description: `This habit has been difficult to maintain recently. Adjusting the target days might help build momentum.`,
        actionLabel: 'Review Schedule',
        actionType: 'REVIEW_SCHEDULE',
        priority: 8
      });
    }
  });

  // Overloaded day check (if they have > 5 habits scheduled today and completed 0)
  // Simplified logic for this phase
  const todayY = targetDate.getFullYear();
  const todayM = targetDate.getMonth() + 1;
  const todayD = targetDate.getDate();

  let scheduledToday = 0;
  let completedToday = 0;

  habits.forEach(h => {
    scheduledToday++; // simplified assumption, or check h.days
    const key = `${h.id}_${todayY}_${todayM}_${todayD}`;
    if (logs[key]) completedToday++;
  });

  if (scheduledToday >= 5 && completedToday === 0) {
    recommendations.push({
      id: `rec-overload-${targetDate.getTime()}`,
      title: `Heavy day ahead?`,
      description: `You have ${scheduledToday} habits scheduled today. Focus on your highest-priority habit first to build momentum.`,
      actionLabel: 'Focus First Habit',
      actionType: 'COMPLETE_HABIT',
      priority: 10
    });
  }

  // Sort by priority descending
  return recommendations.sort((a, b) => b.priority - a.priority);
}

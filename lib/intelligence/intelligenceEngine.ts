import { Habit, HabitLog } from '../habitTypes';
import { InsightObj, RecommendationObj, TrendObj, IntelligenceEngineContract } from './intelligenceTypes';
import { generatePatterns } from './patternEngine';
import { generateTrends } from './trendEngine';
import { generateRecommendations } from './recommendationEngine';
import { calculateHabitHealth } from '../analyticsUtils';

/**
 * Deterministic Engine implementation of the IntelligenceEngineContract.
 * Calculates insights, trends, and recommendations using rule-based algorithms.
 */
class DeterministicEngine implements IntelligenceEngineContract {
  generateInsights(habits: Habit[], logs: HabitLog, targetDate: Date = new Date()): InsightObj[] {
    const insights: InsightObj[] = [];

    // 1. Get Patterns
    const patterns = generatePatterns(habits, logs, targetDate);
    insights.push(...patterns);

    // 2. Strongest Habit Insight
    if (habits.length > 0) {
      let strongestHabit: Habit | null = null;
      let highestRate = -1;

      habits.forEach(habit => {
        const health = calculateHabitHealth(habit, logs, 14);
        if (health.status !== '🌱 NEW' && health.rate > highestRate) {
          highestRate = health.rate;
          strongestHabit = habit;
        }
      });

      if (strongestHabit && highestRate >= 80) {
        insights.push({
          id: `strongest-${targetDate.getTime()}`,
          type: 'PERFORMANCE',
          title: `Consistent Focus`,
          description: `${strongestHabit.name} is currently your most consistent habit.`,
          priority: 9,
          evidence: `Thriving at ${highestRate}% completion over the last 14 days.`,
          period: 'WEEK',
          icon: '⭐'
        });
      }
    }

    // Sort by priority descending
    return insights.sort((a, b) => b.priority - a.priority);
  }

  generateRecommendations(habits: Habit[], logs: HabitLog, targetDate: Date = new Date()): RecommendationObj[] {
    return generateRecommendations(habits, logs, targetDate);
  }

  generateTrends(habits: Habit[], logs: HabitLog, targetDate: Date = new Date(), periods?: number[]): TrendObj[] {
    return generateTrends(habits, logs, targetDate, periods);
  }
}

// Export a singleton instance of the deterministic engine as the active intelligence engine.
// In the future, this could be replaced by a FutureAIEngine.
export const IntelligenceEngine = new DeterministicEngine();

import { Habit, HabitLog } from '../habitTypes';

export type InsightCategory = 
  | 'PERFORMANCE' 
  | 'CONSISTENCY' 
  | 'TREND' 
  | 'HABIT_HEALTH' 
  | 'MILESTONE' 
  | 'RECOVERY' 
  | 'GROWTH' 
  | 'RECORD';

export type TrendStatus = 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA';

export interface InsightObj {
  id: string;
  type: InsightCategory;
  title: string;
  description: string;
  priority: number; // Higher number = more important to show
  evidence: string;
  period: 'TODAY' | 'WEEK' | 'MONTH' | 'ALL_TIME';
  icon: string; // Emoji
}

export interface RecommendationObj {
  id: string;
  habitId?: string;
  title: string;
  description: string;
  actionLabel: string;
  actionType: 'EDIT_HABIT' | 'COMPLETE_HABIT' | 'REVIEW_SCHEDULE';
  priority: number;
}

export interface TrendObj {
  id: string;
  habitId?: string; // Optional if it's an overall trend
  metric: 'CONSISTENCY' | 'XP' | 'STREAK';
  status: TrendStatus;
  description: string;
  evidence: string;
  icon: string;
}

// The base contract that the DeterministicEngine (and future AIEngine) must implement
export interface IntelligenceEngineContract {
  generateInsights(habits: Habit[], logs: HabitLog, targetDate?: Date): InsightObj[];
  generateRecommendations(habits: Habit[], logs: HabitLog, targetDate?: Date): RecommendationObj[];
  generateTrends(habits: Habit[], logs: HabitLog, targetDate?: Date): TrendObj[];
}

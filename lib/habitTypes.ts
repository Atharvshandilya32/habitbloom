export type HabitCategory =
  | '🏃 Fitness'
  | '📚 Learning'
  | '💰 Finance'
  | '🧠 Mental Health'
  | '💼 Career'
  | '❤️ Relationships'
  | '🎯 Personal Growth';

export const HABIT_CATEGORIES: {
  id: HabitCategory;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
  { id: '🏃 Fitness', label: 'Fitness', emoji: '🏃', color: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  { id: '📚 Learning', label: 'Learning', emoji: '📚', color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
  { id: '💰 Finance', label: 'Finance', emoji: '💰', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
  { id: '🧠 Mental Health', label: 'Mental Health', emoji: '🧠', color: 'text-purple-500', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
  { id: '💼 Career', label: 'Career', emoji: '💼', color: 'text-indigo-500', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20' },
  { id: '❤️ Relationships', label: 'Relationships', emoji: '❤️', color: 'text-rose-500', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/20' },
  { id: '🎯 Personal Growth', label: 'Personal Growth', emoji: '🎯', color: 'text-teal-500', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/20' },
];

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  goal: number;
  category?: HabitCategory | string;
  color?: string;
  notes?: string;
  reminderTime?: string;
  reminderEnabled?: boolean;
  createdAt?: string;
  lastCompletedTime?: string;
}

export type HabitLog = Record<string, boolean>;

export interface WeeklyReviewSummary {
  weekLabel: string;
  startDate: string;
  endDate: string;
  completionRate: number;
  prevWeekCompletionRate: number;
  improvementDelta: number;
  totalCompleted: number;
  totalPossible: number;
  missedHabitsCount: number;
  bestHabit: { name: string; emoji: string; rate: number } | null;
  weakestHabit: { name: string; emoji: string; rate: number } | null;
  longestStreak: number;
  mostProductiveDay: string;
  leastProductiveDay: string;
  dailyBreakdown: { day: string; dateStr: string; completed: number; total: number; rate: number }[];
}

export interface HeatmapCell {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface PersonalRecords {
  longestStreak: number;
  highestCompletionWeek: number; // percentage
  highestCompletionMonth: number; // percentage
  mostCompletedInDay: number;
  perfectWeeks: number;
  perfectMonths: number;
  totalActiveDays: number;
  totalHabitsCompleted: number;
  consistencyScore: number; // 0-100
}

// --- Phase 3 Types ---

export type MoodType = '😁 Excellent' | '😊 Good' | '😐 Okay' | '😔 Bad' | '😴 Tired';

export interface JournalEntry {
  id: string;
  habitId?: string;
  date: string; // YYYY-MM-DD
  notes: string;
  mood?: MoodType;
  energyLevel?: number; // 1-5
  difficulty?: number; // 1-5
  wins?: string;
  challenges?: string;
}

export interface Goal {
  id: string;
  title: string;
  targetCount: number;
  currentProgress: number;
  metric: string; // e.g. "books", "days", "hours"
  linkedHabitIds?: string[];
  createdAt: string;
  estimatedCompletionDate?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  totalDays: number;
  daysCompleted: number;
  linkedHabitId?: string;
  startDate: string;
  isActive: boolean;
}

export interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  habits: Partial<Habit>[];
}

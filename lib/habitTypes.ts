export interface Habit {
  id: string;
  name: string;
  emoji: string;
  goal: number;
  reminderTime?: string;
  reminderEnabled?: boolean;
}

export type HabitLog = Record<string, boolean>;

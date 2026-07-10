export interface Habit {
  id: string;
  name: string;
  emoji: string;
  goal: number;
}

export type HabitLog = Record<string, boolean>;

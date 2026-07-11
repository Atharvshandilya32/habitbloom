export interface Goal {
  id: string;
  habitId: string;
  habitName: string;
  type: 'weekly' | 'monthly';
  target: number;
  unit: string; // e.g., "times", "minutes", "pages"
  startDate: string; // ISO date
  endDate: string; // ISO date
  createdAt: string;
}

export interface GoalProgress {
  goalId: string;
  current: number;
  percentage: number;
  completed: boolean;
}

export const createGoal = (
  habitId: string,
  habitName: string,
  type: 'weekly' | 'monthly',
  target: number,
  unit: string
): Goal => {
  const startDate = new Date();
  const endDate = new Date();

  if (type === 'weekly') {
    // Start from Monday
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);
    endDate.setDate(startDate.getDate() + 6);
  } else {
    // Monthly: start from 1st of month
    startDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
  }

  return {
    id: `goal-${Date.now()}-${Math.random()}`,
    habitId,
    habitName,
    type,
    target,
    unit,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };
};

export const calculateGoalProgress = (
  goal: Goal,
  logs: Record<string, number[]>
): GoalProgress => {
  const habitLogs = logs[goal.habitId] || [];
  const startDate = new Date(goal.startDate);
  const endDate = new Date(goal.endDate);

  let current = 0;
  habitLogs.forEach((logDate) => {
    const date = new Date(logDate);
    if (date >= startDate && date <= endDate) {
      current++;
    }
  });

  const percentage = Math.min(Math.round((current / goal.target) * 100), 100);
  const completed = current >= goal.target;

  return {
    goalId: goal.id,
    current,
    percentage,
    completed,
  };
};

export const isGoalActive = (goal: Goal): boolean => {
  const today = new Date();
  const startDate = new Date(goal.startDate);
  const endDate = new Date(goal.endDate);
  return today >= startDate && today <= endDate;
};

export const daysUntilGoalEnds = (goal: Goal): number => {
  const today = new Date();
  const endDate = new Date(goal.endDate);
  const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};

export type CustomWritingGoalType = 'weekly' | 'monthly';

export interface CustomWritingGoal {
  id: string;
  type: CustomWritingGoalType;
  content: string; // free-text
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  createdAt: string; // ISO
}

function toYMD(d: Date) {
  return d.toISOString().split('T')[0];
}

function startOfWeekMonday(d: Date) {
  const date = new Date(d);
  // JS: 0=Sun, 1=Mon ... 6=Sat
  const day = date.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diffToMonday);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfWeekSunday(d: Date) {
  const monday = startOfWeekMonday(d);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

function startOfMonth(d: Date) {
  const date = new Date(d);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfMonth(d: Date) {
  const date = new Date(d);
  date.setMonth(date.getMonth() + 1, 0); // last day of month
  date.setHours(23, 59, 59, 999);
  return date;
}

export function createWeeklyWritingGoal(content: string): CustomWritingGoal {
  const now = new Date();
  const start = startOfWeekMonday(now);
  const end = endOfWeekSunday(now);

  return {
    id: `w-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: 'weekly',
    content,
    startDate: toYMD(start),
    endDate: toYMD(end),
    createdAt: new Date().toISOString(),
  };
}

export function createMonthlyWritingGoal(content: string): CustomWritingGoal {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  return {
    id: `m-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: 'monthly',
    content,
    startDate: toYMD(start),
    endDate: toYMD(end),
    createdAt: new Date().toISOString(),
  };
}

export function isWeeklyGoalActive(goal: CustomWritingGoal): boolean {
  if (goal.type !== 'weekly') return false;
  const today = new Date();

  const start = new Date(goal.startDate);
  const end = new Date(goal.endDate);
  // normalize to end of day
  end.setHours(23, 59, 59, 999);

  return today >= start && today <= end;
}

export function isMonthlyGoalActive(goal: CustomWritingGoal): boolean {
  if (goal.type !== 'monthly') return false;
  const today = new Date();

  const start = new Date(goal.startDate);
  const end = new Date(goal.endDate);
  end.setHours(23, 59, 59, 999);

  return today >= start && today <= end;
}

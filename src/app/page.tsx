'use client';

import { useEffect, useMemo, useState } from 'react';
import TitleBanner from './components/charts/TitleBanner';
import RequireAuth from './auth/RequireAuth';
import HabitGrid from './components/habitGrid';
import HabitSummaryTable from './components/HabitSummaryTable';
import WeeklyProgress from './components/WeeklyProgress';
import OverviewPanel from './components/OverviewPanel';
import CalendarSettings from './components/CalendarSettings';
import WeeklyCustomGoals from './components/WeeklyCustomGoals';
import MonthlyCustomGoals from './components/MonthlyCustomGoals';
import { Habit, HabitLog } from '../../lib/habitTypes';
import { createMonthlyWritingGoal, createWeeklyWritingGoal, CustomWritingGoal } from '../../lib/customWritingGoals';
import { getHabitStats } from '../../lib/habitUtils';

const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

export default function Page() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog>({});
  const [habitLogsArray, setHabitLogsArray] = useState<Record<string, number[]>>({});
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const [weeklyWritingGoals, setWeeklyWritingGoals] = useState<CustomWritingGoal[]>([]);
  const [monthlyWritingGoals, setMonthlyWritingGoals] = useState<CustomWritingGoal[]>([]);

  useEffect(() => {
    const savedHabits = localStorage.getItem('habitbloom_habits');
    const savedLogs = localStorage.getItem('habitbloom_logs');
    const savedLogsArray = localStorage.getItem('habitbloom_logs_array');

    const savedWeeklyWriting = localStorage.getItem('habitbloom_weekly_writing_goals');
    const savedMonthlyWriting = localStorage.getItem('habitbloom_monthly_writing_goals');

    if (savedHabits) {
      try {
        setHabits(JSON.parse(savedHabits));
      } catch {
        setHabits([]);
      }
    } else {
      setHabits([
        { id: 'habit-1', name: 'Drink water', emoji: '💧', goal: 10 },
        { id: 'habit-2', name: 'Read', emoji: '📚', goal: 5 },
      ]);
    }

    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch {
        setLogs({});
      }
    }

    if (savedLogsArray) {
      try {
        setHabitLogsArray(JSON.parse(savedLogsArray));
      } catch {
        setHabitLogsArray({});
      }
    }

    if (savedWeeklyWriting) {
      try {
        setWeeklyWritingGoals(JSON.parse(savedWeeklyWriting));
      } catch {
        setWeeklyWritingGoals([]);
      }
    }

    if (savedMonthlyWriting) {
      try {
        setMonthlyWritingGoals(JSON.parse(savedMonthlyWriting));
      } catch {
        setMonthlyWritingGoals([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('habitbloom_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('habitbloom_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('habitbloom_logs_array', JSON.stringify(habitLogsArray));
  }, [habitLogsArray]);

  useEffect(() => {
    localStorage.setItem('habitbloom_weekly_writing_goals', JSON.stringify(weeklyWritingGoals));
  }, [weeklyWritingGoals]);

  useEffect(() => {
    localStorage.setItem('habitbloom_monthly_writing_goals', JSON.stringify(monthlyWritingGoals));
  }, [monthlyWritingGoals]);

  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const monthlyOverviewData = useMemo(() => {
    const averagePct = habits.length
      ? Math.round(
          habits.reduce((sum, habit) => sum + getHabitStats(habit, logs, daysInMonth).pct, 0) / habits.length
        )
      : 0;

    return Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      pct:
        index + 1 === month
          ? averagePct
          : Math.max(0, averagePct - (month - (index + 1)) * 6),
    }));
  }, [habits, logs, daysInMonth, month]);

  const handleToggleCell = (habitId: string, day: number) => {
    const key = `${habitId}_${day}`;
    const dateTimestamp = new Date(year, month - 1, day).getTime();

    setLogs((prev) => ({ ...prev, [key]: !prev[key] }));

    setHabitLogsArray((prev) => {
      const logs = prev[habitId] || [];
      const index = logs.indexOf(dateTimestamp);

      if (index === -1) {
        return { ...prev, [habitId]: [...logs, dateTimestamp].sort() };
      }

      return { ...prev, [habitId]: logs.filter((_, i) => i !== index) };
    });
  };

  const handleAddHabit = () => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: 'New habit',
      emoji: '⭐',
      goal: 5,
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
    setLogs((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`${habitId}_`)) delete next[key];
      });
      return next;
    });
  };

  const handleUpdateHabit = (habitId: string, updates: Partial<Habit>) => {
    setHabits((prev) => prev.map((habit) => (habit.id === habitId ? { ...habit, ...updates } : habit)));
  };

  const handleAddWeeklyWritingGoal = (content: string) => {
    const g = createWeeklyWritingGoal(content);
    setWeeklyWritingGoals((prev) => [...prev, g]);
  };

  const handleDeleteWeeklyWritingGoal = (goalId: string) => {
    setWeeklyWritingGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const handleAddMonthlyWritingGoal = (content: string) => {
    const g = createMonthlyWritingGoal(content);
    setMonthlyWritingGoals((prev) => [...prev, g]);
  };

  const handleDeleteMonthlyWritingGoal = (goalId: string) => {
    setMonthlyWritingGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  return (
    <RequireAuth>
      <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
        <div className="mx-auto max-w-7xl space-y-6">
          <TitleBanner />

          <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-bold">HabitBloom is working</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This page runs with a working HabitGrid component and a working page import.
            </p>
          </section>

          <CalendarSettings year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <WeeklyCustomGoals
                goals={weeklyWritingGoals}
                onAdd={handleAddWeeklyWritingGoal}
                onDelete={handleDeleteWeeklyWritingGoal}
              />
            </div>

            <div className="space-y-6">
              <MonthlyCustomGoals
                goals={monthlyWritingGoals}
                onAdd={handleAddMonthlyWritingGoal}
                onDelete={handleDeleteMonthlyWritingGoal}
              />
            </div>
          </div>

          <HabitGrid
            habits={habits}
            logs={logs}
            year={year}
            month={month}
            daysInMonth={daysInMonth}
            onToggleCell={handleToggleCell}
            onAddHabit={handleAddHabit}
            onDeleteHabit={handleDeleteHabit}
            onUpdateHabit={handleUpdateHabit}
          />

          <OverviewPanel
            habits={habits}
            logs={logs}
            daysInMonth={daysInMonth}
            year={year}
            month={month}
            monthlyOverviewData={monthlyOverviewData}
          />

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[1.6fr_1fr]">
            <HabitSummaryTable habits={habits} logs={logs} daysInMonth={daysInMonth} />
            <WeeklyProgress
              habits={habits}
              logs={logs}
              year={year}
              month={month}
              daysInMonth={daysInMonth}
            />
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}


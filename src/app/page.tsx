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

// Firebase imports
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, onValue, set } from 'firebase/database';
import { auth, database } from '../../lib/firebase';

const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

export default function Page() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog>({});
  const [habitLogsArray, setHabitLogsArray] = useState<Record<string, number[]>>({});
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const [weeklyWritingGoals, setWeeklyWritingGoals] = useState<CustomWritingGoal[]>([]);
  const [monthlyWritingGoals, setMonthlyWritingGoals] = useState<CustomWritingGoal[]>([]);

  // Firebase auth & loading state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingFirebase, setIsLoadingFirebase] = useState(true);

  // Helper function to sync individual paths to Firebase
  const syncToFirebase = (key: string, value: unknown) => {
    if (database && currentUser) {
      set(ref(database, `users/${currentUser.uid}/${key}`), value);
    }
  };

  // 1. Load goals from localStorage on mount (initial fallback)
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

  // 2. Save goals to localStorage whenever they change locally (for offline support)
  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem('habitbloom_habits', JSON.stringify(habits));
    }
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

  // 3. Listen to auth state
  useEffect(() => {
    if (!auth) {
      setIsLoadingFirebase(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setIsLoadingFirebase(false);
      }
    });
    return () => unsub();
  }, []);

  // 4. Real-time Firebase Sync subscription
  useEffect(() => {
    if (!database || !currentUser) return;

    const userRef = ref(database, `users/${currentUser.uid}`);
    setIsLoadingFirebase(true);

    const unsubscribe = onValue(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.habits) setHabits(data.habits);
          if (data.logs) setLogs(data.logs);
          if (data.habitLogsArray) setHabitLogsArray(data.habitLogsArray);
          if (data.weeklyWritingGoals) setWeeklyWritingGoals(data.weeklyWritingGoals);
          if (data.monthlyWritingGoals) setMonthlyWritingGoals(data.monthlyWritingGoals);
        } else {
          // Initialize empty database with current localStorage/default states
          set(userRef, {
            habits: habits.length > 0 ? habits : [
              { id: 'habit-1', name: 'Drink water', emoji: '💧', goal: 10 },
              { id: 'habit-2', name: 'Read', emoji: '📚', goal: 5 },
            ],
            logs,
            habitLogsArray,
            weeklyWritingGoals,
            monthlyWritingGoals,
          });
        }
        setIsLoadingFirebase(false);
      },
      (error) => {
        console.error('Firebase Realtime Database sync error:', error);
        setIsLoadingFirebase(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

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

    const updatedLogs = { ...logs, [key]: !logs[key] };
    setLogs(updatedLogs);
    syncToFirebase('logs', updatedLogs);

    const logsArray = habitLogsArray[habitId] || [];
    const index = logsArray.indexOf(dateTimestamp);
    const updatedLogsArray = {
      ...habitLogsArray,
      [habitId]: index === -1
        ? [...logsArray, dateTimestamp].sort()
        : logsArray.filter((_, i) => i !== index),
    };
    setHabitLogsArray(updatedLogsArray);
    syncToFirebase('habitLogsArray', updatedLogsArray);
  };

  const handleAddHabit = () => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: 'New habit',
      emoji: '⭐',
      goal: 5,
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    syncToFirebase('habits', updated);
  };

  const handleDeleteHabit = (habitId: string) => {
    const updatedHabits = habits.filter((habit) => habit.id !== habitId);
    setHabits(updatedHabits);
    syncToFirebase('habits', updatedHabits);

    const nextLogs = { ...logs };
    Object.keys(nextLogs).forEach((key) => {
      if (key.startsWith(`${habitId}_`)) delete nextLogs[key];
    });
    setLogs(nextLogs);
    syncToFirebase('logs', nextLogs);

    const nextLogsArray = { ...habitLogsArray };
    if (nextLogsArray[habitId]) {
      delete nextLogsArray[habitId];
      setHabitLogsArray(nextLogsArray);
      syncToFirebase('habitLogsArray', nextLogsArray);
    }
  };

  const handleUpdateHabit = (habitId: string, updates: Partial<Habit>) => {
    const updated = habits.map((habit) => (habit.id === habitId ? { ...habit, ...updates } : habit));
    setHabits(updated);
    syncToFirebase('habits', updated);
  };

  const handleAddWeeklyWritingGoal = (content: string) => {
    const g = createWeeklyWritingGoal(content);
    const updated = [...weeklyWritingGoals, g];
    setWeeklyWritingGoals(updated);
    syncToFirebase('weeklyWritingGoals', updated);
  };

  const handleDeleteWeeklyWritingGoal = (goalId: string) => {
    const updated = weeklyWritingGoals.filter((g) => g.id !== goalId);
    setWeeklyWritingGoals(updated);
    syncToFirebase('weeklyWritingGoals', updated);
  };

  const handleAddMonthlyWritingGoal = (content: string) => {
    const g = createMonthlyWritingGoal(content);
    const updated = [...monthlyWritingGoals, g];
    setMonthlyWritingGoals(updated);
    syncToFirebase('monthlyWritingGoals', updated);
  };

  const handleDeleteMonthlyWritingGoal = (goalId: string) => {
    const updated = monthlyWritingGoals.filter((g) => g.id !== goalId);
    setMonthlyWritingGoals(updated);
    syncToFirebase('monthlyWritingGoals', updated);
  };

  if (isLoadingFirebase) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600 gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Syncing with cloud...</p>
      </div>
    );
  }

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


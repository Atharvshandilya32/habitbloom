'use client';

import { useEffect, useRef, useState } from 'react';
import Navbar from './components/charts/TitleBanner';
import RequireAuth from './auth/RequireAuth';
import KpiSummaryHeader from './components/KpiSummaryHeader';
import HabitGrid from './components/habitGrid';
import HabitSummaryTable from './components/HabitSummaryTable';
import WeeklyProgress from './components/WeeklyProgress';
import OverviewPanel from './components/OverviewPanel';
import CalendarSettings from './components/CalendarSettings';
import WeeklyCustomGoals from './components/WeeklyCustomGoals';
import MonthlyCustomGoals from './components/MonthlyCustomGoals';
import UserProfile from './components/UserProfile';
import ReferralPanel from './components/ReferralPanel';
import GuideModal, { GuideReminder, shouldShowGuide } from './components/GuideModal';
import HabitReminderSettings from './components/HabitReminderSettings';

import { Habit, HabitLog } from '../../lib/habitTypes';
import { createMonthlyWritingGoal, createWeeklyWritingGoal, CustomWritingGoal } from '../../lib/customWritingGoals';
import { makeLogKey, getMonthKeyPrefix } from '../../lib/habitUtils';
import { useHabitReminders } from '../../lib/useHabitReminders';

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

  // Guide modal
  const [guideOpen, setGuideOpen] = useState(false);

  // Section refs for smooth scrolling navigation
  const profileRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const statisticsRef = useRef<HTMLDivElement>(null);

  // Reminders hook
  const {
    config: reminderConfig,
    permission: notificationPermission,
    updateConfig: updateReminderConfig,
    requestPermission: requestNotificationPermission,
    sendNotification: sendTestNotification,
  } = useHabitReminders(habits, logs);

  // Open guide on first visit
  useEffect(() => {
    if (shouldShowGuide()) setGuideOpen(true);
  }, []);

  const handleScrollToProfile = () => {
    profileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleScrollToSection = (sectionId: string) => {
    if (sectionId === 'calendar') {
      calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (sectionId === 'statistics') {
      statisticsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper function to sync individual paths to Firebase
  const syncToFirebase = (key: string, value: unknown) => {
    if (database && currentUser) {
      set(ref(database, `users/${currentUser.uid}/${key}`), value);
    }
  };

  // 1. Load from localStorage on mount (initial fallback)
  useEffect(() => {
    const savedHabits = localStorage.getItem('habitbloom_habits');
    const savedLogs = localStorage.getItem('habitbloom_logs');
    const savedLogsArray = localStorage.getItem('habitbloom_logs_array');
    const savedWeeklyWriting = localStorage.getItem('habitbloom_weekly_writing_goals');
    const savedMonthlyWriting = localStorage.getItem('habitbloom_monthly_writing_goals');

    if (savedHabits) {
      try { setHabits(JSON.parse(savedHabits)); } catch { setHabits([]); }
    } else {
      setHabits([
        { id: 'habit-1', name: 'Drink water', emoji: '💧', goal: 10 },
        { id: 'habit-2', name: 'Read', emoji: '📚', goal: 5 },
      ]);
    }

    if (savedLogs) {
      try { setLogs(JSON.parse(savedLogs)); } catch { setLogs({}); }
    }

    if (savedLogsArray) {
      try { setHabitLogsArray(JSON.parse(savedLogsArray)); } catch { setHabitLogsArray({}); }
    }

    if (savedWeeklyWriting) {
      try { setWeeklyWritingGoals(JSON.parse(savedWeeklyWriting)); } catch { setWeeklyWritingGoals([]); }
    }

    if (savedMonthlyWriting) {
      try { setMonthlyWritingGoals(JSON.parse(savedMonthlyWriting)); } catch { setMonthlyWritingGoals([]); }
    }
  }, []);

  // 2. Save to localStorage on change
  useEffect(() => {
    if (habits.length > 0) localStorage.setItem('habitbloom_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => { localStorage.setItem('habitbloom_logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('habitbloom_logs_array', JSON.stringify(habitLogsArray)); }, [habitLogsArray]);
  useEffect(() => { localStorage.setItem('habitbloom_weekly_writing_goals', JSON.stringify(weeklyWritingGoals)); }, [weeklyWritingGoals]);
  useEffect(() => { localStorage.setItem('habitbloom_monthly_writing_goals', JSON.stringify(monthlyWritingGoals)); }, [monthlyWritingGoals]);

  // 3. Listen to auth state
  useEffect(() => {
    if (!auth) { setIsLoadingFirebase(false); return; }
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) setIsLoadingFirebase(false);
    });
    return () => unsub();
  }, []);

  // 4. Real-time Firebase Sync
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
        console.error('Firebase sync error:', error);
        setIsLoadingFirebase(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const daysInMonth = getDaysInMonth(year, month);

  // ── Toggle cell — uses new date-aware key ────────────────────────────────
  const handleToggleCell = (habitId: string, day: number) => {
    const key = makeLogKey(habitId, year, month, day);
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

  // ── Reset only the selected month's ticks ───────────────────────────────
  const handleResetMonth = () => {
    const prefix = getMonthKeyPrefix(year, month);
    const updatedLogs = Object.fromEntries(
      Object.entries(logs).filter(([key]) => !key.includes(prefix))
    );
    setLogs(updatedLogs);
    syncToFirebase('logs', updatedLogs);

    // Clean habitLogsArray for this month
    const monthStart = new Date(year, month - 1, 1).getTime();
    const monthEnd = new Date(year, month, 1).getTime();
    const updatedLogsArray = Object.fromEntries(
      Object.entries(habitLogsArray).map(([habitId, timestamps]) => [
        habitId,
        timestamps.filter(ts => ts < monthStart || ts >= monthEnd),
      ])
    );
    setHabitLogsArray(updatedLogsArray);
    syncToFirebase('habitLogsArray', updatedLogsArray);
  };

  // ── Habits CRUD ──────────────────────────────────────────────────────────
  const handleAddHabit = () => {
    const newHabit: Habit = { id: `habit-${Date.now()}`, name: 'New habit', emoji: '⭐', goal: 5 };
    const updated = [...habits, newHabit];
    setHabits(updated);
    syncToFirebase('habits', updated);
  };

  const handleDeleteHabit = (habitId: string) => {
    const updatedHabits = habits.filter(h => h.id !== habitId);
    setHabits(updatedHabits);
    syncToFirebase('habits', updatedHabits);

    const nextLogs = { ...logs };
    Object.keys(nextLogs).forEach(key => {
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
    const updated = habits.map(h => h.id === habitId ? { ...h, ...updates } : h);
    setHabits(updated);
    syncToFirebase('habits', updated);
  };

  // ── Writing Goals ────────────────────────────────────────────────────────
  const handleAddWeeklyWritingGoal = (content: string) => {
    const g = createWeeklyWritingGoal(content);
    const updated = [...weeklyWritingGoals, g];
    setWeeklyWritingGoals(updated);
    syncToFirebase('weeklyWritingGoals', updated);
  };

  const handleDeleteWeeklyWritingGoal = (goalId: string) => {
    const updated = weeklyWritingGoals.filter(g => g.id !== goalId);
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
    const updated = monthlyWritingGoals.filter(g => g.id !== goalId);
    setMonthlyWritingGoals(updated);
    syncToFirebase('monthlyWritingGoals', updated);
  };

  if (isLoadingFirebase) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600 gap-3">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Syncing with cloud...</p>
      </div>
    );
  }

  return (
    <RequireAuth>
      {/* Onboarding Guide Modal */}
      <GuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Sticky Navbar */}
      <Navbar
        user={currentUser}
        onOpenGuide={() => setGuideOpen(true)}
        onScrollToProfile={handleScrollToProfile}
        onScrollToSection={handleScrollToSection}
      />

      <main className="min-h-screen bg-slate-50/70 p-4 sm:p-6 text-slate-950">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Guide reminder banner (shown if user skipped) */}
          <GuideReminder onOpenGuide={() => setGuideOpen(true)} />

          {/* Calendar Month & Year Controls */}
          <div ref={calendarRef}>
            <CalendarSettings
              year={year}
              month={month}
              onYearChange={setYear}
              onMonthChange={setMonth}
              onResetMonth={handleResetMonth}
            />
          </div>

          {/* ROW 1: Top KPI Summary Header */}
          <KpiSummaryHeader
            habits={habits}
            logs={logs}
            year={year}
            month={month}
            onAddHabit={handleAddHabit}
          />

          {/* ROW 2: Daily Habit Grid (Hero Section) */}
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

          {/* ROW 3: Goals Hub (Weekly & Monthly Goals) */}
          <div className="grid gap-6 lg:grid-cols-2">
            <WeeklyCustomGoals
              goals={weeklyWritingGoals}
              onAdd={handleAddWeeklyWritingGoal}
              onDelete={handleDeleteWeeklyWritingGoal}
            />
            <MonthlyCustomGoals
              goals={monthlyWritingGoals}
              onAdd={handleAddMonthlyWritingGoal}
              onDelete={handleDeleteMonthlyWritingGoal}
            />
          </div>

          {/* ROW 4: Statistics Summary Cards */}
          <div ref={statisticsRef}>
            <OverviewPanel
              habits={habits}
              logs={logs}
              daysInMonth={daysInMonth}
              year={year}
              month={month}
            />
          </div>

          {/* ROW 5: Reminder Settings */}
          <HabitReminderSettings
            config={reminderConfig}
            permission={notificationPermission}
            habits={habits}
            onUpdateConfig={updateReminderConfig}
            onRequestPermission={requestNotificationPermission}
            onSendTestNotification={sendTestNotification}
            onUpdateHabit={handleUpdateHabit}
          />

          {/* ROW 6: Charts & Analytics Breakdown */}
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[1.6fr_1fr]">
            <HabitSummaryTable
              habits={habits}
              logs={logs}
              daysInMonth={daysInMonth}
              year={year}
              month={month}
            />
            <WeeklyProgress
              habits={habits}
              logs={logs}
              year={year}
              month={month}
              daysInMonth={daysInMonth}
            />
          </div>

          {/* ROW 7 (Bottom): User Profile & Referral Panel */}
          <div ref={profileRef} className="grid gap-6 lg:grid-cols-2">
            {currentUser && (
              <UserProfile
                user={currentUser}
                habits={habits}
                logs={logs}
                currentYear={year}
                currentMonth={month}
              />
            )}
            {currentUser && (
              <ReferralPanel userId={currentUser.uid} />
            )}
          </div>

        </div>
      </main>
    </RequireAuth>
  );
}

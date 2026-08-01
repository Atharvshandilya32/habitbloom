'use client';

import { useEffect, useState } from 'react';
import Navbar, { NavTab } from './components/charts/TitleBanner';
import RequireAuth from './auth/RequireAuth';
import GuideModal, { GuideReminder, shouldShowGuide } from './components/GuideModal';
import CalendarSettings from './components/CalendarSettings';

// Phase 2 & 3 Views
import DailyFocusView from './components/DailyFocusView';
import DashboardView from './components/DashboardView';
import WeeklyReviewView from './components/WeeklyReviewView';
import AnalyticsView from './components/AnalyticsView';
import PersonalRecordsView from './components/PersonalRecordsView';
import SettingsView from './components/SettingsView';
import GoalsView from './components/GoalsView';
import ChallengesView from './components/ChallengesView';
import TimelineView from './components/TimelineView';

// Phase 3 UX Components
import CommandPalette from './components/CommandPalette';
import Toast from './components/Toast';
import JournalModal from './components/JournalModal';
import { useKeyboardShortcuts } from '../../lib/keyboardShortcuts';

import { Habit, HabitLog, Goal as GoalType, Challenge, JournalEntry } from '../../lib/habitTypes';
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

  // Phase 3 Data State
  const [goals, setGoals] = useState<GoalType[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);

  // Navigation Tab state
  const [activeTab, setActiveTab] = useState<NavTab>('focus');

  // Firebase auth & loading state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingFirebase, setIsLoadingFirebase] = useState(true);

  // UI State
  const [guideOpen, setGuideOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  
  // Journal Modal State
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [selectedHabitForJournal, setSelectedHabitForJournal] = useState<Habit | undefined>(undefined);

  // Reminders hook
  const {
    config: reminderConfig,
    permission: notificationPermission,
    updateConfig: updateReminderConfig,
    requestPermission: requestNotificationPermission,
    sendNotification: sendTestNotification,
  } = useHabitReminders(habits, logs);

  // Global Keyboard Shortcuts
  useKeyboardShortcuts({
    onNewHabit: () => {
      setActiveTab('dashboard'); // the "Add Habit" button is on the dashboard
      // Ideally we'd open a create habit modal, but we'll focus tab
    },
    onSearch: () => setCmdOpen(true),
    onGoals: () => setActiveTab('goals'),
    onJournal: () => setJournalModalOpen(true),
    onAnalytics: () => setActiveTab('analytics'),
    onHelp: () => setGuideOpen(true),
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastOpen(true);
  };

  // Open guide on first visit
  useEffect(() => {
    if (shouldShowGuide()) setGuideOpen(true);
  }, []);

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
    const savedGoals = localStorage.getItem('habitbloom_goals');
    const savedChallenges = localStorage.getItem('habitbloom_challenges');
    const savedJournals = localStorage.getItem('habitbloom_journals');

    if (savedHabits) {
      try { setHabits(JSON.parse(savedHabits)); } catch { setHabits([]); }
    } else {
      setHabits([
        { id: 'habit-1', name: 'Drink water', emoji: '💧', goal: 10, category: '🏃 Fitness' },
        { id: 'habit-2', name: 'Read books', emoji: '📚', goal: 5, category: '📚 Learning' },
      ]);
    }

    if (savedLogs) {
      try { setLogs(JSON.parse(savedLogs)); } catch { setLogs({}); }
    }
    if (savedLogsArray) {
      try { setHabitLogsArray(JSON.parse(savedLogsArray)); } catch { setHabitLogsArray({}); }
    }
    if (savedGoals) {
      try { setGoals(JSON.parse(savedGoals)); } catch { setGoals([]); }
    }
    if (savedChallenges) {
      try { setChallenges(JSON.parse(savedChallenges)); } catch { setChallenges([]); }
    }
    if (savedJournals) {
      try { setJournals(JSON.parse(savedJournals)); } catch { setJournals([]); }
    }
  }, []);

  // 2. Save to localStorage on change
  useEffect(() => { if (habits.length > 0) localStorage.setItem('habitbloom_habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('habitbloom_logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('habitbloom_logs_array', JSON.stringify(habitLogsArray)); }, [habitLogsArray]);
  useEffect(() => { localStorage.setItem('habitbloom_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('habitbloom_challenges', JSON.stringify(challenges)); }, [challenges]);
  useEffect(() => { localStorage.setItem('habitbloom_journals', JSON.stringify(journals)); }, [journals]);

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
          if (data.goals) setGoals(data.goals);
          if (data.challenges) setChallenges(data.challenges);
          if (data.journals) setJournals(data.journals);
        } else {
          set(userRef, {
            habits: habits.length > 0 ? habits : [
              { id: 'habit-1', name: 'Drink water', emoji: '💧', goal: 10, category: '🏃 Fitness' },
              { id: 'habit-2', name: 'Read books', emoji: '📚', goal: 5, category: '📚 Learning' },
            ],
            logs,
            habitLogsArray,
            goals,
            challenges,
            journals,
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

  // ── Toggle cell ────────────────────────────────────────────────────────
  const handleToggleCell = (habitId: string, day: number) => {
    const key = makeLogKey(habitId, year, month, day);
    const dateTimestamp = new Date(year, month - 1, day).getTime();

    const isNowCompleted = !logs[key];
    const updatedLogs = { ...logs, [key]: isNowCompleted };
    
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

    if (isNowCompleted) {
      showToast('Habit completed! Keep it up.');
    }
  };

  // ── Reset current month ────────────────────────────────────────────────
  const handleResetMonth = () => {
    const prefix = getMonthKeyPrefix(year, month);
    const updatedLogs = Object.fromEntries(
      Object.entries(logs).filter(([key]) => !key.includes(prefix))
    );
    setLogs(updatedLogs);
    syncToFirebase('logs', updatedLogs);

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
    showToast('Month reset.');
  };

  // ── Reset all local data ───────────────────────────────────────────────
  const handleClearLocalData = () => {
    setLogs({});
    setHabitLogsArray({});
    setJournals([]);
    setGoals([]);
    setChallenges([]);
    localStorage.clear();
    syncToFirebase('logs', {});
    syncToFirebase('habitLogsArray', {});
    syncToFirebase('journals', []);
    syncToFirebase('goals', []);
    syncToFirebase('challenges', []);
    showToast('All local data cleared.');
  };

  // ── Habits CRUD ──────────────────────────────────────────────────────────
  const handleAddHabit = () => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: 'New Habit',
      emoji: '⭐',
      goal: 10,
      category: '🎯 Personal Growth',
      createdAt: new Date().toISOString(),
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    syncToFirebase('habits', updated);
    showToast('Habit added.');
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
    showToast('Habit deleted.');
  };

  const handleUpdateHabit = (habitId: string, updates: Partial<Habit>) => {
    const updated = habits.map(h => h.id === habitId ? { ...h, ...updates } : h);
    setHabits(updated);
    syncToFirebase('habits', updated);
  };

  // ── Phase 3 CRUD Handlers ────────────────────────────────────────────────
  const handleAddGoal = (goal: GoalType) => {
    const updated = [...goals, goal];
    setGoals(updated);
    syncToFirebase('goals', updated);
    showToast('Goal created.');
  };

  const handleUpdateGoal = (goalId: string, updates: Partial<GoalType>) => {
    const updated = goals.map(g => g.id === goalId ? { ...g, ...updates } : g);
    setGoals(updated);
    syncToFirebase('goals', updated);
  };

  const handleJoinChallenge = (challenge: Challenge) => {
    const updated = [...challenges, challenge];
    setChallenges(updated);
    syncToFirebase('challenges', updated);
    showToast(`Joined ${challenge.title}!`);
  };

  const handleSaveJournal = (entry: JournalEntry) => {
    const updated = [...journals.filter(j => j.id !== entry.id), entry];
    setJournals(updated);
    syncToFirebase('journals', updated);
    showToast('Journal saved.');
  };

  if (isLoadingFirebase) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600 gap-3">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Syncing HabitBloom Cloud...</p>
      </div>
    );
  }

  const todayDateStr = `${year}-${String(month).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  return (
    <RequireAuth>
      <CommandPalette 
        isOpen={cmdOpen} 
        onClose={() => setCmdOpen(false)}
        habits={habits}
        goals={goals}
        challenges={challenges}
        onNavigate={setActiveTab}
      />
      <Toast message={toastMsg} isVisible={toastOpen} onClose={() => setToastOpen(false)} />
      <JournalModal 
        isOpen={journalModalOpen} 
        onClose={() => { setJournalModalOpen(false); setSelectedHabitForJournal(undefined); }}
        habit={selectedHabitForJournal}
        dateStr={todayDateStr}
        onSave={handleSaveJournal}
      />

      <GuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Sticky Navbar */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenGuide={() => setGuideOpen(true)}
        onOpenSearch={() => setCmdOpen(true)}
      />

      <main className="min-h-screen bg-slate-50/70 p-4 sm:p-6 text-slate-950 pb-20">
        <h1 className="sr-only">HabitBloom – SaaS Habit Tracker & Productivity Operating System</h1>

        <div className="mx-auto max-w-7xl space-y-6">
          
          {/* Calendar Selector Bar */}
          {(activeTab === 'dashboard' || activeTab === 'analytics' || activeTab === 'focus') && (
            <CalendarSettings
              year={year}
              month={month}
              onYearChange={setYear}
              onMonthChange={setMonth}
              onResetMonth={handleResetMonth}
            />
          )}

          {/* Tab Views */}
          {activeTab === 'focus' && (
            <DailyFocusView
              habits={habits}
              logs={logs}
              year={year}
              month={month}
              day={new Date().getDate()} // Focus today
              onToggleCell={(habitId, day) => {
                handleToggleCell(habitId, day);
                // Prompt for journal optionally? Or keep it simple.
              }}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'goals' && (
            <GoalsView
              goals={goals}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
            />
          )}

          {activeTab === 'challenges' && (
            <ChallengesView
              challenges={challenges}
              onJoinChallenge={handleJoinChallenge}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineView
              journals={journals}
              habits={habits}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              user={currentUser}
              habits={habits}
              logs={logs}
              year={year}
              month={month}
              daysInMonth={daysInMonth}
              onToggleCell={handleToggleCell}
              onAddHabit={handleAddHabit}
              onDeleteHabit={handleDeleteHabit}
              onUpdateHabit={handleUpdateHabit}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <WeeklyReviewView
                habits={habits}
                logs={logs}
                onGoToDashboard={() => setActiveTab('dashboard')}
              />
              <AnalyticsView
                habits={habits}
                logs={logs}
                onGoToDashboard={() => setActiveTab('dashboard')}
              />
            </div>
          )}

          {activeTab === 'records' && (
            <PersonalRecordsView
              habits={habits}
              logs={logs}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              user={currentUser}
              habits={habits}
              logs={logs}
              reminderConfig={reminderConfig}
              notificationPermission={notificationPermission}
              updateReminderConfig={updateReminderConfig}
              requestNotificationPermission={requestNotificationPermission}
              sendTestNotification={sendTestNotification}
              onClearData={handleClearLocalData}
            />
          )}
        </div>
      </main>

      {/* Floating Action Button (Optional) */}
      <button 
        onClick={() => setJournalModalOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-white p-3 rounded-full shadow-lg border border-slate-200 text-slate-600 hover:text-emerald-600 hover:scale-105 transition-all"
        title="Quick Journal (J)"
      >
        <span className="text-xl leading-none">✍️</span>
      </button>
    </RequireAuth>
  );
}

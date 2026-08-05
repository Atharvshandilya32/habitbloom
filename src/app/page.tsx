'use client';

import { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import Navbar, { NavTab } from './components/charts/TitleBanner';
import RequireAuth from './auth/RequireAuth';
import GuideModal, { shouldShowGuide } from './components/GuideModal';
import CalendarSettings from './components/CalendarSettings';


import dynamic from 'next/dynamic';

import DailyFocusView from './components/DailyFocusView';
import DashboardView from './components/DashboardView';
import GoalsView from './components/GoalsView';
import ChallengesView from './components/ChallengesView';
import { HabitDnaView } from './components/HabitDnaView';
import { HabitGardenView } from './components/HabitGardenView';
import { FutureProjectionView } from './components/FutureProjectionView';
import { WeeklyReflectionView } from './components/WeeklyReflectionView';
import { HabitWrappedModal } from './components/HabitWrappedModal';
import { OnboardingGuide } from './components/OnboardingGuide';

// Dynamic Lazy Loaded Sub-Views for optimal initial bundle performance
const AnalyticsView = dynamic(() => import('./components/AnalyticsView'), { ssr: false });
const WeeklyReviewView = dynamic(() => import('./components/WeeklyReviewView'), { ssr: false });
const PersonalRecordsView = dynamic(() => import('./components/PersonalRecordsView'), { ssr: false });
const TimelineView = dynamic(() => import('./components/TimelineView'), { ssr: false });
const SettingsView = dynamic(() => import('./components/SettingsView'), { ssr: false });
const SocialHubView = dynamic(() => import('./components/social/SocialHubView'), { ssr: false });

const CommandPalette = dynamic(() => import('./components/CommandPalette'), { ssr: false });
import Toast from './components/Toast';
import JournalModal from './components/JournalModal';
import { useKeyboardShortcuts } from '../../lib/keyboardShortcuts';

import SpacesHub from './components/SpacesHub';
const SpaceDashboard = dynamic(() => import('./components/SpaceDashboard'), { ssr: false });
import CreateSpaceModal from './components/CreateSpaceModal';
import { Space, SpaceInvite } from '../../lib/spaceTypes';
import { XP_CONSTANTS, getLevelFromXp } from '../../lib/xpEngine';
import { initOfflineSync, queueMutation } from '../../lib/offlineSyncEngine';
import { createNewSpace } from '../../lib/spaceUtils';
import { ensureUserProfile, UserProfile } from '../../lib/userProfile';
const IdentityModal = dynamic(() => import('./components/identity/IdentityModal'), { ssr: false });

import { Habit, HabitLog, Goal as GoalType, Challenge, JournalEntry } from '../../lib/habitTypes';
import { makeLogKey, getMonthKeyPrefix } from '../../lib/habitUtils';
import { useHabitReminders } from '../../lib/useHabitReminders';

// Firebase imports
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, onValue, set, get } from 'firebase/database';
import { auth, database } from '../../lib/firebase';

const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

export default function Page() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog>({});
  const [habitLogsArray, setHabitLogsArray] = useState<Record<string, number[]>>({});
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // Data State
  const [goals, setGoals] = useState<GoalType[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);

  // Spaces State
  const [userSpaces, setUserSpaces] = useState<Space[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, import('../../lib/spaceTypes').CustomRole>>({});
  const [publicSpaces, setPublicSpaces] = useState<Space[]>([]);
  const [pendingInvites] = useState<SpaceInvite[]>([]);
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);

  // Navigation Tab state
  const [activeTab, setActiveTab] = useState<NavTab>('focus');

  // Firebase auth & loading state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingFirebase, setIsLoadingFirebase] = useState(true);

  // UI State
  const [guideOpen, setGuideOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [identityModalOpen, setIdentityModalOpen] = useState(false);
  const [wrappedOpen, setWrappedOpen] = useState(false);
  const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  // Journal Modal State
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [selectedHabitForJournal, setSelectedHabitForJournal] = useState<Habit | undefined>(undefined);
  const [selectedJournalEntry, setSelectedJournalEntry] = useState<JournalEntry | undefined>(undefined);

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

  // Initialize offline sync listeners
  useEffect(() => {
    initOfflineSync();
  }, []);

  // Open guide on first visit
  useEffect(() => {
    if (shouldShowGuide()) setGuideOpen(true);
  }, []);

  // Helper function to sync individual paths to Firebase via offline queue
  const syncToFirebase = (key: string, value: unknown) => {
    if (currentUser) {
      queueMutation('set', `users/${currentUser.uid}/${key}`, value);
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

  // 3. Listen to auth state and process referrals
  useEffect(() => {
    if (!auth) { setIsLoadingFirebase(false); return; }

    // Capture ref from URL if present
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      if (refCode) {
        localStorage.setItem('habitbloom_pending_referral', refCode);
        // Clean URL without refreshing
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setIsLoadingFirebase(false);
        setUserProfileData(null);
      } else {
        ensureUserProfile(user).then(p => {
          if (p) setUserProfileData(p);
        });
        // Process pending referral
        const pendingRef = localStorage.getItem('habitbloom_pending_referral');
        if (pendingRef && database) {
          const userShortCode = user.uid.slice(0, 8).toUpperCase();
          if (pendingRef !== userShortCode) {
            set(ref(database, `referrals/${pendingRef}/${user.uid}`), {
              joinedAt: new Date().toISOString(),
              uid: user.uid
            });
            showToast('Referral applied!');
          }
          localStorage.removeItem('habitbloom_pending_referral');
        }
      }
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

  // 5. Real-time Firebase Sync for Spaces
  useEffect(() => {
    if (!database || !currentUser) return;

    const membersRef = ref(database, 'spaceMembers');
    const spacesRef = ref(database, 'spaces');
    const rolesRef = ref(database, 'spaceRoles');

    const unsubscribeMembers = onValue(
      membersRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setUserSpaces([]);
          return;
        }

        const allMembers = snapshot.val();
        const mySpaceIds: string[] = [];
        const myRoleMappings: Record<string, string> = {}; // spaceId -> roleId

        // Find spaces the user belongs to
        Object.keys(allMembers).forEach(key => {
          if (allMembers[key].userId === currentUser.uid) {
            mySpaceIds.push(allMembers[key].spaceId);
            myRoleMappings[allMembers[key].spaceId] = allMembers[key].roleId;
          }
        });

        if (mySpaceIds.length === 0) {
          setUserSpaces([]);
          return;
        }

        // Fetch actual space details
        onValue(
          spacesRef,
          (spaceSnapshot) => {
            if (spaceSnapshot.exists()) {
              const allSpaces = spaceSnapshot.val();
              const mySpaces = mySpaceIds.map(id => allSpaces[id]).filter(Boolean);

              // Run silent migrations if necessary
              mySpaces.forEach(space => {
                if (space.schemaVersion !== 2) {
                  import('../../lib/migrateSpace').then(({ migrateLegacySpace }) => migrateLegacySpace(space));
                }
              });

              setUserSpaces(mySpaces);

              // Also store all spaces for public search (if no privacy settings yet, assume all are public)
              const allSpacesList = Object.values(allSpaces) as Space[];
              // For a real app we might filter out spaces the user is already in, or keep them.
              setPublicSpaces(allSpacesList);

              // Fetch roles for the spaces we belong to
              get(rolesRef).then(rolesSnapshot => {
                if (rolesSnapshot.exists()) {
                  const allSpaceRoles = rolesSnapshot.val();
                  const resolvedRoles: Record<string, import('../../lib/spaceTypes').CustomRole> = {};

                  mySpaceIds.forEach(spaceId => {
                    const roleId = myRoleMappings[spaceId];
                    if (roleId && allSpaceRoles[spaceId] && allSpaceRoles[spaceId][roleId]) {
                      resolvedRoles[spaceId] = allSpaceRoles[spaceId][roleId];
                    }
                  });
                  setUserRoles(resolvedRoles);
                }
              });

            } else {
              setPublicSpaces([]);
            }
          },
          { onlyOnce: true } // Read spaces once per member update
        );
      },
      (error) => {
        console.error('Firebase space sync error:', error);
      }
    );

    return () => unsubscribeMembers();
  }, [currentUser]);

  const daysInMonth = getDaysInMonth(year, month);

  // ── Toggle cell ────────────────────────────────────────────────────────
  const handleToggleCell = (habitId: string, day: number) => {
    const key = makeLogKey(habitId, year, month, day);
    const dateTimestamp = new Date(year, month - 1, day).getTime();

    const isCurrentlyDone = !!logs[key];
    const updatedLogs = { ...logs };
    if (isCurrentlyDone) {
      delete updatedLogs[key];
    } else {
      updatedLogs[key] = true;
    }

    setLogs(updatedLogs);
    queueMutation('set', `users/${currentUser?.uid}/logs`, updatedLogs);

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

    if (!isCurrentlyDone) {
      if (userProfileData && currentUser) {
        const newXp = (userProfileData.experiencePoints || 0) + XP_CONSTANTS.HABIT_COMPLETION;
        const newLevel = getLevelFromXp(newXp);
        
        const updatedProfile = { 
          ...userProfileData, 
          experiencePoints: newXp, 
          currentLevel: newLevel 
        };
        setUserProfileData(updatedProfile);
        queueMutation('set', `users/${currentUser.uid}/profile`, updatedProfile);
      }
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
    showToast('Progress reset for the month.');
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
    showToast('Local data cleared successfully.');
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
    showToast('Habit created successfully.');
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
    showToast('Habit deleted successfully.');
  };

  const handleUpdateHabit = (habitId: string, updates: Partial<Habit>) => {
    const updated = habits.map(h => h.id === habitId ? { ...h, ...updates } : h);
    setHabits(updated);
    syncToFirebase('habits', updated);
  };

  // ── CRUD Handlers ────────────────────────────────────────────────
  const handleAddGoal = (goal: GoalType) => {
    const updated = [...goals, goal];
    setGoals(updated);
    syncToFirebase('goals', updated);
    showToast('Goal set successfully.');
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
    showToast(`Joined ${challenge.title} challenge.`);
  };

  const handleSaveJournal = (entry: JournalEntry) => {
    const updated = [...journals.filter(j => j.id !== entry.id), entry];
    setJournals(updated);
    syncToFirebase('journals', updated);
    showToast('Journal entry saved.');
  };

  const handleDeleteJournal = (journalId: string) => {
    const updated = journals.filter(j => j.id !== journalId);
    setJournals(updated);
    syncToFirebase('journals', updated);
    showToast('Journal entry deleted.');
  };

  // Safety fallback: Unblock loading screen after 1.2s max if Firebase is slow
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingFirebase(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoadingFirebase && habits.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600 gap-3">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Syncing HabitBloom Cloud...</p>
      </div>
    );
  }

  const todayDateStr = `${year}-${String(month).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  return (
    <MotionConfig reducedMotion="always">
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
        <IdentityModal
          isOpen={identityModalOpen}
          onClose={() => setIdentityModalOpen(false)}
          profile={userProfileData}
          userSpaces={userSpaces}
        />
        <JournalModal
          isOpen={journalModalOpen}
          onClose={() => {
            setJournalModalOpen(false);
            setSelectedHabitForJournal(undefined);
            setSelectedJournalEntry(undefined);
          }}
          habit={selectedHabitForJournal}
          dateStr={selectedJournalEntry ? selectedJournalEntry.date : todayDateStr}
          existingEntry={selectedJournalEntry}
          onSave={(entry) => {
            handleSaveJournal(entry);
            setJournalModalOpen(false);
            setSelectedHabitForJournal(undefined);
            setSelectedJournalEntry(undefined);
          }}
          onDelete={(id) => {
            handleDeleteJournal(id);
            setJournalModalOpen(false);
            setSelectedHabitForJournal(undefined);
            setSelectedJournalEntry(undefined);
          }}
        />

        <GuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

        {/* Sticky Navbar */}
        <Navbar
          user={currentUser}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenGuide={() => setGuideOpen(true)}
          onOpenSearch={() => setCmdOpen(true)}
          onOpenIdentityModal={() => setIdentityModalOpen(true)}
          onOpenWrapped={() => setWrappedOpen(true)}
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
                }}
                onNavigateTab={setActiveTab}
                onOpenJournal={(habitId) => {
                  const habit = habits.find(h => h.id === habitId);
                  if (habit) {
                    setSelectedHabitForJournal(habit);
                    setJournalModalOpen(true);
                  }
                }}
              />
            )}

            {activeTab === 'dna' && (
              <HabitDnaView
                habits={habits}
                logsObj={logs}
                year={year}
                month={month}
              />
            )}

            {activeTab === 'garden' && (
              <HabitGardenView
                habits={habits}
                logsObj={logs}
                year={year}
                month={month}
                onToggleHabit={handleToggleCell}
              />
            )}

            {activeTab === 'projection' && (
              <FutureProjectionView
                habits={habits}
                logsObj={logs}
                year={year}
                month={month}
              />
            )}

            {activeTab === 'reflection' && (
              <WeeklyReflectionView
                habits={habits}
                logsObj={logs}
                journals={journals}
                year={year}
                month={month}
                onSaveJournal={handleSaveJournal}
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
                onEditJournal={(id) => {
                  const entry = journals.find(j => j.id === id);
                  if (entry) {
                    setSelectedJournalEntry(entry);
                    if (entry.habitId) {
                      const habit = habits.find(h => h.id === entry.habitId);
                      setSelectedHabitForJournal(habit);
                    }
                    setJournalModalOpen(true);
                  }
                }}
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

            {activeTab === 'social' && (
              <SocialHubView
                currentUser={currentUser}
                habits={habits}
                logs={logs}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'spaces' && (
              <div className="space-y-6">
                {!activeSpaceId || !userSpaces.find(s => s.id === activeSpaceId) ? (
                  <SpacesHub
                    userSpaces={userSpaces}
                    publicSpaces={publicSpaces}
                    pendingInvites={pendingInvites}
                    onCreateSpaceClick={() => setCreateSpaceOpen(true)}
                    onEnterSpace={setActiveSpaceId}
                    onAcceptInvite={() => {
                      showToast('Welcome to the Space!');
                    }}
                  />
                ) : (
                  <SpaceDashboard
                    space={userSpaces.find(s => s.id === activeSpaceId)!}
                    role={userRoles[activeSpaceId]}
                    currentUserId={currentUser?.uid || ''}
                    personalHabits={habits}
                    onBack={() => setActiveSpaceId(null)}
                    onInstallTemplate={(template) => {
                      const newHabit = {
                        id: `habit-${Date.now()}`,
                        name: template.name,
                        emoji: template.emoji,
                        goal: 1,
                        category: template.category
                      };
                      setHabits(prev => [...prev, newHabit]);
                      showToast(`${template.name} added to your habits.`);
                    }}
                  />
                )}

                <CreateSpaceModal
                  isOpen={createSpaceOpen}
                  onClose={() => setCreateSpaceOpen(false)}
                  onCreate={(name, desc, type) => {
                    if (!currentUser) return;
                    const { space, member } = createNewSpace(name, desc, type, currentUser.uid);

                    // Write space to database
                    if (database) {
                      set(ref(database, `spaces/${space.id}`), space);
                      set(ref(database, `spaceMembers/${space.id}_${currentUser.uid}`), member);
                    }

                    // Note: setUserSpaces is now handled by the real-time listener!
                    setActiveSpaceId(space.id);
                    setCreateSpaceOpen(false);
                    showToast(`Space '${name}' created successfully.`);
                  }}
                />
              </div>
            )}
          </div>
        </main>

        {/* Habit Wrapped Retrospective Modal */}
        <HabitWrappedModal
          isOpen={wrappedOpen}
          onClose={() => setWrappedOpen(false)}
          habits={habits}
          logsObj={logs}
          year={year}
          month={month}
        />

        {/* Intelligent Progressive Onboarding */}
        <OnboardingGuide />

        {/* Floating Action Button (Optional) */}
        <button
          onClick={() => setJournalModalOpen(true)}
          className="fixed bottom-6 left-6 z-40 bg-white p-3 rounded-full shadow-lg border border-slate-200 text-slate-600 hover:text-emerald-600 hover:scale-105 transition-all"
          title="Quick Journal (J)"
        >
          <span className="text-xl leading-none">✍️</span>
        </button>
      </RequireAuth>
    </MotionConfig>
  );
}

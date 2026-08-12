'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { MotionConfig } from 'framer-motion';
import Navbar, { NavTab } from './components/charts/TitleBanner';
import AuthModal from './components/AuthModal';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { toast } from 'sonner';
import GuideModal, { shouldShowGuide } from './components/GuideModal';
import CalendarSettings from './components/CalendarSettings';


import dynamic from 'next/dynamic';
import CelebrationOverlay from './components/CelebrationOverlay';
import { OnboardingGuide } from './components/OnboardingGuide';
import Toast from './components/Toast';
import JournalModal from './components/JournalModal';
import { useKeyboardShortcuts } from '../../lib/keyboardShortcuts';
import SpacesHub from './components/SpacesHub';
import CreateSpaceModal from './components/CreateSpaceModal';
import { Space, SpaceInvite } from '../../lib/spaceTypes';
import { getLevelFromXp, calculateTotalXp } from '../../lib/xpEngine';
import { generateDailyStory, generateMilestoneMessage } from '../../lib/storyEngine';
import { calculateBloomScore } from '../../lib/bloomScoreUtils';
import { initOfflineSync, queueMutation } from '../../lib/offlineSyncEngine';
import { createNewSpace } from '../../lib/spaceUtils';
import { ensureUserProfile, UserProfile } from '../../lib/userProfile';
import { Habit, HabitLog, Goal as GoalType, Challenge, JournalEntry } from '../../lib/habitTypes';
import { makeLogKey, getMonthKeyPrefix, getCurrentStreak } from '../../lib/habitUtils';
import { useHabitReminders } from '../../lib/useHabitReminders';

// Firebase imports
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, onValue, set, get, query, orderByChild, equalTo, child } from 'firebase/database';
import { auth, database } from '../../lib/firebase';

const DailyFocusView = dynamic(() => import('./components/DailyFocusView'), { ssr: false });
const DashboardView = dynamic(() => import('./components/DashboardView'), { ssr: false });
const GoalsView = dynamic(() => import('./components/GoalsView'), { ssr: false });
const ChallengesView = dynamic(() => import('./components/ChallengesView'), { ssr: false });
const HabitDnaView = dynamic(() => import('./components/HabitDnaView').then(mod => mod.HabitDnaView), { ssr: false });
const HabitGardenView = dynamic(() => import('./components/HabitGardenView').then(mod => mod.HabitGardenView), { ssr: false });
const FutureProjectionView = dynamic(() => import('./components/FutureProjectionView').then(mod => mod.FutureProjectionView), { ssr: false });
const WeeklyReflectionView = dynamic(() => import('./components/WeeklyReflectionView').then(mod => mod.WeeklyReflectionView), { ssr: false });
const WrappedView = dynamic(() => import('./components/WrappedView'), { ssr: false });
const BloomInsightsView = dynamic(() => import('./components/BloomInsightsView').then(mod => mod.BloomInsightsView), { ssr: false });
const AnalyticsView = dynamic(() => import('./components/AnalyticsView'), { ssr: false });
const WeeklyReviewView = dynamic(() => import('./components/WeeklyReviewView'), { ssr: false });
const PersonalRecordsView = dynamic(() => import('./components/PersonalRecordsView'), { ssr: false });
const TimelineView = dynamic(() => import('./components/TimelineView'), { ssr: false });
const SettingsView = dynamic(() => import('./components/SettingsView'), { ssr: false });
const SocialHubView = dynamic(() => import('./components/social/SocialHubView'), { ssr: false });
const CommandPalette = dynamic(() => import('./components/CommandPalette'), { ssr: false });
const SpaceDashboard = dynamic(() => import('./components/SpaceDashboard'), { ssr: false });
const BeautifulDayStart = dynamic(() => import('./components/BeautifulDayStart'), { ssr: false });
const IdentityModal = dynamic(() => import('./components/identity/IdentityModal'), { ssr: false });


const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

const safeParse = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item && item !== 'undefined' ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage`, e);
    return fallback;
  }
};

export default function Page() {
  const [habits, setHabits] = useState<Habit[]>(() => safeParse('habitbloom_habits', []));
  const [logs, setLogs] = useState<HabitLog>(() => safeParse('habitbloom_logs', {}));
  const [habitLogsArray, setHabitLogsArray] = useState<Record<string, number[]>>(() => safeParse('habitbloom_logs_array', {}));
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);

  // Data State
  const [goals, setGoals] = useState<GoalType[]>(() => safeParse('habitbloom_goals', []));
  const [challenges, setChallenges] = useState<Challenge[]>(() => safeParse('habitbloom_challenges', []));
  const [journals, setJournals] = useState<JournalEntry[]>(() => safeParse('habitbloom_journals', []));

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
  const [hasSeenWelcomeToday, setHasSeenWelcomeToday] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [identityModalOpen, setIdentityModalOpen] = useState(false);
  const [wrappedOpen, setWrappedOpen] = useState(false);
  const [celebration, setCelebration] = useState({ isOpen: false, title: '', description: '', icon: '' });
  const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

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

  const userLevel = useMemo(() => {
    return getLevelFromXp(calculateTotalXp(habits, logs));
  }, [habits, logs]);

  // Initialize offline sync listeners
  useEffect(() => {
    initOfflineSync();
  }, []);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'done' | 'failed'>('idle');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Open guide on first visit
  useEffect(() => {
    if (shouldShowGuide()) {
      setGuideOpen(true);
    }
  }, []);

  // Guest Local Storage Toast
  useEffect(() => {
    if (typeof window !== 'undefined' && !currentUser && !isLoadingFirebase) {
      const hasSeenToast = localStorage.getItem('habitbloom_guest_toast');
      if (!hasSeenToast) {
        // Short delay to let the app render first
        setTimeout(() => {
          toast('Playing as a Guest', {
            description: 'Your progress is saved locally. Create an account when you are ready to sync to the cloud!',
            duration: 8000,
            icon: '👋',
          });
          localStorage.setItem('habitbloom_guest_toast', 'true');
        }, 1500);
      }
    }
  }, [currentUser, isLoadingFirebase]);

  // Track feature usage when tab changes
  useEffect(() => {
    if (currentUser && activeTab) {
      import('../../lib/analyticsUtils').then(({ logUsageEvent }) => {
        logUsageEvent(currentUser.uid, 'feature_used', { feature: activeTab });
      });
    }
  }, [activeTab, currentUser?.uid]);

  useEffect(() => {
    const todayStr = new Date().toDateString();
    const lastSeen = localStorage.getItem('habitbloom_last_welcome');
    if (lastSeen !== todayStr) {
      setHasSeenWelcomeToday(false);
    }
  }, []);

  // Global safety timeout to prevent infinite loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingFirebase(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const previousTotalCompletedRef = useRef(-1);
  useEffect(() => {
    const currentCompleted = Object.values(logs).filter(Boolean).length;
    if (previousTotalCompletedRef.current !== -1 && currentCompleted > previousTotalCompletedRef.current) {
      let highestStreak = 0;
      let habitName = '';
      habits.forEach(habit => {
        const streak = getCurrentStreak(habit, logs, year, month, getDaysInMonth(year, month));
        if (streak > highestStreak) {
          highestStreak = streak;
          habitName = habit.name;
        }
      });
      
      if ([1, 7, 30, 100, 365].includes(highestStreak)) {
        setCelebration({
          isOpen: true,
          title: `${highestStreak}-Day Streak!`,
          description: generateMilestoneMessage(highestStreak, habitName),
          icon: highestStreak >= 30 ? '🔥' : '🌱'
        });
      } else if (currentCompleted === 10) {
        setCelebration({
          isOpen: true,
          title: `Taking Root`,
          description: `You have completed 10 total habits. Your journey begins.`,
          icon: '🌿'
        });
      } else if (currentCompleted === 50) {
        setCelebration({
          isOpen: true,
          title: `A Flourishing Garden`,
          description: `50 habits completed! You are cultivating a new lifestyle.`,
          icon: '🌸'
        });
      }
    }
    previousTotalCompletedRef.current = currentCompleted;
  }, [logs, habits, year, month]);

  // Helper function to sync individual paths to Firebase via offline queue
  const syncToFirebase = useCallback((key: string, value: unknown) => {
    if (currentUser) {
      queueMutation('set', `users/${currentUser.uid}/${key}`, value);
    }
  }, [currentUser]);

  // 1. Load from localStorage on mount (initial fallback)
  useEffect(() => {
    const savedHabits = localStorage.getItem('habitbloom_habits');
    const savedLogs = localStorage.getItem('habitbloom_logs');
    const savedLogsArray = localStorage.getItem('habitbloom_logs_array');
    const savedGoals = localStorage.getItem('habitbloom_goals');
    const savedChallenges = localStorage.getItem('habitbloom_challenges');
    const savedJournals = localStorage.getItem('habitbloom_journals');

    const dedupeById = <T extends { id: string }>(arr: T[]): T[] => Array.from(new Map(arr.filter(Boolean).map(item => [item.id, item])).values());

    if (savedHabits) {
      try { 
        const parsed = JSON.parse(savedHabits);
        setHabits(dedupeById(Array.isArray(parsed) ? parsed : [])); 
      } catch { setHabits([]); }
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
        if (typeof window !== 'undefined') {
          localStorage.setItem('habitbloom_is_guest', 'true');
        }
      } else {
        if (typeof window !== 'undefined' && localStorage.getItem('habitbloom_is_guest') === 'true') {
          setMigrationStatus('migrating');
        } else {
          setMigrationStatus('done');
        }
        
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
            })
            .then(() => showToast('Referral applied!'))
            .catch(e => console.error('Failed to apply referral:', e));
          }
          localStorage.removeItem('habitbloom_pending_referral');
        }
      }
    });
    return () => unsub();
  }, []);

  // 4. Migration Logic
  useEffect(() => {
    if (!currentUser || !database || migrationStatus !== 'migrating') return;

    const performMigration = async () => {
      try {
        const userRef = ref(database, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        const data = snapshot.exists() ? snapshot.val() : null;

        const savedHabits = JSON.parse(localStorage.getItem('habitbloom_habits') || '[]');
        const savedLogs = JSON.parse(localStorage.getItem('habitbloom_logs') || '{}');
        const savedHabitLogsArray = JSON.parse(localStorage.getItem('habitbloom_logs_array') || '{}');
        const savedGoals = JSON.parse(localStorage.getItem('habitbloom_goals') || '[]');
        const savedChallenges = JSON.parse(localStorage.getItem('habitbloom_challenges') || '[]');
        const savedJournals = JSON.parse(localStorage.getItem('habitbloom_journals') || '[]');

        if (!data) {
          const habitsMap = savedHabits.reduce((acc: Record<string, Habit>, h: Habit) => { acc[h.id] = h; return acc; }, {});
          await set(userRef, {
            habits: habitsMap,
            logs: savedLogs,
            habitLogsArray: savedHabitLogsArray,
            goals: savedGoals,
            challenges: savedChallenges,
            journals: savedJournals,
          });
        } else {
          const cloudHabits = data.habits ? (Array.isArray(data.habits) ? data.habits : Object.values(data.habits)) : [];
          
          const dedupeById = <T extends { id: string }>(arr1: T[], arr2: T[]) => {
            const map = new Map<string, T>();
            arr1.forEach(item => map.set(item.id, item));
            arr2.forEach(item => {
              const existing = map.get(item.id);
              map.set(item.id, existing ? { ...existing, ...item } : item);
            });
            return Array.from(map.values());
          };

          const mergedHabits = dedupeById(cloudHabits, savedHabits);
          const mergedLogs = { ...(data.logs || {}), ...savedLogs };
          const mergedHabitLogsArray = { ...(data.habitLogsArray || {}), ...savedHabitLogsArray };
          const mergedGoals = dedupeById(data.goals ? (Array.isArray(data.goals) ? data.goals : Object.values(data.goals)) : [], savedGoals);
          const mergedChallenges = dedupeById(data.challenges ? (Array.isArray(data.challenges) ? data.challenges : Object.values(data.challenges)) : [], savedChallenges);
          const mergedJournals = dedupeById(data.journals ? (Array.isArray(data.journals) ? data.journals : Object.values(data.journals)) : [], savedJournals);

          const habitsMap = mergedHabits.reduce((acc: Record<string, Habit>, h: Habit) => { acc[h.id] = h; return acc; }, {});
          
          await set(userRef, {
            ...data,
            habits: habitsMap,
            logs: mergedLogs,
            habitLogsArray: mergedHabitLogsArray,
            goals: mergedGoals,
            challenges: mergedChallenges,
            journals: mergedJournals,
          });
        }

        localStorage.removeItem('habitbloom_is_guest');
        setMigrationStatus('done');
        toast.success('Your local progress was successfully saved to the cloud!');
      } catch (error) {
        console.error('Migration failed:', error);
        toast.error('Failed to migrate data. You can try again later.');
        setMigrationStatus('failed');
      }
    };

    performMigration();
  }, [currentUser, database, migrationStatus]);

  // 5. Real-time Firebase Sync
  useEffect(() => {
    if (!currentUser || migrationStatus === 'migrating') return;
    if (!database) {
      setIsLoadingFirebase(false);
      return;
    }

    const userRef = ref(database, `users/${currentUser.uid}`);
    setIsLoadingFirebase(true);

    // Fallback: If Firebase takes too long (e.g. offline), unblock the UI
    const timeoutId = setTimeout(() => {
      setIsLoadingFirebase(false);
    }, 5000);

    const unsubscribe = onValue(
      userRef,
      (snapshot) => {
        clearTimeout(timeoutId);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const dedupeById = <T extends { id: string }>(arr: T[]): T[] => Array.from(new Map(arr.filter(Boolean).map(item => [item.id, item])).values());
          if (data.habits) setHabits(dedupeById(Array.isArray(data.habits) ? data.habits : Object.values(data.habits)));
          if (data.logs) setLogs(data.logs);
          if (data.habitLogsArray) setHabitLogsArray(data.habitLogsArray);
          if (data.goals) setGoals(dedupeById(Array.isArray(data.goals) ? data.goals : Object.values(data.goals)));
          if (data.challenges) setChallenges(dedupeById(Array.isArray(data.challenges) ? data.challenges : Object.values(data.challenges)));
          if (data.journals) setJournals(dedupeById(Array.isArray(data.journals) ? data.journals : Object.values(data.journals)));
          if (data.journals) setJournals(dedupeById(Array.isArray(data.journals) ? data.journals : Object.values(data.journals)));
        }
        setIsLoadingFirebase(false);
      },
      (error) => {
        clearTimeout(timeoutId);
        console.error('Firebase sync error:', error);
        toast.error('Unable to sync with server. Changes will be saved when you reconnect.', { id: 'firebase-sync-error' });
        setIsLoadingFirebase(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid, database]);

  // 6. Real-time Firebase Sync for Spaces
  useEffect(() => {
    if (!database || !currentUser) return;

    const membersQuery = query(ref(database, 'spaceMembers'), orderByChild('userId'), equalTo(currentUser.uid));
    const spacesRef = ref(database, 'spaces');
    const rolesRef = ref(database, 'spaceRoles');

    const unsubscribeMembers = onValue(
      membersQuery,
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

        // Fetch actual space details individually due to security rules
        Promise.all(mySpaceIds.map(id => get(child(spacesRef, id)))).then(spaceSnapshots => {
          const mySpaces = spaceSnapshots.map(snap => snap.exists() ? snap.val() : null).filter(Boolean) as Space[];

          // Run silent migrations if necessary
          mySpaces.forEach(space => {
            if (space.schemaVersion !== 2) {
              import('../../lib/migrateSpace').then(({ migrateLegacySpace }) => migrateLegacySpace(space));
            }
          });

          setUserSpaces(mySpaces);

          // Public spaces search is removed for privacy
          setPublicSpaces([]);

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
        }).catch(err => {
          console.error("Failed to load spaces", err);
          setPublicSpaces([]);
        });
      },
      (error) => {
        console.error('Firebase space sync error:', error);
        toast.error('Unable to sync spaces with server. Reconnecting...', { id: 'firebase-space-sync-error' });
      }
    );

    return () => unsubscribeMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]);

  const daysInMonth = getDaysInMonth(year, month);

  // ── Toggle cell ────────────────────────────────────────────────────────
    const handleToggleCell = useCallback(async (habitId: string, day: number) => {
      const key = makeLogKey(habitId, year, month, day);
      const dateTimestamp = new Date(year, month - 1, day).getTime();
  
      if (dateTimestamp > Date.now()) {
        showToast('Cannot log habits in the future!');
        return;
      }
  
      // Keep track of old state for rollback
      const oldLogs = { ...logs };
      const isCurrentlyDone = !!oldLogs[key];
  
      setLogs(prevLogs => {
        const updatedLogs = { ...prevLogs };
        if (isCurrentlyDone) delete updatedLogs[key];
        else updatedLogs[key] = true;
        
        if (!isCurrentlyDone) showToast('Habit completed! Keep it up.');
        return updatedLogs;
      });
  
      if (currentUser && database) {
        try {
          const dbRef = ref(database, `users/${currentUser.uid}/logs/${key}`);
          if (navigator.onLine) {
            if (isCurrentlyDone) await set(dbRef, null);
            else {
              await set(dbRef, true);
              import('../../lib/analyticsUtils').then(({ logUsageEvent }) => logUsageEvent(currentUser.uid, 'habit_completed', { habitId }));
            }
          } else {
            queueMutation('set', `users/${currentUser.uid}/logs/${key}`, isCurrentlyDone ? null : true);
          }
        } catch (error) {
          console.error("Firebase write failed:", error);
          showToast('Failed to save progress. Rolling back...');
          // Rollback
          setLogs(oldLogs);
          return; // Stop execution
        }
      }


    setHabitLogsArray(prevLogsArray => {
      const logsArray = prevLogsArray[habitId] || [];
      const index = logsArray.indexOf(dateTimestamp);
      const updatedLogsArray = {
        ...prevLogsArray,
        [habitId]: index === -1
          ? [...logsArray, dateTimestamp].sort()
          : logsArray.filter((_, i) => i !== index),
      };
      syncToFirebase(`habitLogsArray/${habitId}`, updatedLogsArray[habitId]);
      return updatedLogsArray;
    });
  }, [year, month, currentUser, logs, syncToFirebase]);

  // ── Reset current month ────────────────────────────────────────────────
  const handleResetMonth = useCallback(() => {
    const prefix = getMonthKeyPrefix(year, month);
    setLogs(prev => {
      const updatedLogs = Object.fromEntries(
        Object.entries(prev).filter(([key]) => !key.includes(prefix))
      );
      syncToFirebase('logs', updatedLogs);
      return updatedLogs;
    });

    const monthStart = new Date(year, month - 1, 1).getTime();
    const monthEnd = new Date(year, month, 1).getTime();
    setHabitLogsArray(prev => {
      const updatedLogsArray = Object.fromEntries(
        Object.entries(prev).map(([habitId, timestamps]) => [
          habitId,
          timestamps.filter(ts => ts < monthStart || ts >= monthEnd),
        ])
      );
      syncToFirebase('habitLogsArray', updatedLogsArray);
      return updatedLogsArray;
    });
    showToast('Progress reset for the month.');
  }, [year, month, syncToFirebase]);

  // ── Reset all local data ───────────────────────────────────────────────
  const handleClearLocalData = useCallback(() => {
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
  }, [syncToFirebase]);

  // ── Habits CRUD ──────────────────────────────────────────────────────────
  const handleAddHabit = useCallback(() => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: 'New Habit',
      emoji: '⭐',
      goal: 10,
      category: '🎯 Personal Growth',
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => {
      const updated = [...prev, newHabit];
      syncToFirebase(`habits/${newHabit.id}`, newHabit);
      if (currentUser) {
        import('../../lib/analyticsUtils').then(({ logUsageEvent }) => logUsageEvent(currentUser.uid, 'habit_created'));
      }
      return updated;
    });
    showToast('Habit created successfully.');
  }, [syncToFirebase]);

  const handleDeleteHabit = useCallback((habitId: string) => {
    setHabits(prev => {
      const updatedHabits = prev.filter(h => h.id !== habitId);
      syncToFirebase(`habits/${habitId}`, null);
      return updatedHabits;
    });

    setLogs(prev => {
      const nextLogs = { ...prev };
      Object.keys(nextLogs).forEach(key => {
        if (key.startsWith(`${habitId}_`)) delete nextLogs[key];
      });
      syncToFirebase('logs', nextLogs);
      return nextLogs;
    });

    setHabitLogsArray(prev => {
      const nextLogsArray = { ...prev };
      if (nextLogsArray[habitId]) {
        delete nextLogsArray[habitId];
        syncToFirebase('habitLogsArray', nextLogsArray);
      }
      return nextLogsArray;
    });
    showToast('Habit deleted successfully.');
  }, [syncToFirebase]);

  const handleUpdateHabit = useCallback((habitId: string, updates: Partial<Habit>) => {
    setHabits(prev => {
      const targetHabit = prev.find(h => h.id === habitId);
      if (targetHabit) {
        syncToFirebase(`habits/${habitId}`, { ...targetHabit, ...updates });
      }
      return prev.map(h => h.id === habitId ? { ...h, ...updates } : h);
    });
  }, [syncToFirebase]);

  // ── CRUD Handlers ────────────────────────────────────────────────
  const handleAddGoal = useCallback((goal: GoalType) => {
    setGoals(prev => {
      const updated = [...prev, goal];
      syncToFirebase(`goals/${goal.id}`, goal);
      return updated;
    });
    showToast('Goal set successfully.');
  }, [syncToFirebase]);

  const handleUpdateGoal = useCallback((goalId: string, updates: Partial<GoalType>) => {
    setGoals(prev => {
      const targetGoal = prev.find(g => g.id === goalId);
      if (targetGoal) {
        syncToFirebase(`goals/${goalId}`, { ...targetGoal, ...updates });
      }
      return prev.map(g => g.id === goalId ? { ...g, ...updates } : g);
    });
  }, [syncToFirebase]);

  const handleJoinChallenge = useCallback((challenge: Challenge) => {
    setChallenges(prev => {
      const updated = [...prev, challenge];
      syncToFirebase(`challenges/${challenge.id}`, challenge);
      return updated;
    });
    showToast(`Joined ${challenge.title} challenge.`);
  }, [syncToFirebase]);

  const handleSaveJournal = useCallback((entry: JournalEntry) => {
    setJournals(prev => {
      const updated = [...prev.filter(j => j.id !== entry.id), entry];
      syncToFirebase(`journals/${entry.id}`, entry);
      return updated;
    });
    showToast('Journal entry saved.');
  }, [syncToFirebase]);

  const handleDeleteJournal = useCallback((journalId: string) => {
    setJournals(prev => {
      const updated = prev.filter(j => j.id !== journalId);
      syncToFirebase(`journals/${journalId}`, null);
      return updated;
    });
    showToast('Journal entry deleted.');
  }, [syncToFirebase]);

  // Safety fallback: Unblock loading screen after 1.2s max if Firebase is slow
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingFirebase(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Memoize heavy welcome screen computations
  const welcomeStats = useMemo(() => {
    if (hasSeenWelcomeToday || isLoadingFirebase) return null;
    const xp = calculateTotalXp(habits, logs);
    const level = getLevelFromXp(xp);
    const nextLevelXp = level * (level + 1) * 50;
    
    let longestStreak = 0;
    const daysInMonth = new Date(year, month, 0).getDate();
    habits.forEach(h => {
      const s = getCurrentStreak(h, logs, year, month, daysInMonth);
      if (s > longestStreak) longestStreak = s;
    });

    return {
      xp, level, xpRemaining: nextLevelXp - xp, longestStreak,
      bloomScoreObj: calculateBloomScore(habits, logs, year, month),
      story: generateDailyStory(habits, logs, xp, level)
    };
  }, [habits, logs, hasSeenWelcomeToday, isLoadingFirebase, year, month]);

  const isGuest = typeof window !== 'undefined' && localStorage.getItem('habitbloom_is_guest') === 'true';
  const shouldBlockForAuth = isLoadingFirebase && !isGuest && habits.length === 0;

  if (!mounted || shouldBlockForAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white flex flex-col items-center justify-center text-emerald-800 gap-6 relative overflow-hidden">
        {/* Subtle decorative background elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl mix-blend-multiply animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl mix-blend-multiply animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Main loading container */}
        <div className="relative z-10 flex flex-col items-center p-8 bg-white/40 backdrop-blur-md rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-900/5">
          <div className="relative w-16 h-16 flex items-center justify-center mb-4">
            <div className="absolute inset-0 border-4 border-emerald-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            {/* Inner pulsing dot */}
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">HabitBloom</h2>
          <p className="text-sm font-medium text-emerald-600/80 mt-2 flex items-center gap-2">
            <span>{!mounted ? "Preparing your garden" : "Syncing your progress"}</span>
            <span className="flex gap-1">
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </p>
        </div>
      </div>
    );
  }

  const todayDateStr = `${year}-${String(month).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;



  if (!hasSeenWelcomeToday && !isLoadingFirebase && welcomeStats) {
    const userName = currentUser?.displayName?.split(' ')[0] || 'Friend';

    return (
      <BeautifulDayStart
        userName={userName}
        storySentence={welcomeStats.story}
        bloomScore={welcomeStats.bloomScoreObj.totalBloomScore}
        level={welcomeStats.level}
        xpRemaining={welcomeStats.xpRemaining}
        longestStreak={welcomeStats.longestStreak}
        onEnter={() => {
          localStorage.setItem('habitbloom_last_welcome', new Date().toDateString());
          setHasSeenWelcomeToday(true);
        }}
      />
    );
  }

  return (
    <MotionConfig reducedMotion="always">
      <>
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
        />
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
          userLevel={userLevel}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenGuide={() => setGuideOpen(true)}
          onOpenSearch={() => setCmdOpen(true)}
          onOpenIdentityModal={() => setIdentityModalOpen(true)}
          onOpenWrapped={() => setWrappedOpen(true)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />

        <main className="min-h-screen bg-slate-50 dark:bg-black p-4 sm:p-6 text-slate-950 dark:text-slate-50 pb-20">
          <h1 className="sr-only">HabitBloom – SaaS Habit Tracker & Productivity Operating System</h1>

          {isOffline && (
            <div className="mx-auto max-w-7xl mb-4 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center gap-2 text-amber-700 text-xs font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Working offline. Changes will sync when reconnected.
            </div>
          )}

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
            <ErrorBoundary key={activeTab} fallbackMessage="An error occurred in this view. Please try again or refresh the page.">
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
                journals={journals}
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
                habits={habits}
                logs={logs}
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
                logs={logs}
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
                onOpenAuthModal={() => setAuthModalOpen(true)}
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

            {activeTab === 'insights' && (
              <BloomInsightsView 
                user={currentUser}
                habits={habits}
                logs={logs}
                onNavigateTab={setActiveTab}
              />
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
                    onCreateSpaceClick={() => {
                      if (!currentUser) setAuthModalOpen(true);
                      else setCreateSpaceOpen(true);
                    }}
                    onEnterSpace={setActiveSpaceId}
                    onAcceptInvite={() => {
                      showToast('Welcome to the Space!');
                    }}
                    onJoinWithCode={(code) => {
                      if (!currentUser) setAuthModalOpen(true);
                      else window.location.href = `/invite/${code}`;
                    }}
                  />
                ) : (
                  <SpaceDashboard
                    space={userSpaces.find(s => s.id === activeSpaceId)!}
                    role={userRoles[activeSpaceId]}
                    currentUserId={currentUser?.uid || ''}
                    currentUserName={currentUser?.displayName || 'Member'}
                    personalHabits={habits}
                    habitLogsArray={habitLogsArray}
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
                  onCreate={async (name, desc, type) => {
                    if (!currentUser) return;
                    const { space, member } = createNewSpace(name, desc, type, currentUser.uid);

                    // Write space to database
                    if (database) {
                      try {
                        await set(ref(database, `spaces/${space.id}`), space);
                        await set(ref(database, `spaceMembers/${space.id}_${currentUser.uid}`), member);
                        
                        setActiveSpaceId(space.id);
                        setCreateSpaceOpen(false);
                        showToast(`Space '${name}' created successfully.`);
                      } catch (error) {
                        console.error("Failed to create space:", error);
                        showToast("Error creating space. Please try again.");
                      }
                    }
                  }}
                />
              </div>
            )}
            </ErrorBoundary>
          </div>
        </main>

        {/* Habit Wrapped Retrospective Modal */}
        <WrappedView
          isOpen={wrappedOpen}
          onClose={() => setWrappedOpen(false)}
          habits={habits}
          logs={logs}
          journals={journals}
          year={year}
          month={month}
        />

        <CelebrationOverlay
          isOpen={celebration.isOpen}
          title={celebration.title}
          description={celebration.description}
          icon={celebration.icon}
          onClose={() => setCelebration({ ...celebration, isOpen: false })}
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
      </>
    </MotionConfig>
  );
}

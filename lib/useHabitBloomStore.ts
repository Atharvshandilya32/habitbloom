import { useState, useEffect, useCallback } from 'react';
import { Habit, HabitLog, Goal as GoalType, Challenge, JournalEntry } from './habitTypes';
import { ref, onValue, set } from 'firebase/database';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, database } from './firebase';
import { makeLogKey, getMonthKeyPrefix } from './habitUtils';

const DEFAULT_HABITS: Habit[] = [
  { id: 'habit-1', name: 'Drink water (8 glasses)', emoji: '💧', goal: 30, category: '🏃 Fitness' },
  { id: 'habit-2', name: 'Read books (20 mins)', emoji: '📚', goal: 20, category: '📚 Learning' },
  { id: 'habit-3', name: 'Morning Meditation', emoji: '🧘', goal: 25, category: '🧘 Wellness' },
];

export function useHabitBloomStore() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog>({});
  const [habitLogsArray, setHabitLogsArray] = useState<Record<string, number[]>>({});
  const [goals, setGoals] = useState<GoalType[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);

  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

  // Helper to safely persist to Firebase if user is logged in
  const syncToFirebase = useCallback((key: string, value: unknown) => {
    if (database && currentUser) {
      try {
        set(ref(database, `users/${currentUser.uid}/${key}`), value);
      } catch (err) {
        console.error(`Firebase sync failed for key ${key}:`, err);
      }
    }
  }, [currentUser]);

  // Load initial local state on mount
  useEffect(() => {
    try {
      const savedHabits = localStorage.getItem('habitbloom_habits');
      const savedLogs = localStorage.getItem('habitbloom_logs');
      const savedLogsArray = localStorage.getItem('habitbloom_logs_array');
      const savedGoals = localStorage.getItem('habitbloom_goals');
      const savedChallenges = localStorage.getItem('habitbloom_challenges');
      const savedJournals = localStorage.getItem('habitbloom_journals');

      setHabits(savedHabits ? JSON.parse(savedHabits) : DEFAULT_HABITS);
      setLogs(savedLogs ? JSON.parse(savedLogs) : {});
      setHabitLogsArray(savedLogsArray ? JSON.parse(savedLogsArray) : {});
      setGoals(savedGoals ? JSON.parse(savedGoals) : []);
      setChallenges(savedChallenges ? JSON.parse(savedChallenges) : []);
      setJournals(savedJournals ? JSON.parse(savedJournals) : []);
    } catch (e) {
      console.warn('Could not parse localStorage cache:', e);
      setHabits(DEFAULT_HABITS);
    }
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (!auth) {
      setIsLoadingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);

      if (user && database) {
        // Sync user data from Firebase Realtime Database
        const userRef = ref(database, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.habits) {
              setHabits(data.habits);
              localStorage.setItem('habitbloom_habits', JSON.stringify(data.habits));
            }
            if (data.logs) {
              setLogs(data.logs);
              localStorage.setItem('habitbloom_logs', JSON.stringify(data.logs));
            }
            if (data.habitLogsArray) {
              setHabitLogsArray(data.habitLogsArray);
              localStorage.setItem('habitbloom_logs_array', JSON.stringify(data.habitLogsArray));
            }
            if (data.goals) {
              setGoals(data.goals);
              localStorage.setItem('habitbloom_goals', JSON.stringify(data.goals));
            }
            if (data.challenges) {
              setChallenges(data.challenges);
              localStorage.setItem('habitbloom_challenges', JSON.stringify(data.challenges));
            }
            if (data.journals) {
              setJournals(data.journals);
              localStorage.setItem('habitbloom_journals', JSON.stringify(data.journals));
            }
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Operations
  const toggleHabitDay = useCallback((habitId: string, day: number) => {
    const key = makeLogKey(habitId, year, month, day);
    const monthPrefix = getMonthKeyPrefix(year, month);


    setLogs((prevLogs) => {
      const isCurrentlyDone = !!prevLogs[key];
      const newLogs = { ...prevLogs };
      if (isCurrentlyDone) {
        delete newLogs[key];
      } else {
        newLogs[key] = true;
      }
      localStorage.setItem('habitbloom_logs', JSON.stringify(newLogs));
      syncToFirebase('logs', newLogs);
      return newLogs;
    });

    setHabitLogsArray((prevLogsArray) => {
      const currentDays = prevLogsArray[monthPrefix] || [];
      let updatedDays: number[];

      if (currentDays.includes(day)) {
        updatedDays = currentDays.filter((d) => d !== day);
      } else {
        updatedDays = [...currentDays, day].sort((a, b) => a - b);
      }

      const newLogsArray = { ...prevLogsArray, [monthPrefix]: updatedDays };
      localStorage.setItem('habitbloom_logs_array', JSON.stringify(newLogsArray));
      syncToFirebase('habitLogsArray', newLogsArray);
      return newLogsArray;
    });
  }, [year, month, syncToFirebase]);

  const addHabit = useCallback((newHabit: Habit) => {
    setHabits((prev) => {
      const updated = [...prev, newHabit];
      localStorage.setItem('habitbloom_habits', JSON.stringify(updated));
      syncToFirebase('habits', updated);
      return updated;
    });
  }, [syncToFirebase]);

  const deleteHabit = useCallback((habitId: string) => {
    setHabits((prev) => {
      const updated = prev.filter((h) => h.id !== habitId);
      localStorage.setItem('habitbloom_habits', JSON.stringify(updated));
      syncToFirebase('habits', updated);
      return updated;
    });
  }, [syncToFirebase]);

  const updateHabitsOrder = useCallback((newHabits: Habit[]) => {
    setHabits(newHabits);
    localStorage.setItem('habitbloom_habits', JSON.stringify(newHabits));
    syncToFirebase('habits', newHabits);
  }, [syncToFirebase]);

  const saveJournalEntry = useCallback((entry: JournalEntry) => {
    setJournals((prev) => {
      const existingIdx = prev.findIndex((j) => j.id === entry.id);
      let updated: JournalEntry[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = entry;
      } else {
        updated = [entry, ...prev];
      }
      localStorage.setItem('habitbloom_journals', JSON.stringify(updated));
      syncToFirebase('journals', updated);
      return updated;
    });
  }, [syncToFirebase]);

  return {
    habits,
    setHabits,
    logs,
    habitLogsArray,
    goals,
    setGoals,
    challenges,
    setChallenges,
    journals,
    setJournals,
    currentUser,
    isLoadingAuth,
    activeSpaceId,
    setActiveSpaceId,
    year,
    setYear,
    month,
    setMonth,
    toggleHabitDay,
    addHabit,
    deleteHabit,
    updateHabitsOrder,
    saveJournalEntry,
  };
}

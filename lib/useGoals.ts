'use client';

import { useState, useEffect, useCallback } from 'react';
import { Goal } from './goalUtils';

// Firebase imports
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, onValue, set } from 'firebase/database';
import { auth, database } from './firebase';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 1. Load goals from localStorage on mount (initial fallback)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('habitbloom_goals');
      if (saved) {
        setGoals(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Save goals to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('habitbloom_goals', JSON.stringify(goals));
    }
  }, [goals, isLoading]);

  // 3. Listen to auth state
  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // 4. Real-time Firebase goals subscription
  useEffect(() => {
    if (!database || !currentUser) return;

    const goalsRef = ref(database, `users/${currentUser.uid}/goals`);
    setIsLoading(true);

    const unsubscribe = onValue(
      goalsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setGoals(snapshot.val());
        } else {
          // Initialize empty database with current localStorage goals
          set(goalsRef, goals);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Firebase goals sync error:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const addGoal = useCallback(
    (goal: Goal) => {
      setGoals((prev) => {
        const next = [...prev, goal];
        if (database && currentUser) {
          set(ref(database, `users/${currentUser.uid}/goals`), next);
        }
        return next;
      });
    },
    [currentUser]
  );

  const updateGoal = useCallback(
    (goalId: string, updates: Partial<Goal>) => {
      setGoals((prev) => {
        const next = prev.map((g) => (g.id === goalId ? { ...g, ...updates } : g));
        if (database && currentUser) {
          set(ref(database, `users/${currentUser.uid}/goals`), next);
        }
        return next;
      });
    },
    [currentUser]
  );

  const deleteGoal = useCallback(
    (goalId: string) => {
      setGoals((prev) => {
        const next = prev.filter((g) => (g.id !== goalId));
        if (database && currentUser) {
          set(ref(database, `users/${currentUser.uid}/goals`), next);
        }
        return next;
      });
    },
    [currentUser]
  );

  const getGoalsByType = useCallback(
    (type: 'weekly' | 'monthly') => {
      return goals.filter((g) => g.type === type);
    },
    [goals]
  );

  const getGoalsByHabit = useCallback(
    (habitId: string) => {
      return goals.filter((g) => g.habitId === habitId);
    },
    [goals]
  );

  return {
    goals,
    isLoading,
    addGoal,
    updateGoal,
    deleteGoal,
    getGoalsByType,
    getGoalsByHabit,
  };
};


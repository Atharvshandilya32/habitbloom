'use client';

import { useState, useEffect, useCallback } from 'react';
import { Goal } from './goalUtils';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load goals from localStorage on mount
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

  // Save goals to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('habitbloom_goals', JSON.stringify(goals));
    }
  }, [goals, isLoading]);

  const addGoal = useCallback((goal: Goal) => {
    setGoals((prev) => [...prev, goal]);
  }, []);

  const updateGoal = useCallback((goalId: string, updates: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, ...updates } : g))
    );
  }, []);

  const deleteGoal = useCallback((goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }, []);

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

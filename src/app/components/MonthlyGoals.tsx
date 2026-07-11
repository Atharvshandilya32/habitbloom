'use client';

import { useState } from 'react';
import { Habit } from '../../../lib/habitTypes';
import { Goal } from '../../../lib/goalUtils';
import { useGoals } from '../../../lib/useGoals';
import { createGoal, calculateGoalProgress, isGoalActive, daysUntilGoalEnds } from '../../../lib/goalUtils';
import { Plus, X, CheckCircle2, Calendar } from 'lucide-react';

interface MonthlyGoalsProps {
  habits: Habit[];
  habitLogs: Record<string, number[]>;
}

export default function MonthlyGoals({ habits, habitLogs }: MonthlyGoalsProps) {
  const { goals, addGoal, deleteGoal } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('times');

  const monthlyGoals = goals.filter((g) => g.type === 'monthly' && isGoalActive(g));

  const handleAddGoal = () => {
    if (!selectedHabit || !target || parseInt(target) <= 0) {
      alert('Please select a habit and enter a valid target');
      return;
    }

    const habit = habits.find((h) => h.id === selectedHabit);
    if (habit) {
      const newGoal = createGoal(habit.id, habit.name, 'monthly', parseInt(target), unit);
      addGoal(newGoal);
      setSelectedHabit('');
      setTarget('');
      setUnit('times');
      setShowForm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Monthly Goals</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Goal
        </button>
      </div>

      {showForm && (
        <div className="bg-purple-50 rounded-lg p-4 mb-6 border border-purple-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Habit
              </label>
              <select
                value={selectedHabit}
                onChange={(e) => setSelectedHabit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Choose a habit...</option>
                {habits.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.emoji} {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target
                </label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g., 20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g., times"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddGoal}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg transition-colors"
              >
                Create Goal
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {monthlyGoals.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No active monthly goals. Create one to get started!</p>
        ) : (
          monthlyGoals.map((goal) => {
            const progress = calculateGoalProgress(goal, habitLogs);
            const daysLeft = daysUntilGoalEnds(goal);

            return (
              <div
                key={goal.id}
                className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{goal.habitName}</h3>
                    <p className="text-sm text-gray-600">
                      {progress.current} / {goal.target} {goal.unit}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar size={16} />
                    <span>{daysLeft} days left</span>
                  </div>
                  {progress.completed && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 size={16} />
                      <span>Goal achieved!</span>
                    </div>
                  )}
                  <span className="text-gray-600 font-semibold">{progress.percentage}%</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

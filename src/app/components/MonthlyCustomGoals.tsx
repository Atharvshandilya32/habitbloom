'use client';

import { useMemo, useState } from 'react';
import { CustomWritingGoal, isMonthlyGoalActive } from '../../../lib/customWritingGoals';
import { Plus, X, CheckCircle2 } from 'lucide-react';

type Props = {
  goals: CustomWritingGoal[];
  onAdd: (content: string) => void;
  onDelete: (goalId: string) => void;
};

export default function MonthlyCustomGoals({ goals, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');

  const displayedGoals = useMemo(() => {
    // Show ALL goals (user asked that all months should appear in the list)
    // Sort newest first for better visibility.
    return [...goals].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [goals]);

  const handleAdd = () => {
    const trimmed = content.trim();
    if (!trimmed) {
      alert('Please write something for your goal.');
      return;
    }
    onAdd(trimmed);
    setContent('');
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Monthly Writing Goals</h2>
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
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your writing goal</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write anything you want…"
                className="w-full min-h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setContent('');
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {displayedGoals.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No monthly writing goals yet. Add one!</p>
        ) : (
          displayedGoals.map((g) => {
            const active = isMonthlyGoalActive(g);
            const completed = new Date(g.endDate).getTime() < Date.now();

            return (
              <div
                key={g.id}
                className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800">This month</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{g.content}</p>
                  </div>
                  <button
                    onClick={() => onDelete(g.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Delete goal"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex items-center justify-between items-end text-sm gap-3">
                  <div className="text-gray-500">
                    <div className="text-xs">Range</div>
                    <div className="font-semibold text-gray-700">
                      {g.startDate} - {g.endDate}
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    {completed ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 size={16} />
                        <span>Finished</span>
                      </div>
                    ) : active ? (
                      <span className="text-gray-600 font-semibold">Active</span>
                    ) : (
                      <span className="text-gray-400 font-semibold">Inactive</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

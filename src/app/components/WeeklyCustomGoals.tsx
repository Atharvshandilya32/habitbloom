'use client';

import { useMemo, useState } from 'react';
import { CustomWritingGoal } from '../../../lib/customWritingGoals';

import { Plus, X, CheckCircle2 } from 'lucide-react';
import { isWeeklyGoalActive } from '../../../lib/customWritingGoals';

type Props = {
  goals: CustomWritingGoal[];
  onAdd: (content: string) => void;
  onDelete: (goalId: string) => void;
};

export default function WeeklyCustomGoals({ goals, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');

  const activeGoals = useMemo(() => goals.filter(isWeeklyGoalActive), [goals]);

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
        <h2 className="text-2xl font-bold text-gray-800">Weekly Writing Goals</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Goal
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your writing goal</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write anything you want…"
                className="w-full min-h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
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
        {activeGoals.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No active weekly writing goals. Add one!</p>
        ) : (
          activeGoals.map((g) => {
            // For free-text goals there is no "progress", so mark as complete if endDate is in the past.
            const completed = new Date(g.endDate).getTime() < Date.now();

            return (
              <div
                key={g.id}
                className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800">This week</h3>
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

                <div className="flex items-center justify-end text-sm">
                  {completed ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 size={16} />
                      <span>Finished</span>
                    </div>
                  ) : (
                    <span className="text-gray-600 font-semibold">Active</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

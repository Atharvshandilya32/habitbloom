'use client';

import { useMemo, useState } from 'react';
import { CustomWritingGoal, isMonthlyGoalActive } from '../../../lib/customWritingGoals';
import { Plus, Trash2, CheckCircle2, CalendarRange, Target } from 'lucide-react';

type Props = {
  goals: CustomWritingGoal[];
  onAdd: (content: string) => void;
  onDelete: (goalId: string) => void;
};

export default function MonthlyCustomGoals({ goals, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');

  const displayedGoals = useMemo(() => {
    return [...goals].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [goals]);

  const handleAdd = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setContent('');
    setShowForm(false);
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
              <CalendarRange className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Monthly Vision Goals</h2>
              <p className="text-xs text-slate-500">Long-term targets for the entire month</p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-[0.98] transition-all"
          >
            <Plus className="h-3.5 w-3.5 text-teal-600" />
            Add Goal
          </button>
        </div>

        {/* Inline Add Form */}
        {showForm && (
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3.5 mb-4 space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. Complete 20 workout sessions, read 3 books..."
              className="w-full min-h-[70px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 rounded-lg bg-teal-600 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition-colors"
              >
                Save Monthly Goal
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setContent('');
                }}
                className="flex-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-3">
          {displayedGoals.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 border border-slate-200/60 flex items-center justify-center mb-2">
                <Target className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">No active monthly goals</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Set big milestones for this month</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 text-xs font-bold text-teal-600 hover:underline inline-flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Set Monthly Goal
              </button>
            </div>
          ) : (
            displayedGoals.map((g) => {
              const active = isMonthlyGoalActive(g);
              const completed = new Date(g.endDate).getTime() < Date.now();
              return (
                <div
                  key={g.id}
                  className="group flex items-start justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                        This Month
                      </span>
                      {completed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> Completed
                        </span>
                      ) : active ? (
                        <span className="text-[10px] font-bold text-teal-600">Active Goal</span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400">Past Goal</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {g.content}
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete(g.id)}
                    className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all p-1"
                    title="Delete goal"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

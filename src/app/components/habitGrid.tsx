'use client';

import React, { useState, useRef } from 'react';
import { Plus, Trash2, Check, Pencil, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { makeLogKey } from '../../../lib/habitUtils';

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export interface HabitGridProps {
  habits: Habit[];
  logs: HabitLog;
  year: number;
  month: number;
  daysInMonth: number;
  onToggleCell: (habitId: string, day: number) => void;
  onAddHabit: () => void;
  onDeleteHabit: (habitId: string) => void;
  onUpdateHabit: (habitId: string, updates: Partial<Habit>) => void;
}

const getDayOfWeek = (year: number, month: number, day: number) => {
  const d = new Date(year, month - 1, day);
  return d.getDay();
};

export default function HabitGrid({
  habits,
  logs,
  year,
  month,
  daysInMonth,
  onToggleCell,
  onAddHabit,
  onDeleteHabit,
  onUpdateHabit,
}: HabitGridProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [editGoal, setEditGoal] = useState(5);
  const [pulseCells, setPulseCells] = useState<Set<string>>(new Set());
  const editNameRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  const todayDay =
    today.getFullYear() === year && today.getMonth() + 1 === month
      ? today.getDate()
      : -1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setEditName(habit.name);
    setEditEmoji(habit.emoji);
    setEditGoal(habit.goal);
    setTimeout(() => editNameRef.current?.focus(), 50);
  };

  const saveEdit = (habitId: string) => {
    if (!editName.trim()) {
      toast.error('Habit name cannot be empty');
      return;
    }

    onUpdateHabit(habitId, {
      name: editName.trim(),
      emoji: editEmoji.trim() || '⭐',
      goal: Math.max(1, Math.min(daysInMonth, editGoal)),
    });
    setEditingId(null);
    toast.success('Habit updated');
  };

  const cancelEdit = () => setEditingId(null);

  const handleToggle = (habitId: string, day: number) => {
    const cellKey = makeLogKey(habitId, year, month, day);
    onToggleCell(habitId, day);
    setPulseCells((prev) => {
      const next = new Set(prev);
      next.add(cellKey);
      return next;
    });

    setTimeout(() => {
      setPulseCells((prev) => {
        const next = new Set(prev);
        next.delete(cellKey);
        return next;
      });
    }, 250);
  };

  const handleDelete = (habitId: string, habitName: string) => {
    onDeleteHabit(habitId);
    toast.success(`"${habitName}" removed`);
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden transition-all">
      {/* Grid Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Daily Habit Grid</h2>
            <p className="text-xs text-slate-500">Track daily consistency and hit monthly target goals</p>
          </div>
        </div>

        <button
          onClick={onAddHabit}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" /> Add Habit
        </button>
      </div>

      {/* Grid Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: `${200 + daysInMonth * 34}px` }}>
          <thead>
            <tr className="bg-slate-50/90 text-xs font-semibold text-slate-500 border-b border-slate-200/80">
              <th className="sticky left-0 z-20 bg-slate-50 px-4 py-2.5 text-left border-r border-slate-200/80 min-w-[170px] uppercase tracking-wider text-[11px]">
                Habit
              </th>
              {days.map((d) => {
                const dow = getDayOfWeek(year, month, d);
                const isToday = d === todayDay;
                return (
                  <th
                    key={`day-header-${d}`}
                    className={`px-0 py-2 text-center min-w-[34px] w-[34px] border-r border-slate-200/50 ${
                      isToday ? 'bg-emerald-50/80 border-emerald-300' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`text-[10px] font-bold ${isToday ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {DAY_LETTERS[dow]}
                      </span>
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${
                          isToday ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-700'
                        }`}
                      >
                        {d}
                      </span>
                    </div>
                  </th>
                );
              })}
              <th className="sticky right-0 z-20 bg-slate-50 px-3 py-2.5 text-center border-l border-slate-200/80 text-[11px] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {habits.map((habit, rowIdx) => {
              const isEditing = editingId === habit.id;
              const rowBg = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30';
              return (
                <tr key={habit.id} className={`${rowBg} hover:bg-slate-50/80 transition-colors group`}>
                  {/* Habit Name / Edit Cell */}
                  <td className={`sticky left-0 z-10 border-r border-slate-200/80 px-4 py-2.5 ${rowBg} group-hover:bg-slate-50`}>
                    {isEditing ? (
                      <div className="space-y-2 py-1">
                        <div className="flex gap-1.5">
                          <input
                            ref={editNameRef}
                            value={editEmoji}
                            onChange={(e) => setEditEmoji(e.target.value)}
                            className="w-9 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-xs"
                            maxLength={2}
                          />
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(habit.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span>Target:</span>
                          <input
                            type="number"
                            value={editGoal}
                            min={1}
                            max={daysInMonth}
                            onChange={(e) => setEditGoal(parseInt(e.target.value, 10) || 1)}
                            className="w-14 rounded-lg border border-slate-200 bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-900"
                          />
                          <span>days/mo</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => saveEdit(habit.id)}
                            className="flex-1 flex items-center justify-center gap-1 rounded-md bg-emerald-600 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                          >
                            <Check className="h-3 w-3" /> Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex-1 flex items-center justify-center gap-1 rounded-md border border-slate-200 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100"
                          >
                            <X className="h-3 w-3" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 min-w-[150px]">
                        <span className="text-lg shrink-0">{habit.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-900">{habit.name}</p>
                          <p className="text-[10px] font-medium text-slate-400">Target: {habit.goal} days</p>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Days Matrix Cells */}
                  {days.map((d) => {
                    const cellKey = makeLogKey(habit.id, year, month, d);
                    const checked = !!logs[cellKey];
                    const isToday = d === todayDay;
                    const isPulsing = pulseCells.has(cellKey);
                    return (
                      <td
                        key={`cell-${habit.id}-${d}`}
                        className={`p-0.5 text-center border-r border-slate-200/40 ${
                          isToday ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        <button
                          onClick={() => handleToggle(habit.id, d)}
                          aria-label={`${checked ? 'Uncheck' : 'Check'} ${habit.name} on day ${d}`}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs transition-all duration-150 ${
                            isPulsing ? 'scale-125 shadow-md ring-2 ring-emerald-400' : ''
                          } ${
                            checked
                              ? 'bg-emerald-600 text-white font-bold shadow-sm hover:bg-emerald-700'
                              : 'bg-slate-100/80 text-transparent hover:bg-slate-200/80 hover:text-slate-300'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </button>
                      </td>
                    );
                  })}

                  {/* Actions Cell */}
                  <td className={`sticky right-0 z-10 border-l border-slate-200/80 px-2 py-2 text-center ${rowBg} group-hover:bg-slate-50`}>
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(habit)}
                        title="Edit habit"
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(habit.id, habit.name)}
                        title="Delete habit"
                        className="rounded-lg p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Empty State */}
            {habits.length === 0 && (
              <tr>
                <td colSpan={daysInMonth + 2} className="py-12 px-4 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-2xl mb-3 shadow-sm">
                      🌱
                    </div>
                    <h3 className="text-base font-bold text-slate-900">No habits tracked yet</h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Start building your daily streak! Add your first habit target to begin tracking consistency.
                    </p>
                    <button
                      onClick={onAddHabit}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all"
                    >
                      <Plus className="h-4 w-4" /> Create First Habit
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

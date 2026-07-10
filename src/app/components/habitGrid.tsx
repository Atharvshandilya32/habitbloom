'use client';

import React, { useState, useRef } from 'react';
import { Plus, Trash2, Check, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { Habit, HabitLog } from '../../../lib/habitTypes';

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
    const cellKey = `${habitId}_${day}`;
    onToggleCell(habitId, day);
    setPulseCells(prev => {
      const next = new Set(prev);
      next.add(cellKey);
      return next;
    });

    setTimeout(() => {
      setPulseCells(prev => {
        const next = new Set(prev);
        next.delete(cellKey);
        return next;
      });
    }, 200);
  };

  const handleDelete = (habitId: string, habitName: string) => {
    onDeleteHabit(habitId);
    toast.success(`"${habitName}" removed`);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border bg-muted">
        <h2 className="text-base font-semibold text-foreground">Daily Habit Grid</h2>
        <button
          onClick={onAddHabit}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition hover:bg-green-700"
        >
          <Plus size={14} /> Add Habit
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: `${180 + daysInMonth * 36}px` }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-muted border-b border-r border-border px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Habit
              </th>
              {days.map(d => {
                const dow = getDayOfWeek(year, month, d);
                const isToday = d === todayDay;
                return (
                  <th
                    key={`day-header-${d}`}
                    className={`border-b border-r border-border px-0 py-2 text-center min-w-[36px] w-[36px] ${
                      isToday ? 'bg-yellow-50' : 'bg-muted'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`text-[10px] font-medium ${isToday ? 'text-yellow-700' : 'text-muted-foreground'}`}>
                        {DAY_LETTERS[dow]}
                      </span>
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                        isToday ? 'bg-yellow-400 text-yellow-900' : 'text-foreground'
                      }`}>
                        {d}
                      </span>
                    </div>
                  </th>
                );
              })}
              <th className="sticky right-0 z-20 bg-muted border-b border-l border-border px-2 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, rowIdx) => {
              const isEditing = editingId === habit.id;
              const rowBg = rowIdx % 2 === 0 ? 'bg-background' : 'bg-muted/50';
              return (
                <tr key={habit.id} className={`${rowBg} group hover:bg-accent/30 transition-colors`}>
                  <td className={`sticky left-0 z-10 border-b border-r border-border px-3 py-3 ${rowBg}`}>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            ref={editNameRef}
                            value={editEmoji}
                            onChange={e => setEditEmoji(e.target.value)}
                            className="w-10 rounded border border-border bg-background px-2 py-1 text-center text-sm"
                            maxLength={2}
                          />
                          <input
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEdit(habit.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Goal:</span>
                          <input
                            type="number"
                            value={editGoal}
                            min={1}
                            max={daysInMonth}
                            onChange={e => setEditGoal(parseInt(e.target.value, 10) || 1)}
                            className="w-16 rounded border border-border bg-background px-2 py-1 text-xs"
                          />
                          <span>days</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(habit.id)}
                            className="flex-1 rounded bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-green-700"
                          >
                            <Check size={12} /> Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex-1 rounded border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-border"
                          >
                            <X size={12} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{habit.emoji}</span>
                        <span className="truncate text-sm font-medium text-foreground max-w-[130px]">{habit.name}</span>
                      </div>
                    )}
                  </td>
                  {days.map(d => {
                    const cellKey = `${habit.id}_${d}`;
                    const checked = !!logs[cellKey];
                    const isToday = d === todayDay;
                    const isPulsing = pulseCells.has(cellKey);
                    return (
                      <td
                        key={`cell-${habit.id}-${d}`}
                        className={`border-b border-r border-border p-1 text-center ${isToday ? 'bg-yellow-50' : ''}`}
                      >
                        <button
                          onClick={() => handleToggle(habit.id, d)}
                          aria-label={`${checked ? 'Uncheck' : 'Check'} ${habit.name} on day ${d}`}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded border-2 transition ${
                            isPulsing ? 'scale-105 border-yellow-500' : ''
                          } ${checked ? 'border-primary bg-primary text-white' : 'border-border bg-background text-muted-foreground'}`}
                        >
                          {checked ? <Check size={12} /> : null}
                        </button>
                      </td>
                    );
                  })}
                  <td className={`sticky right-0 z-10 border-b border-l border-border px-2 py-2 text-center ${rowBg}`}>
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        onClick={() => startEdit(habit)}
                        title="Edit habit"
                        className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(habit.id, habit.name)}
                        title="Delete habit"
                        className="rounded p-1 text-muted-foreground hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {habits.length === 0 && (
              <tr>
                <td colSpan={daysInMonth + 2} className="py-12 text-center text-muted-foreground text-sm">
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-4xl">📋</span>
                    <p className="font-semibold text-foreground">No habits yet</p>
                    <p className="max-w-xs text-xs text-muted-foreground">
                      Add your first habit to start tracking progress.
                    </p>
                    <button
                      onClick={onAddHabit}
                      className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-green-700"
                    >
                      <Plus size={14} /> Add First Habit
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

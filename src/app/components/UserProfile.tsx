'use client';

import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import { Pencil, Check, X, User as UserIcon, Mail, Calendar, Target, Flame, TrendingUp } from 'lucide-react';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { getLast6MonthsStats, getCurrentStreak } from '../../../lib/habitUtils';

interface UserProfileProps {
  user: User;
  habits: Habit[];
  logs: HabitLog;
  currentYear: number;
  currentMonth: number;
}

export default function UserProfile({ user, habits, logs, currentYear, currentMonth }: UserProfileProps) {
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user.displayName || '');
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  // Compute stats
  const history = getLast6MonthsStats(habits, logs, currentYear, currentMonth);
  const monthsWithData = history.filter(h => h.hasData).length;

  // Best streak across all habits this month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const bestStreak = habits.reduce((best, habit) => {
    const s = getCurrentStreak(habit, logs, currentYear, currentMonth, daysInMonth);
    return Math.max(best, s);
  }, 0);

  // Total days completed (all time, across all log keys)
  const totalDaysCompleted = Object.values(logs).filter(Boolean).length;

  // Best month from history
  const bestMonth = history.reduce((best, m) => (!best || m.pct > best.pct ? m : best), history[0]);

  // Join date from Firebase
  const joinDate = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  // Avatar: Google photo or initials
  const initials = (user.displayName || user.email || '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSaveName = async () => {
    if (!newName.trim()) { setNameError('Name cannot be empty'); return; }
    setSaving(true);
    setNameError('');
    try {
      await updateProfile(user, { displayName: newName.trim() });
      setEditingName(false);
    } catch {
      setNameError('Failed to update name. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header banner */}
      <div className="h-16 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 relative">
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
      </div>

      <div className="px-5 pb-5">
        {/* Avatar */}
        <div className="flex items-end justify-between -mt-8 mb-4">
          <div className="relative">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl border-4 border-white shadow-md object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-md bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">{initials}</span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
        </div>

        {/* Name + email */}
        <div className="mb-4">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                className="flex-1 rounded-lg border border-emerald-300 px-3 py-1.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-300"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => { setEditingName(false); setNewName(user.displayName || ''); }}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
              >
                <X size={14} />
              </button>
              {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">
                {user.displayName || 'HabitBloom User'}
              </h3>
              <button
                onClick={() => setEditingName(true)}
                className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                title="Edit display name"
              >
                <Pencil size={12} />
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1 mt-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail size={11} />
              <span>{user.email || '—'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar size={11} />
              <span>Member since {joinDate}</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            icon={<Target size={14} className="text-violet-500" />}
            label="Habits Tracked"
            value={habits.length.toString()}
            bg="bg-violet-50"
          />
          <StatCard
            icon={<Flame size={14} className="text-orange-500" />}
            label="Best Streak"
            value={bestStreak > 0 ? `${bestStreak}d` : '—'}
            bg="bg-orange-50"
          />
          <StatCard
            icon={<Check size={14} className="text-emerald-500" />}
            label="Total Check-ins"
            value={totalDaysCompleted.toString()}
            bg="bg-emerald-50"
          />
          <StatCard
            icon={<TrendingUp size={14} className="text-blue-500" />}
            label="Best Month"
            value={monthsWithData > 0 ? `${bestMonth.pct}%` : '—'}
            sub={monthsWithData > 0 ? bestMonth.label : ''}
            bg="bg-blue-50"
          />
        </div>

        {/* Months tracked */}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl px-3 py-2">
          <UserIcon size={12} />
          <span>
            {monthsWithData > 0
              ? `Tracking for ${monthsWithData} month${monthsWithData > 1 ? 's' : ''} · Keep it up! 🌱`
              : 'Start ticking habits to build your history!'}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, sub, bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl px-3 py-2.5 flex flex-col gap-0.5`}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{label}</span>
      </div>
      <span className="text-lg font-bold text-foreground tabular-nums">{value}</span>
      {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
    </div>
  );
}

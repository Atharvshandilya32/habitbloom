'use client';

import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import { Pencil, Check, X, User as UserIcon, Mail, Calendar, Target, Flame, TrendingUp, Share2 } from 'lucide-react';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { getLast6MonthsStats, getCurrentStreak } from '../../../lib/habitUtils';
import { generateUserIdentity } from '../../../lib/identityEngine';
import { calculateTotalXp, getLevelFromXp, getUniverseTitle } from '../../../lib/xpEngine';
import UniversePortalModal from './UniversePortalModal';

import { toast } from 'sonner';

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
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  // Compute stats
  const history = getLast6MonthsStats(habits, logs, currentYear, currentMonth);
  const monthsWithData = history.filter(h => h.hasData).length;

  // Generate Behavioral Identity & Universe Title
  const identity = generateUserIdentity(habits, logs);
  const totalXp = calculateTotalXp(habits, logs);
  const level = getLevelFromXp(totalXp);
  const universe = getUniverseTitle(level);

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

  const handleShareProfile = () => {
    const text = `🌸 My HabitBloom Profile 🌸\n` +
      `Identity: ${identity.icon} ${identity.title}\n` +
      `Level: ${level} - ${universe.title}\n` +
      `Best Streak: ${bestStreak} days\n` +
      `Total Check-ins: ${totalDaysCompleted}\n` +
      `#HabitBloom #Growth`;
    
    navigator.clipboard.writeText(text);
    toast.success('Profile summary copied to clipboard!');
  };

  return (
    <>
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
            
            <button
              onClick={handleShareProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Share2 size={12} />
              Share
            </button>
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

          {/* Universe Progression Badge */}
          <button 
            onClick={() => setIsPortalOpen(true)}
            className="w-full text-left mb-3 px-3 py-2 bg-slate-900 rounded-xl flex items-center gap-3 hover:bg-slate-800 hover:scale-[1.02] transition-all cursor-pointer group"
          >
            <div className="text-2xl group-hover:scale-110 transition-transform">{universe.icon}</div>
            <div className="flex-1">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>Level {level}</span>
                <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">View Journey &rarr;</span>
              </h4>
              <h3 className="text-sm font-bold text-white">{universe.title}</h3>
              <p className="text-xs text-slate-300">{universe.subtitle}</p>
            </div>
          </button>

          {/* Identity Badge */}
          <div className={`mb-5 p-4 rounded-2xl border shadow-sm flex items-center gap-4 ${
            identity.tier === 'platinum' ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 border-indigo-900/50' :
            identity.tier === 'gold' ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 text-amber-900 border-amber-200 shadow-amber-100/50' :
            identity.tier === 'silver' ? 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-slate-800 border-slate-300' :
            'bg-white text-slate-700 border-slate-200'
          }`}>
            <div className="text-4xl filter drop-shadow-sm">{identity.icon}</div>
            <div>
              <h4 className="font-extrabold text-[10px] uppercase tracking-widest opacity-70 mb-0.5">Behavioral Identity</h4>
              <h3 className="text-lg font-black tracking-tight mb-1">{identity.title}</h3>
              <p className="text-xs font-medium opacity-90 leading-relaxed">{identity.description}</p>
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

      <UniversePortalModal 
        isOpen={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
        currentLevel={level}
        currentXp={totalXp}
      />
    </>
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

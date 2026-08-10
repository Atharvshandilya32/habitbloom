import React from 'react';
import { Trophy, Flame, Award, Users, Globe } from 'lucide-react';

interface LeaderboardControlsProps {
  metric: 'streak' | 'xp' | 'habits';
  setMetric: (metric: 'streak' | 'xp' | 'habits') => void;
  scope: 'friends' | 'global';
  setScope: (scope: 'friends' | 'global') => void;
}

export function LeaderboardControls({
  metric,
  setMetric,
  scope,
  setScope,
}: LeaderboardControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
      <div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="text-amber-500" size={18} /> Shared Leaderboards
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Realtime rankings based on consistent daily habits, streaks, and total XP
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Scope selector */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setScope('friends')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              scope === 'friends'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users size={13} /> Friends
          </button>
          <button
            onClick={() => setScope('global')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              scope === 'global'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe size={13} /> Global
          </button>
        </div>

        {/* Metric selector */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setMetric('streak')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              metric === 'streak'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame size={13} /> Streak
          </button>
          <button
            onClick={() => setMetric('xp')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              metric === 'xp'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award size={13} /> XP
          </button>
        </div>
      </div>
    </div>
  );
}

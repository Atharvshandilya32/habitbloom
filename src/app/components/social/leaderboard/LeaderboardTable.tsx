import React from 'react';
import { LeaderboardEntry } from '../../../../../lib/socialTypes';

interface LeaderboardTableProps {
  remaining: LeaderboardEntry[];
  metric: 'streak' | 'xp' | 'habits';
  onOpenProfile: (uid: string) => void;
}

export function LeaderboardTable({
  remaining,
  metric,
  onOpenProfile,
}: LeaderboardTableProps) {
  if (remaining.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider grid grid-cols-12 gap-2">
        <span className="col-span-2 text-center">Rank</span>
        <span className="col-span-6">User</span>
        <span className="col-span-4 text-right">Score</span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {remaining.map((user) => (
          <div
            key={user.uid}
            className="p-4 grid grid-cols-12 gap-2 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span className="col-span-2 font-black text-slate-500 text-center text-sm">
              #{user.rank}
            </span>
            <div className="col-span-6 flex items-center gap-3">
              <button onClick={() => onOpenProfile(user.uid)}>
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </button>
              <div>
                <h5
                  onClick={() => onOpenProfile(user.uid)}
                  className="text-xs font-bold text-slate-900 dark:text-white hover:underline cursor-pointer"
                >
                  {user.displayName}
                </h5>
                <p className="text-[10px] text-slate-400 font-mono">{user.hbId}</p>
              </div>
            </div>
            <div className="col-span-4 text-right font-extrabold text-sm text-slate-900 dark:text-white">
              {metric === 'streak'
                ? `${user.currentStreak}d 🔥`
                : `${user.totalXP} XP ⭐`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

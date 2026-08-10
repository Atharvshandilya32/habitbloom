import React from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { LeaderboardEntry } from '../../../../../lib/socialTypes';

interface LeaderboardPodiumProps {
  top3: LeaderboardEntry[];
  metric: 'streak' | 'xp' | 'habits';
  onOpenProfile: (uid: string) => void;
}

export function LeaderboardPodium({
  top3,
  metric,
  onOpenProfile,
}: LeaderboardPodiumProps) {
  if (top3.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
      {/* 2nd Place */}
      {top3[1] && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center text-center relative order-2 md:order-1 mt-0 md:mt-4"
        >
          <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white text-xs font-black shadow-sm">
            🥈 #2 Rank
          </div>
          {top3[1].photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={top3[1].photoURL}
              alt={top3[1].displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-300 my-2 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => onOpenProfile(top3[1].uid)}
            />
          ) : (
            <div
              onClick={() => onOpenProfile(top3[1].uid)}
              className="w-16 h-16 rounded-full bg-slate-400 text-white font-black text-xl flex items-center justify-center my-2 cursor-pointer hover:scale-105 transition-transform"
            >
              {top3[1].displayName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <h4
            onClick={() => onOpenProfile(top3[1].uid)}
            className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer hover:underline"
          >
            {top3[1].displayName}
          </h4>
          <p className="text-[11px] text-slate-400 font-mono">{top3[1].hbId}</p>

          <div className="mt-3 px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-sm">
            {metric === 'streak'
              ? `${top3[1].currentStreak}d Streak 🔥`
              : `${top3[1].totalXP} XP ⭐`}
          </div>
        </motion.div>
      )}

      {/* 1st Place Champion */}
      {top3[0] && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-white dark:to-slate-900 rounded-3xl p-6 border-2 border-amber-400/50 shadow-xl flex flex-col items-center text-center relative order-1 md:order-2"
        >
          <Crown className="text-amber-500 absolute -top-4" size={28} />
          <div className="mt-1 px-3.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-sm">
            🥇 Champion #1
          </div>
          {top3[0].photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={top3[0].photoURL}
              alt={top3[0].displayName}
              className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 my-2 cursor-pointer hover:scale-105 transition-transform shadow-lg"
              onClick={() => onOpenProfile(top3[0].uid)}
            />
          ) : (
            <div
              onClick={() => onOpenProfile(top3[0].uid)}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-black text-2xl flex items-center justify-center my-2 cursor-pointer hover:scale-105 transition-transform shadow-lg"
            >
              {top3[0].displayName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <h4
            onClick={() => onOpenProfile(top3[0].uid)}
            className="text-base font-extrabold text-slate-900 dark:text-white cursor-pointer hover:underline"
          >
            {top3[0].displayName}
          </h4>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">
            Level {top3[0].level} Titan
          </p>

          <div className="mt-3 px-5 py-2 rounded-2xl bg-amber-400 text-slate-950 font-black text-base shadow-md">
            {metric === 'streak'
              ? `${top3[0].currentStreak}d Streak 🔥`
              : `${top3[0].totalXP} XP ⭐`}
          </div>
        </motion.div>
      )}

      {/* 3rd Place */}
      {top3[2] && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center text-center relative order-3 mt-0 md:mt-6"
        >
          <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-700 text-white text-xs font-black shadow-sm">
            🥉 #3 Rank
          </div>
          {top3[2].photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={top3[2].photoURL}
              alt={top3[2].displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-amber-700 my-2 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => onOpenProfile(top3[2].uid)}
            />
          ) : (
            <div
              onClick={() => onOpenProfile(top3[2].uid)}
              className="w-16 h-16 rounded-full bg-amber-700 text-white font-black text-xl flex items-center justify-center my-2 cursor-pointer hover:scale-105 transition-transform"
            >
              {top3[2].displayName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <h4
            onClick={() => onOpenProfile(top3[2].uid)}
            className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer hover:underline"
          >
            {top3[2].displayName}
          </h4>
          <p className="text-[11px] text-slate-400 font-mono">{top3[2].hbId}</p>

          <div className="mt-3 px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-sm">
            {metric === 'streak'
              ? `${top3[2].currentStreak}d Streak 🔥`
              : `${top3[2].totalXP} XP ⭐`}
          </div>
        </motion.div>
      )}
    </div>
  );
}

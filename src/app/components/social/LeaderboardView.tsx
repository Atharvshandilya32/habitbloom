'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Award, Users, Globe, Crown } from 'lucide-react';
import { LeaderboardEntry, UserSocialProfile } from '../../../../lib/socialTypes';
import { fetchLeaderboardEntries } from '../../../../lib/socialUtils';

interface LeaderboardViewProps {
  currentUserProfile: UserSocialProfile | null;
  friendUids: string[];
  onOpenProfile: (uid: string) => void;
}

export default function LeaderboardView({
  currentUserProfile,
  friendUids,
  onOpenProfile,
}: LeaderboardViewProps) {
  const [metric, setMetric] = useState<'streak' | 'xp' | 'habits'>('streak');
  const [scope, setScope] = useState<'friends' | 'global'>('friends');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      const data = await fetchLeaderboardEntries(
        metric,
        scope,
        currentUserProfile?.uid || '',
        friendUids
      );
      if (isMounted) {
        setEntries(data);
        setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [metric, scope, currentUserProfile, friendUids]);

  const top3 = entries.slice(0, 3);
  const remaining = entries.slice(3);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
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

      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold">Loading real-time leaderboard rankings...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
          <Trophy className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={36} />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No active rankings available</p>
          <p className="text-xs text-slate-500 mt-1">Connect with friends or log habit entries to claim your rank on the leaderboard!</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {top3.length > 0 && (
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
          )}

          {/* Remaining Rankings Table */}
          {remaining.length > 0 && (
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
          )}
        </>
      )}
    </div>
  );
}

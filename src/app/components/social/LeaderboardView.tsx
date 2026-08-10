'use client';

import React from 'react';
import { Trophy } from 'lucide-react';
import { UserSocialProfile } from '../../../../lib/socialTypes';

import { useLeaderboard } from './leaderboard/useLeaderboard';
import { LeaderboardControls } from './leaderboard/LeaderboardControls';
import { LeaderboardPodium } from './leaderboard/LeaderboardPodium';
import { LeaderboardTable } from './leaderboard/LeaderboardTable';

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
  const { metric, setMetric, scope, setScope, entries, isLoading } = useLeaderboard(
    currentUserProfile,
    friendUids
  );

  const top3 = entries.slice(0, 3);
  const remaining = entries.slice(3);

  return (
    <div className="space-y-6">
      <LeaderboardControls
        metric={metric}
        setMetric={setMetric}
        scope={scope}
        setScope={setScope}
      />

      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold">Loading real-time leaderboard rankings...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
          <Trophy className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={36} />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No active rankings available
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Connect with friends or log habit entries to claim your rank on the leaderboard!
          </p>
        </div>
      ) : (
        <>
          <LeaderboardPodium top3={top3} metric={metric} onOpenProfile={onOpenProfile} />
          <LeaderboardTable remaining={remaining} metric={metric} onOpenProfile={onOpenProfile} />
        </>
      )}
    </div>
  );
}

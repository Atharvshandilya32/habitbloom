import React from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp } from 'lucide-react';
import { Habit } from '../../../../lib/habitTypes';

const SixMonthChart = dynamic(() => import('../charts/SixMonthChart'), { ssr: false });

interface GrowthAndRankingProps {
  monthsWithData: number;
  displaySixMonth: { label: string; year: number; month: number; pct: number; hasData: boolean }[];
  displayRanks: { habit: Habit; rank: number; consistencyScore: number }[];
  displayTrends: { habitId: string; currentPct: number; prevPct: number; delta: number }[];
  prevMonthName: string;
  habits: Habit[];
}

export default function GrowthAndRanking({
  monthsWithData,
  displaySixMonth,
  displayRanks,
  displayTrends,
  prevMonthName,
  habits,
}: GrowthAndRankingProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* 6-Month Growth Journey */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1">🌱 6-Month Growth Curve</h3>
        <p className="text-xs text-slate-500 mb-3">
          {monthsWithData < 2
            ? `Track ${2 - monthsWithData} more month${2 - monthsWithData !== 1 ? 's' : ''} for growth curve`
            : 'Completion history over 6 months'}
        </p>
        {monthsWithData < 1 ? (
          <div className="h-28 flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
            <TrendingUp className="h-5 w-5" />
            <span>Log habits daily to build your growth curve</span>
          </div>
        ) : (
          <SixMonthChart data={displaySixMonth} />
        )}
      </div>

      {/* Habit Rank by Consistency */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1">🏆 Consistency Leaderboard</h3>
        <p className="text-xs text-slate-500 mb-3">Ranked by completion rate</p>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {displayRanks.map((r) => (
            <div key={r.habit.id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50/70 border border-slate-100 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-black text-slate-400 w-4 text-center">#{r.rank}</span>
                <span className="text-sm">{r.habit.emoji}</span>
                <span className="font-bold text-slate-800 truncate">{r.habit.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${r.consistencyScore}%` }} />
                </div>
                <span className="font-bold text-slate-700 w-7 text-right">{r.consistencyScore}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Month-over-Month Trends */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1">📈 Month-over-Month Delta</h3>
        <p className="text-xs text-slate-500 mb-3">Compared to {prevMonthName}</p>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {displayTrends.map((t) => {
            const habit = habits.find((h) => h.id === t.habitId);
            if (!habit) return null;
            const isUp = t.delta > 0;
            const isDown = t.delta < 0;
            return (
              <div key={t.habitId} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50/70 border border-slate-100 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm">{habit.emoji}</span>
                  <span className="font-bold text-slate-800 truncate">{habit.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-bold">
                  <span className="text-slate-500">{t.currentPct}%</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[11px] ${
                    isUp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : isDown ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isUp ? `+${t.delta}%` : isDown ? `${t.delta}%` : '0%'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

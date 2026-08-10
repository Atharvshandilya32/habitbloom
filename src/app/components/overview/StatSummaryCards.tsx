import React from 'react';
import { Flame, Target, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Habit } from '../../../../lib/habitTypes';

interface StatSummaryCardsProps {
  bestStreak: number;
  overallPct: number;
  totalDone: number;
  totalPossible: number;
  habits: Habit[];
}

export default function StatSummaryCards({
  bestStreak,
  overallPct,
  totalDone,
  totalPossible,
  habits,
}: StatSummaryCardsProps) {
  return (
    <div id="statistics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Best Streak */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>Best Streak</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-900">{bestStreak}</span>
          <span className="text-xs font-bold text-slate-500">days record</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Highest consecutive habit completion</p>
      </div>

      {/* 2. Completion Rate */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>Completion Rate</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-900">{overallPct}%</span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            Target
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Average goal fulfillment this month</p>
      </div>

      {/* 3. Habits Completed */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>Habits Completed</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-900">{totalDone}</span>
          <span className="text-xs font-semibold text-slate-400">/ {totalPossible} logs</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Total checkmarks recorded</p>
      </div>

      {/* 4. Active Habits */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>Active Habits</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Target className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-900">{habits.length}</span>
          <span className="text-xs font-bold text-slate-500">habits active</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Currently tracked habit routines</p>
      </div>
    </div>
  );
}

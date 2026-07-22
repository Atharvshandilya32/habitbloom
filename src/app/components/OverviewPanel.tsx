'use client';

import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Flame, Target, TrendingUp, CheckCircle2, BarChart2 } from 'lucide-react';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import {
  getHabitStats,
  getCurrentStreak,
  getMonthOverMonthTrends,
  getHabitRanksByConsistency,
  getLast6MonthsStats,
} from '../../../lib/habitUtils';

const MonthlyBarChart = dynamic(() => import('./charts/MonthlyBarChart'), { ssr: false });
const OverallDonutChart = dynamic(() => import('./charts/OverallDonutChart'), { ssr: false });
const SixMonthChart = dynamic(() => import('./charts/SixMonthChart'), { ssr: false });

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

interface OverviewPanelProps {
  habits: Habit[];
  logs: HabitLog;
  daysInMonth: number;
  year: number;
  month: number;
}

export default function OverviewPanel({ habits, logs, daysInMonth, year, month }: OverviewPanelProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  // ── Overall completion for current month ──────────────────────────────────
  let totalDone = 0, totalPossible = 0;
  habits.forEach((h) => {
    const { done, goal } = getHabitStats(h, logs, daysInMonth, year, month);
    totalDone += done;
    totalPossible += goal;
  });
  const overallPct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  // ── Best streak calculation ────────────────────────────────────────────────
  const bestStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    return habits.reduce((max, h) => {
      const s = getCurrentStreak(h, logs, year, month, daysInMonth);
      return s > max ? s : max;
    }, 0);
  }, [habits, logs, year, month, daysInMonth]);

  // ── 12-month bar chart data ──────────────────────────────────────────────
  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, idx) => {
      const m = idx + 1;
      const daysInM = new Date(year, m, 0).getDate();
      let pct = 0;
      if (habits.length > 0) {
        const total = habits.reduce((sum, habit) =>
          sum + getHabitStats(habit, logs, daysInM, year, m).pct, 0);
        pct = Math.round(total / habits.length);
      }
      return { month: MONTH_NAMES[idx], pct, isCurrent: m === month };
    });
  }, [habits, logs, year, month]);

  // ── 6-month development history ────────────────────────────────────────────
  const sixMonthData = useMemo(() =>
    getLast6MonthsStats(habits, logs, year, month),
    [habits, logs, year, month]
  );
  const sixMonthDataSSR = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      label: MONTH_NAMES[(month - 6 + i + 12) % 12],
      year,
      month: ((month - 6 + i + 12) % 12) + 1,
      pct: 0,
      hasData: false,
    })),
    [month, year]
  );
  const displaySixMonth = isClient ? sixMonthData : sixMonthDataSSR;
  const monthsWithData = isClient ? sixMonthData.filter(d => d.hasData).length : 0;

  // ── Streaks ───────────────────────────────────────────────────────────────
  const streaks = useMemo(() =>
    habits.map(h => ({ ...h, streak: getCurrentStreak(h, logs, year, month, daysInMonth) }))
      .sort((a, b) => b.streak - a.streak),
    [habits, logs, year, month, daysInMonth]
  );
  const streaksSSR = useMemo(() => habits.map(h => ({ ...h, streak: 0 })), [habits]);

  // ── Trends ────────────────────────────────────────────────────────────────
  const trends = useMemo(() =>
    getMonthOverMonthTrends(habits, logs, year, month),
    [habits, logs, year, month]
  );
  const trendsSSR = useMemo(() =>
    habits.map(h => ({ habitId: h.id, currentPct: 0, prevPct: 0, delta: 0 })),
    [habits]
  );

  // ── Ranks ─────────────────────────────────────────────────────────────────
  const ranks = useMemo(() => getHabitRanksByConsistency(habits, logs), [habits, logs]);
  const ranksSSR = useMemo(() =>
    habits.map((h, i) => ({ habit: h, rank: i + 1, consistencyScore: 0 })),
    [habits]
  );

  const displayStreaks = isClient ? streaks : streaksSSR;
  const displayTrends = isClient ? trends : trendsSSR;
  const displayRanks = isClient ? ranks : ranksSSR;
  const prevMonthName = MONTH_NAMES[month === 1 ? 11 : month - 2];

  return (
    <div className="space-y-6">
      {/* ROW 4: Statistics Summary Cards (4-card Strip) */}
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

      {/* ROW 6: Analytics & Charts Hub */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Progress Chart */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Completion Trend ({year})</h3>
              <p className="text-xs text-slate-500">Overall completion % across all 12 months</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-200/60">
              <BarChart2 className="h-4 w-4" />
            </div>
          </div>
          <div className="h-52">
            <MonthlyBarChart data={chartData} />
          </div>
        </div>

        {/* Overall Progress Donut */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Overall Monthly Fulfillment</h3>
              <p className="text-xs text-slate-500">
                {MONTH_NAMES[month - 1]} {year} — {totalDone} of {totalPossible} total
              </p>
            </div>
          </div>
          <div className="h-44 relative">
            <OverallDonutChart done={totalDone} possible={totalPossible} pct={overallPct} />
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-600" />
              <span className="font-semibold text-slate-700">Completed ({totalDone})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-200" />
              <span className="font-semibold text-slate-500">Remaining ({totalPossible - totalDone})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Month Growth & Ranking Breakdown */}
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
    </div>
  );
}
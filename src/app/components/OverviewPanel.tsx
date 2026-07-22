'use client';

import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
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
  habits.forEach(h => {
    const { done, goal } = getHabitStats(h, logs, daysInMonth, year, month);
    totalDone += done;
    totalPossible += goal;
  });
  const overallPct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  // ── 12-month bar chart data (uses real logs) ──────────────────────────────
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

  // ── Top habits ────────────────────────────────────────────────────────────
  const topHabits = habits
    .map(h => ({ ...h, ...getHabitStats(h, logs, daysInMonth, year, month) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 10);

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
  const topHabitsSSR = useMemo(() =>
    habits.map(h => ({ ...h, done: 0, goal: h.goal, pct: 0 })),
    [habits]
  );

  const displayStreaks = isClient ? streaks : streaksSSR;
  const displayTrends = isClient ? trends : trendsSSR;
  const displayRanks = isClient ? ranks : ranksSSR;
  const displayTopHabits = isClient ? topHabits : topHabitsSSR;
  const prevMonthName = MONTH_NAMES[month === 1 ? 11 : month - 2];

  return (
    <div className="flex flex-col gap-5">

      {/* 1. Monthly Bar Chart — ABOVE DONUT (as requested) */}
      <div className="bg-card rounded-xl card-shadow border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">Monthly Progress {year}</h3>
        <p className="text-xs text-muted-foreground mb-3">Completion % across all 12 months</p>
        <div className="h-52"><MonthlyBarChart data={chartData} /></div>
      </div>

      {/* 2. Overall Donut Chart */}
      <div className="bg-card rounded-xl card-shadow border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">Overall Progress</h3>
        <p className="text-xs text-muted-foreground mb-3">
          {MONTH_NAMES[month - 1]} {year} — {totalDone} of {totalPossible} total
        </p>
        <div className="h-44 relative">
          <OverallDonutChart done={totalDone} possible={totalPossible} pct={overallPct} />
        </div>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Completed ({totalDone})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span className="text-xs text-muted-foreground">Remaining ({totalPossible - totalDone})</span>
          </div>
        </div>
      </div>

      {/* 3. 6-Month Development Chart */}
      <div className="bg-card rounded-xl card-shadow border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">🌱 6-Month Growth Journey</h3>
        <p className="text-xs text-muted-foreground mb-3">
          {monthsWithData < 2
            ? `Track ${2 - monthsWithData} more month${2 - monthsWithData !== 1 ? 's' : ''} to see your growth curve`
            : 'Your habit completion trend over the last 6 months'}
        </p>
        {monthsWithData < 1 ? (
          <div className="h-24 flex items-center justify-center text-muted-foreground text-xs">
            Start ticking habits to build your history graph 📈
          </div>
        ) : (
          <SixMonthChart data={displaySixMonth} />
        )}
      </div>

      {/* 4. Current Streaks */}
      <div className="bg-card rounded-xl card-shadow border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">🔥 Current Streaks</h3>
        <p className="text-xs text-muted-foreground mb-3">Consecutive days completed this month</p>
        <div className="flex flex-col gap-2">
          {displayStreaks.map(h => (
            <div key={h.id} className="flex items-center gap-2">
              <span className="text-sm flex-shrink-0">{h.emoji}</span>
              <span className="text-xs text-foreground flex-1 truncate">{h.name}</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                {h.streak > 0 ? (
                  <><span className="text-orange-500 text-xs">🔥</span><span className="text-xs font-bold tabular-nums text-orange-600">{h.streak}d</span></>
                ) : (
                  <span className="text-xs text-muted-foreground tabular-nums">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Month-over-Month Trends (now uses REAL prev month data) */}
      <div className="bg-card rounded-xl card-shadow border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">📈 Month-over-Month Trends</h3>
        <p className="text-xs text-muted-foreground mb-3">vs {prevMonthName} — change in completion %</p>
        <div className="flex flex-col gap-2">
          {displayTrends.map(t => {
            const habit = habits.find(h => h.id === t.habitId);
            if (!habit) return null;
            const isUp = t.delta > 0, isDown = t.delta < 0, isFlat = t.delta === 0;
            return (
              <div key={t.habitId} className="flex items-center gap-2">
                <span className="text-sm flex-shrink-0">{habit.emoji}</span>
                <span className="text-xs text-foreground flex-1 truncate">{habit.name}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-xs tabular-nums text-muted-foreground">{t.currentPct}%</span>
                  <span className={`text-xs font-bold tabular-nums ${isUp ? 'text-green-600' : isDown ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {isUp ? `▲+${t.delta}` : isDown ? `▼${t.delta}` : isFlat && t.prevPct === 0 ? '—' : '●0'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Habit Rank by Consistency */}
      <div className="bg-card rounded-xl card-shadow border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">🏆 Habit Rank by Consistency</h3>
        <p className="text-xs text-muted-foreground mb-3">Completion % this month</p>
        <div className="flex flex-col gap-2">
          {displayRanks.map(r => (
            <div key={r.habit.id} className="flex items-center gap-2">
              <span className={`text-xs font-bold w-5 text-right flex-shrink-0 ${r.rank === 1 ? 'text-yellow-500' : r.rank === 2 ? 'text-gray-400' : r.rank === 3 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `#${r.rank}`}
              </span>
              <span className="text-sm flex-shrink-0">{r.habit.emoji}</span>
              <span className="text-xs text-foreground flex-1 truncate">{r.habit.name}</span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-12 bg-muted rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${r.consistencyScore}%` }} />
                </div>
                <span className={`text-xs font-bold tabular-nums w-8 text-right ${r.consistencyScore >= 80 ? 'text-primary' : r.consistencyScore >= 50 ? 'text-yellow-600' : r.consistencyScore > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {r.consistencyScore > 0 ? `${r.consistencyScore}%` : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Top Daily Habits */}
      <div className="bg-card rounded-xl card-shadow border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">Top Daily Habits</h3>
        <p className="text-xs text-muted-foreground mb-3">Ranked by completion this month</p>
        <div className="flex flex-col gap-2">
          {displayTopHabits.map((habit, i) => (
            <div key={habit.id} className="flex items-center gap-2.5">
              <span className="text-xs font-700 text-muted-foreground w-4 text-right flex-shrink-0">{i + 1}.</span>
              <span className="text-sm leading-none flex-shrink-0">{habit.emoji}</span>
              <span className="text-xs font-500 text-foreground flex-1 truncate">{habit.name}</span>
              <div className="w-16 bg-muted rounded-full h-1.5 flex-shrink-0">
                <div className="h-1.5 rounded-full bg-primary progress-bar-fill" style={{ width: `${habit.pct}%` }} />
              </div>
              <span className={`text-xs font-700 tabular-nums flex-shrink-0 w-8 text-right ${habit.pct >= 80 ? 'text-primary' : habit.pct >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                {habit.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
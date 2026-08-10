'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import {
  getHabitStats,
  getCurrentStreak,
  getMonthOverMonthTrends,
  getHabitRanksByConsistency,
  getLast6MonthsStats,
} from '../../../lib/habitUtils';

import StatSummaryCards from './overview/StatSummaryCards';
import AnalyticsChartsHub from './overview/AnalyticsChartsHub';
import GrowthAndRanking from './overview/GrowthAndRanking';

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

  const displayTrends = isClient ? trends : trendsSSR;
  const displayRanks = isClient ? ranks : ranksSSR;
  const prevMonthName = MONTH_NAMES[month === 1 ? 11 : month - 2];

  return (
    <div className="space-y-6">
      {/* ROW 4: Statistics Summary Cards (4-card Strip) */}
      <StatSummaryCards
        bestStreak={bestStreak}
        overallPct={overallPct}
        totalDone={totalDone}
        totalPossible={totalPossible}
        habits={habits}
      />

      {/* ROW 6: Analytics & Charts Hub */}
      <AnalyticsChartsHub
        year={year}
        month={month}
        totalDone={totalDone}
        totalPossible={totalPossible}
        overallPct={overallPct}
        chartData={chartData}
      />

      {/* 6-Month Growth & Ranking Breakdown */}
      <GrowthAndRanking
        monthsWithData={monthsWithData}
        displaySixMonth={displaySixMonth}
        displayRanks={displayRanks}
        displayTrends={displayTrends}
        prevMonthName={prevMonthName}
        habits={habits}
      />
    </div>
  );
}
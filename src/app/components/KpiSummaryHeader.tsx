'use client';

import React from 'react';
import { Flame, Target, TrendingUp, Plus, CheckCircle2 } from 'lucide-react';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { makeLogKey, getMonthlyCompletionPct } from '../../../lib/habitUtils';

interface KpiSummaryHeaderProps {
  habits: Habit[];
  logs: HabitLog;
  year: number;
  month: number;
  onAddHabit: () => void;
}

export default function KpiSummaryHeader({
  habits,
  logs,
  year,
  month,
  onAddHabit,
}: KpiSummaryHeaderProps) {
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDay = isCurrentMonth ? today.getDate() : 1;

  // Today's completion count
  const completedTodayCount = habits.filter((h) => {
    const key = makeLogKey(h.id, year, month, todayDay);
    return !!logs[key];
  }).length;

  const totalHabits = habits.length;
  const todayPct = totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0;
  const monthlyAvgPct = getMonthlyCompletionPct(habits, logs, year, month);

  // Compute current active streak across all habits
  let streakDays = 0;
  if (totalHabits > 0) {
    const checkDate = new Date();
    let checking = true;
    while (checking && streakDays < 365) {
      const y = checkDate.getFullYear();
      const m = checkDate.getMonth() + 1;
      const d = checkDate.getDate();
      const anyDone = habits.some((h) => logs[makeLogKey(h.id, y, m, d)]);
      if (anyDone) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Allow missing today if it's currently today and not yet completed
        if (streakDays === 0 && checkDate.toDateString() === new Date().toDateString()) {
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          checking = false;
        }
      }
    }
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Today's Progress */}
      <div className="group relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today&apos;s Progress</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">{completedTodayCount}</span>
            <span className="text-sm font-semibold text-slate-400">/ {totalHabits} habits</span>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {todayPct}%
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
            style={{ width: `${todayPct}%` }}
          />
        </div>
      </div>

      {/* 2. Current Streak */}
      <div className="group relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Streak</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{streakDays}</span>
            <span className="text-sm font-semibold text-slate-500">{streakDays === 1 ? 'day' : 'days'}</span>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            🔥 On Fire
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500">Keep up your daily habit momentum!</p>
      </div>

      {/* 3. Monthly Completion Rate */}
      <div className="group relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly Completion</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-black text-slate-900">{monthlyAvgPct}%</span>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            Consistency
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${monthlyAvgPct}%` }}
          />
        </div>
      </div>

      {/* 4. Quick Add Habit CTA */}
      <div className="group relative rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 shadow-sm hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Quick Actions</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Target className="h-4 w-4" />
          </div>
        </div>
        <button
          onClick={onAddHabit}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2 px-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" />
          Add New Habit
        </button>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { NavTab } from './charts/TitleBanner';
import {
  calculateLongestStreakOverall,
  calculateOverallConsistencyScore,
  calculateActiveDaysCount,
  calculatePersonalRecords,
  calculateWeeklyReview,
} from '../../../lib/analyticsUtils';
import HabitGrid, { HabitGridProps } from './habitGrid';
import WeeklyProgress from './WeeklyProgress';
import OverviewPanel from './OverviewPanel';
import {
  Sparkles,
  Flame,
  Zap,
  Calendar,
  Plus,
  CheckCircle2,
  TrendingUp,
  Award,
  Target,
  ArrowRight,
} from 'lucide-react';

interface DashboardViewProps extends HabitGridProps {
  user: FirebaseUser | null;
  onNavigateTab: (tab: NavTab) => void;
}

export default function DashboardView({
  user,
  habits,
  logs,
  year,
  month,
  daysInMonth,
  onToggleCell,
  onAddHabit,
  onDeleteHabit,
  onUpdateHabit,
  onNavigateTab,
}: DashboardViewProps) {
  const today = new Date();
  const todayDay = today.getDate();

  // Calculate today's completed count
  const todayCompletedCount = habits.filter(h => {
    const key = `${h.id}_${today.getFullYear()}_${today.getMonth() + 1}_${todayDay}`;
    return !!logs[key];
  }).length;

  const todayProgressPct = habits.length > 0 ? Math.round((todayCompletedCount / habits.length) * 100) : 0;
  const overallStreak = calculateLongestStreakOverall(habits, logs);
  const consistencyScore = calculateOverallConsistencyScore(habits, logs);
  const activeDays = calculateActiveDaysCount(logs);
  const records = calculatePersonalRecords(habits, logs);
  const weeklyReview = calculateWeeklyReview(habits, logs);

  const userName = user?.displayName ? user.displayName.split(' ')[0] : 'Blooming Star';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP SECTION: Welcome, Today's Progress, Quick Add, Streak
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Welcome & Today's Progress Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <Sparkles size={13} />
                Daily Overview
              </span>
              <button
                onClick={onAddHabit}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95"
              >
                <Plus size={15} /> Quick Add Habit
              </button>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Welcome back, <span className="text-emerald-400">{userName}</span>! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                You&apos;ve completed <span className="font-bold text-emerald-400">{todayCompletedCount} of {habits.length}</span> habits today. Keep your momentum going!
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Target size={14} className="text-emerald-400" />
                Today&apos;s Focus Rate
              </span>
              <span className="text-emerald-400 font-extrabold text-sm">{todayProgressPct}%</span>
            </div>

            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/80">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full transition-all duration-500"
                style={{ width: `${todayProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Streak & Quick Stats Widget */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Streak</span>
              <div className="p-2 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100">
                <Flame size={20} />
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 tracking-tight">{overallStreak}</span>
              <span className="text-sm font-bold text-slate-500">Days Active</span>
            </div>

            <p className="text-xs text-slate-500 mt-1">Best active consistency streak sequence</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Consistency Score</span>
              <span className="font-extrabold text-emerald-600">{consistencyScore}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Total Active Days</span>
              <span className="font-extrabold text-slate-800">{activeDays} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SECOND SECTION: Daily Habit Grid (Largest Component)
      ───────────────────────────────────────────────────────────── */}
      <div>
        <HabitGrid
          habits={habits}
          logs={logs}
          year={year}
          month={month}
          daysInMonth={daysInMonth}
          onToggleCell={onToggleCell}
          onAddHabit={onAddHabit}
          onDeleteHabit={onDeleteHabit}
          onUpdateHabit={onUpdateHabit}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. THIRD SECTION: Weekly Progress, Monthly Progress, Consistency Score, Active Days
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => onNavigateTab('analytics')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-emerald-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Weekly Rate</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Zap size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{weeklyReview.completionRate}%</span>
            <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Review <ArrowRight size={12} />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Automated weekly completion index</p>
        </div>

        <div
          onClick={() => onNavigateTab('analytics')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-blue-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Target</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Calendar size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{records.highestCompletionMonth}%</span>
            <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Analytics <ArrowRight size={12} />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Month-to-date average performance</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Consistency Score</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">{consistencyScore}%</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">30-day weighted execution index</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Days</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">{activeDays}</span>
            <span className="text-xs font-bold text-slate-400 ml-1.5">days</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Lifetime unique active days</p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. BOTTOM SECTION: Recent Activity, Personal Records Preview, Overview
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <WeeklyProgress habits={habits} logs={logs} year={year} month={month} daysInMonth={daysInMonth} />
          <OverviewPanel habits={habits} logs={logs} daysInMonth={daysInMonth} year={year} month={month} />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              Personal Records
            </h3>
            <button
              onClick={() => onNavigateTab('records')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs font-medium text-slate-600">Peak Single Day</div>
              <div className="text-sm font-extrabold text-slate-900">{records.mostCompletedInDay} Habits</div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs font-medium text-slate-600">Perfect Weeks</div>
              <div className="text-sm font-extrabold text-emerald-600">{records.perfectWeeks} Weeks</div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs font-medium text-slate-600">Highest Completion Week</div>
              <div className="text-sm font-extrabold text-blue-600">{records.highestCompletionWeek}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

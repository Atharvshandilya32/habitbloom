'use client';

import React, { useState } from 'react';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { calculateWeeklyReview } from '../../../lib/analyticsUtils';
import { subDays, addDays } from 'date-fns';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Zap,
  CheckCircle2,
  XCircle,
  Flame,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import EmptyState from './EmptyState';

interface WeeklyReviewViewProps {
  habits: Habit[];
  logs: HabitLog;
  onGoToDashboard?: () => void;
}

export default function WeeklyReviewView({ habits, logs, onGoToDashboard }: WeeklyReviewViewProps) {
  const [refDate, setRefDate] = useState<Date>(new Date());

  const review = calculateWeeklyReview(habits, logs, refDate);

  const handlePrevWeek = () => {
    setRefDate(prev => subDays(prev, 7));
  };

  const handleNextWeek = () => {
    setRefDate(prev => addDays(prev, 7));
  };

  const handleCurrentWeek = () => {
    setRefDate(new Date());
  };

  if (habits.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <EmptyState
          type="review"
          title="No habits to review"
          description="Create habits to start receiving automated weekly performance summaries and productivity insights."
          actionLabel="Go to Dashboard"
          onAction={onGoToDashboard}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Week Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60 mb-2">
            <Calendar size={13} />
            Automated Weekly Summary
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Weekly Review</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Performance breakdown for <span className="font-bold text-slate-700">{review.weekLabel}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60">
          <button
            onClick={handlePrevWeek}
            className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-all"
            title="Previous Week"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleCurrentWeek}
            className="px-3 py-1 text-xs font-bold rounded-lg bg-white text-slate-800 shadow-sm hover:text-emerald-600 transition-all"
          >
            This Week
          </button>
          <button
            onClick={handleNextWeek}
            className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-all"
            title="Next Week"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Primary Key Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completion %</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Zap size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{review.completionRate}%</span>
            <div className={`flex items-center text-xs font-bold ${review.improvementDelta >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {review.improvementDelta >= 0 ? <TrendingUp size={14} className="mr-0.5" /> : <TrendingDown size={14} className="mr-0.5" />}
              {review.improvementDelta >= 0 ? `+${review.improvementDelta}%` : `${review.improvementDelta}%`} WoW
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">vs {review.prevWeekCompletionRate}% last week</p>
        </div>

        {/* Best Habit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Best Habit</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Award size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-slate-900 truncate flex items-center gap-1.5">
              <span>{review.bestHabit?.emoji || '🏆'}</span>
              <span className="truncate">{review.bestHabit?.name || 'N/A'}</span>
            </div>
            <p className="text-xs font-bold text-amber-600 mt-1">{review.bestHabit?.rate || 0}% Completion Rate</p>
          </div>
        </div>

        {/* Weakest Habit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Weakest Habit</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-slate-900 truncate flex items-center gap-1.5">
              <span>{review.weakestHabit?.emoji || '🎯'}</span>
              <span className="truncate">{review.weakestHabit?.name || 'N/A'}</span>
            </div>
            <p className="text-xs font-bold text-rose-500 mt-1">{review.weakestHabit?.rate || 0}% Completion Rate</p>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-orange-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Longest Streak</span>
            <div className="p-2 rounded-xl bg-orange-50 text-orange-500">
              <Flame size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900">{review.longestStreak}</span>
            <span className="text-xs font-bold text-slate-500">days active</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Best active streak sequence</p>
        </div>
      </div>

      {/* Secondary Metrics & Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Breakdown Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daily Completion Breakdown</h2>
              <p className="text-xs text-slate-500">Total habits completed each day this week</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={review.dailyBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs font-medium shadow-xl border border-slate-800">
                          <p className="font-bold text-emerald-400">{data.day} ({data.dateStr})</p>
                          <p className="mt-1">{data.completed} of {data.total} habits completed ({data.rate}%)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="completed" radius={[6, 6, 0, 0]}>
                  {review.dailyBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.rate >= 80 ? '#10b981' : entry.rate >= 50 ? '#3b82f6' : entry.rate > 0 ? '#f59e0b' : '#cbd5e1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productivity Highlights */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Productivity Insights</h2>
            <p className="text-xs text-slate-500 mb-4">Highlights based on your logging patterns</p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Most Productive Day</div>
                  <div className="text-sm font-extrabold text-emerald-700">{review.mostProductiveDay}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <XCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Least Productive Day</div>
                  <div className="text-sm font-extrabold text-slate-600">{review.leastProductiveDay}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase">Completed</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{review.totalCompleted}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase">Missed</div>
                  <div className="text-xl font-black text-rose-500 mt-0.5">{review.missedHabitsCount}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-1 text-xs">
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">Weekly Tip</span>
            <p className="text-slate-300 leading-relaxed">
              Maintain consistency on {review.leastProductiveDay} to boost your overall completion score by at least 15% next week.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

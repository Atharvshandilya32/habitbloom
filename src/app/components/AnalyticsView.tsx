'use client';

import React from 'react';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import {
  calculateContributionHeatmap,
  calculateTrend7Days,
  calculateTrend30Days,
  getHabitLongestStreak,
} from '../../../lib/analyticsUtils';
import { getCurrentStreak, getHabitStats } from '../../../lib/habitUtils';
import {
  BarChart2,
  Calendar,
  Flame,
  Activity,
  Award,
  TrendingUp,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import EmptyState from './EmptyState';
import InsightsPanel from './InsightsPanel';
import { useFeatureFlags } from '../../../lib/FeatureFlagContext';
import { Lock } from 'lucide-react';

interface AnalyticsViewProps {
  habits: Habit[];
  logs: HabitLog;
  onGoToDashboard?: () => void;
}

export default function AnalyticsView({ habits, logs, onGoToDashboard }: AnalyticsViewProps) {
  const { flags } = useFeatureFlags();
  
  const selectedMonth = new Date().getMonth() + 1;
  const selectedYear = new Date().getFullYear();

  const heatmap = calculateContributionHeatmap(habits, logs, 364); // 52 weeks
  const trend7 = calculateTrend7Days(habits, logs);
  const trend30 = calculateTrend30Days(habits, logs);

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  if (habits.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <EmptyState
          type="analytics"
          title="No analytics data available"
          description="Add your daily habits to view contribution heatmaps, trend lines, and consistency graphs."
          actionLabel="Go to Dashboard"
          onAction={onGoToDashboard}
        />
      </div>
    );
  }

  // Level color mappings for contribution heatmap
  const getLevelColor = (level: number) => {
    switch (level) {
      case 4: return 'bg-emerald-600 border-emerald-700 hover:ring-2 hover:ring-emerald-400';
      case 3: return 'bg-emerald-500 border-emerald-600 hover:ring-2 hover:ring-emerald-300';
      case 2: return 'bg-emerald-300 border-emerald-400 hover:ring-2 hover:ring-emerald-200';
      case 1: return 'bg-emerald-100 border-emerald-200 hover:ring-2 hover:ring-emerald-300';
      case 0:
      default: return 'bg-slate-100 border-slate-200/60 hover:bg-slate-200';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60 mb-2">
            <Activity size={13} />
            Deep Analytics & Trends
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Performance Analytics</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Visualize your long-term consistency, habit trends, and contribution heatmaps.
          </p>
        </div>
      </div>

      {/* Smart Insights Panel */}
      {flags.isPremium ? (
        <InsightsPanel habits={habits} logs={logs} />
      ) : (
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
            <Lock size={24} />
          </div>
          <h3 className="text-lg font-extrabold text-slate-800">Smart Insights Locked</h3>
          <p className="text-sm font-medium text-slate-500 max-w-sm">
            Upgrade to Premium to unlock AI-driven heuristics and personalized habit observations.
          </p>
        </div>
      )}

      {/* 1. GitHub-Style Contribution Heatmap */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar size={18} className="text-emerald-600" />
              Annual Contribution Heatmap
            </h2>
            <p className="text-xs text-slate-500">Activity grid over the last 52 weeks (364 days)</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 self-start sm:self-auto">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-200"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-300 border border-emerald-400"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-600"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-600 border border-emerald-700"></div>
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2 pt-2">
          <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 min-w-max">
            {heatmap.map((cell, idx) => (
              <div
                key={idx}
                title={`${cell.date}: ${cell.count} habits completed`}
                className={`w-3.5 h-3.5 rounded-sm border transition-all cursor-pointer ${getLevelColor(cell.level)}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 2. Trends: 7-Day vs 30-Day */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" />
              7-Day Completion Rate Trend
            </h2>
            <p className="text-xs text-slate-500">Daily habit completion rate (%) over the past week</p>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend7} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis unit="%" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs font-medium shadow-xl">
                          <p className="font-bold text-blue-400">{data.day} ({data.date})</p>
                          <p className="mt-1">{data.completed} / {data.possible} completed ({data.rate}%)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="rate" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 30-Day Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 size={18} className="text-emerald-500" />
              30-Day Performance Line
            </h2>
            <p className="text-xs text-slate-500">Moving 30-day consistency trajectory</p>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend30} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} interval={4} />
                <YAxis unit="%" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs font-medium shadow-xl">
                          <p className="font-bold text-emerald-400">{data.date}</p>
                          <p className="mt-1">Completion: {data.rate}% ({data.completed} habits)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Detailed Habit History & Streak Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award size={18} className="text-purple-500" />
              Habit History & Streak Timeline
            </h2>
            <p className="text-xs text-slate-500">Individual habit metrics and consistency scores</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Habit</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Monthly Goal</th>
                <th className="py-3.5 px-4 text-center">Current Streak</th>
                <th className="py-3.5 px-4 text-center">Longest Streak</th>
                <th className="py-3.5 px-6 text-right">Current Month %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {habits.map(habit => {
                const stats = getHabitStats(habit, logs, daysInMonth, selectedYear, selectedMonth);
                const currentStreak = getCurrentStreak(habit, logs, selectedYear, selectedMonth, daysInMonth);
                const longestStreak = getHabitLongestStreak(habit, logs);

                return (
                  <tr key={habit.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2.5">
                      <span className="text-base">{habit.emoji}</span>
                      <span>{habit.name}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                        {habit.category || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-slate-700">{habit.goal} days</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                        <Flame size={12} />
                        {currentStreak} d
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-extrabold text-slate-800">{longestStreak} days</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-extrabold text-slate-900">{stats.pct}%</span>
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${stats.pct >= 80 ? 'bg-emerald-500' : stats.pct >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                            style={{ width: `${stats.pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { calculatePersonalRecords } from '../../../lib/analyticsUtils';
import { Trophy, Flame, Award, CheckCircle2, Star, ShieldCheck, Sparkles } from 'lucide-react';

interface PersonalRecordsViewProps {
  habits: Habit[];
  logs: HabitLog;
}

export default function PersonalRecordsView({ habits, logs }: PersonalRecordsViewProps) {
  const records = calculatePersonalRecords(habits, logs);

  const cards = [
    {
      id: 'longest-streak',
      title: 'Longest Successful Period',
      value: `${records.longestSuccessfulPeriod} Days`,
      subtitle: 'Consecutive active days across all habits',
      icon: <Flame className="w-6 h-6 text-orange-500" />,
      bgGradient: 'from-orange-500/10 via-amber-500/5 to-transparent',
      borderColor: 'border-orange-200/80',
      badge: 'All-Time Record',
    },
    {
      id: 'highest-week-xp',
      title: 'Highest Weekly XP',
      value: `${records.highestWeeklyXp} XP`,
      subtitle: 'Maximum XP earned in a 7-day period',
      icon: <Award className="w-6 h-6 text-blue-500" />,
      bgGradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
      borderColor: 'border-blue-200/80',
      badge: 'Weekly Milestone',
    },
    {
      id: 'highest-month-xp',
      title: 'Highest Monthly XP',
      value: `${records.highestMonthlyXp} XP`,
      subtitle: 'Maximum XP earned in a 30-day period',
      icon: <Trophy className="w-6 h-6 text-purple-500" />,
      bgGradient: 'from-purple-500/10 via-pink-500/5 to-transparent',
      borderColor: 'border-purple-200/80',
      badge: 'Monthly Best',
    },
    {
      id: 'best-consistency',
      title: 'Best Habit Consistency',
      value: `${records.bestHabitConsistency}%`,
      subtitle: 'Highest historical consistency score for a single habit',
      icon: <Star className="w-6 h-6 text-amber-500" />,
      bgGradient: 'from-amber-500/10 via-yellow-500/5 to-transparent',
      borderColor: 'border-amber-200/80',
      badge: 'Mastery',
    },
    {
      id: 'highest-bloom',
      title: 'Highest Bloom Score',
      value: `${records.highestBloomScore}`,
      subtitle: 'Peak monthly growth tier score',
      icon: <ShieldCheck className="w-6 h-6 text-teal-500" />,
      bgGradient: 'from-teal-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'border-teal-200/80',
      badge: 'Garden Growth',
    },
    {
      id: 'total-completed',
      title: 'Total Habits Completed',
      value: `${records.mostHabitsCompleted}`,
      subtitle: 'Lifetime completed habit checkoffs',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
      bgGradient: 'from-emerald-600/10 via-teal-600/5 to-transparent',
      borderColor: 'border-emerald-300/80',
      badge: 'Lifetime Volume',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200/60 mb-2">
            <Sparkles size={13} />
            SaaS Metric Showcase
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Personal Records</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Your lifetime productivity achievements tracked as high-impact executive statistics.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-md">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Habits</div>
            <div className="text-2xl font-black text-emerald-400">{records.mostHabitsCompleted}</div>
          </div>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(card => (
          <div
            key={card.id}
            className={`bg-white rounded-2xl p-6 border ${card.borderColor} shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group hover:-translate-y-0.5`}
          >
            {/* Background gradient subtle wash */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-60 pointer-events-none`} />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-100">
                  {card.icon}
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100/90 text-slate-600 text-[10px] font-bold tracking-wide uppercase">
                  {card.badge}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{card.title}</h3>
                <div className="text-3xl font-black text-slate-900 mt-1 tracking-tight group-hover:scale-105 transition-transform origin-left">
                  {card.value}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{card.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

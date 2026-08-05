import React from 'react';
import { Award, Flame, Star, Zap, Crown } from 'lucide-react';

interface BadgesViewProps {
  longestStreak: number;
  totalActiveDays: number;
  totalCompleted: number;
}

export default function BadgesView({ longestStreak, totalActiveDays, totalCompleted }: BadgesViewProps) {
  const badges = [
    {
      id: 'streak-7',
      name: '1 Week Streak',
      description: 'Completed a habit for 7 consecutive days',
      icon: <Flame size={24} className="text-orange-500" />,
      earned: longestStreak >= 7,
      color: 'bg-orange-50 border-orange-200'
    },
    {
      id: 'streak-30',
      name: 'Monthly Master',
      description: 'Completed a habit for 30 consecutive days',
      icon: <Crown size={24} className="text-purple-500" />,
      earned: longestStreak >= 30,
      color: 'bg-purple-50 border-purple-200'
    },
    {
      id: 'active-100',
      name: 'Century Club',
      description: 'Logged in and tracked habits for 100 days',
      icon: <Star size={24} className="text-yellow-500" />,
      earned: totalActiveDays >= 100,
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      id: 'total-500',
      name: 'Habit Machine',
      description: 'Checked off 500 total habits',
      icon: <Zap size={24} className="text-blue-500" />,
      earned: totalCompleted >= 500,
      color: 'bg-blue-50 border-blue-200'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 h-full">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Award size={20} className="text-amber-500" />
        <h3 className="text-base font-bold text-slate-900">Your Achievements</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {badges.map(badge => (
          <div 
            key={badge.id}
            className={`p-4 rounded-xl border ${badge.earned ? badge.color : 'bg-slate-50 border-slate-200 opacity-50 grayscale'} flex flex-col items-center text-center gap-2 transition-all`}
          >
            <div className={`p-3 rounded-full bg-white shadow-sm ${badge.earned ? '' : 'text-slate-400'}`}>
              {badge.icon}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{badge.name}</div>
              <div className="text-[10px] text-slate-500 mt-1">{badge.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { makeLogKey } from '../../../lib/habitUtils';
import { generateSmartInsights } from '../../../lib/insightUtils';
import { Check, Zap } from 'lucide-react';
import { NavTab } from './charts/TitleBanner';

interface DailyFocusViewProps {
  habits: Habit[];
  logs: HabitLog;
  year: number;
  month: number;
  day: number;
  onToggleCell: (habitId: string, day: number) => void;
  onNavigateTab: (tab: NavTab) => void;
}

export default function DailyFocusView({
  habits,
  logs,
  year,
  month,
  day,
  onToggleCell,
  onNavigateTab
}: DailyFocusViewProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    setInsights(generateSmartInsights(habits, logs));
  }, [habits, logs]);

  const activeHabits = habits; // For daily focus, we use all habits.
  
  const completedCount = activeHabits.filter(habit => {
    const key = makeLogKey(habit.id, year, month, day);
    return logs[key];
  }).length;
  
  const totalCount = activeHabits.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const remainingCount = totalCount - completedCount;

  // Trigger celebration once when hitting 100%
  useEffect(() => {
    if (progressPercent === 100 && totalCount > 0) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [progressPercent, totalCount]);

  // SVG parameters for progress ring
  const sqSize = 160;
  const strokeWidth = 12;
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * progressPercent) / 100;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header section with Progress Ring */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden">
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] bg-[url('/confetti.svg')] bg-cover opacity-50 animate-pulse"></div>
            <div className="absolute inset-0 bg-emerald-500/10 animate-ping"></div>
          </div>
        )}
        
        <div className="flex-1 space-y-4 text-center md:text-left z-10">
          <h2 className="text-3xl font-black tracking-tight text-slate-800">
            {progressPercent === 100 ? "You're all done! 🎉" : "Today's Focus"}
          </h2>
          <p className="text-slate-500 font-medium">
            {progressPercent === 100 
              ? "Great job completing all your habits today. Take some time to relax!" 
              : `You have ${remainingCount} ${remainingCount === 1 ? 'habit' : 'habits'} left to complete today.`}
          </p>
          
          {insights.length > 0 && (
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-indigo-100">
              <Zap size={16} className="text-indigo-500" />
              <span>{insights[0]}</span>
            </div>
          )}
        </div>

        <div className="relative flex-shrink-0 z-10">
          <svg width={sqSize} height={sqSize} viewBox={viewBox} className="transform -rotate-90">
            <circle
              className="text-slate-100"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="none"
              cx={sqSize / 2}
              cy={sqSize / 2}
              r={radius}
            />
            <circle
              className="text-emerald-500 transition-all duration-1000 ease-out"
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              cx={sqSize / 2}
              cy={sqSize / 2}
              r={radius}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-800">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-4">
        {activeHabits.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 border-dashed">
            <p className="text-slate-500 font-medium mb-4">You don&apos;t have any habits yet.</p>
            <button 
              onClick={() => onNavigateTab('dashboard')}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            >
              Add a Habit
            </button>
          </div>
        ) : (
          activeHabits.map((habit) => {
            const key = makeLogKey(habit.id, year, month, day);
            const isCompleted = logs[key];
            
            return (
              <div 
                key={habit.id}
                className={`group flex items-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isCompleted 
                    ? 'bg-slate-50 border-slate-200 opacity-60' 
                    : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200'
                }`}
                onClick={() => onToggleCell(habit.id, day)}
              >
                <div className="w-12 h-12 flex items-center justify-center text-2xl rounded-xl bg-slate-100 mr-4 group-hover:scale-110 transition-transform">
                  {habit.emoji}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                    {habit.name}
                  </h3>
                  {habit.category && (
                    <span className="text-xs font-medium text-slate-400">{habit.category}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  {isCompleted && (
                    <button 
                      className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1 rounded-lg hover:bg-slate-200 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open Journal modal logic here later
                        console.log('Open journal for', habit.id);
                      }}
                    >
                      Add Note
                    </button>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white scale-100' 
                      : 'bg-slate-100 text-slate-300 group-hover:bg-emerald-100 group-hover:text-emerald-500 scale-95 group-hover:scale-100'
                  }`}>
                    <Check strokeWidth={isCompleted ? 3 : 2} size={20} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { getWeeklyStats } from '../../../lib/habitUtils';

interface WeeklyProgressProps {
  habits: Habit[];
  logs: HabitLog;
  year: number;
  month: number;
  daysInMonth: number;
}

export default function WeeklyProgress({ habits, logs, year, month, daysInMonth }: WeeklyProgressProps) {
  const weeks = getWeeklyStats(habits, logs, year, month, daysInMonth);
  return (
    <div className="bg-card rounded-xl card-shadow border border-border p-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">Weekly Progress</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Average habit completion by week</p>
      </div>
      <div className="flex flex-col gap-3">
        {weeks.map((week, i) => {
          const barColor = week.pct >= 80 ? 'bg-primary' : week.pct >= 50 ? 'bg-yellow-400' : week.pct > 0 ? 'bg-red-400' : 'bg-muted';
          const textColor = week.pct >= 80 ? 'text-primary' : week.pct >= 50 ? 'text-yellow-600' : week.pct > 0 ? 'text-red-500' : 'text-muted-foreground';
          return (
            <div key={`week-${i + 1}`} className="flex items-center gap-3">
              <div className="w-16 flex-shrink-0">
                <span className="text-xs font-600 text-muted-foreground">Week {i + 1}</span>
                <div className="text-xs text-muted-foreground/70">{week.label}</div>
              </div>
              <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden relative">
                <div className={`h-6 rounded-full progress-bar-fill ${barColor} flex items-center`} style={{ width: `${week.pct}%`, minWidth: week.pct > 0 ? '2rem' : '0' }} />
                {week.pct === 0 && (
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-xs text-muted-foreground">No data</span>
                  </div>
                )}
              </div>
              <div className="w-12 text-right flex-shrink-0">
                <span className={`text-sm font-700 tabular-nums ${textColor}`}>{week.pct}%</span>
              </div>
              <div className="w-20 text-right flex-shrink-0">
                <span className="text-xs text-muted-foreground tabular-nums">{week.done}/{week.possible}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
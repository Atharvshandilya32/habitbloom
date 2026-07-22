'use client';

import React from 'react';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { getHabitStats } from '../../../lib/habitUtils';

interface HabitSummaryTableProps {
  habits: Habit[];
  logs: HabitLog;
  daysInMonth: number;
  year: number;
  month: number;
}

export default function HabitSummaryTable({ habits, logs, daysInMonth, year, month }: HabitSummaryTableProps) {
  if (habits.length === 0) return null;
  return (
    <div className="bg-card rounded-xl card-shadow border border-border">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">Habit Summary</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Monthly completion overview per habit</p>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="bg-muted/60">
              <th className="text-left px-4 py-2.5 text-xs font-600 text-muted-foreground uppercase tracking-wide">Habit</th>
              <th className="text-center px-4 py-2.5 text-xs font-600 text-muted-foreground uppercase tracking-wide">Done</th>
              <th className="text-center px-4 py-2.5 text-xs font-600 text-muted-foreground uppercase tracking-wide">Goal</th>
              <th className="text-center px-4 py-2.5 text-xs font-600 text-muted-foreground uppercase tracking-wide">% Complete</th>
              <th className="px-4 py-2.5 text-xs font-600 text-muted-foreground uppercase tracking-wide">Progress</th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, idx) => {
              const { done, goal, pct } = getHabitStats(habit, logs, daysInMonth, year, month);
              const rowBg = idx % 2 === 0 ? 'bg-background' : 'bg-muted/30';
              const barColor = pct >= 80 ? 'bg-primary' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400';
              return (
                <tr key={habit.id} className={`${rowBg} hover:bg-accent/20 transition-colors duration-100`}>
                  <td className="px-4 py-2.5 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{habit.emoji}</span>
                      <span className="text-sm font-500 text-foreground">{habit.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 border-b border-border text-center">
                    <span className="text-sm font-700 text-primary tabular-nums">{done}</span>
                  </td>
                  <td className="px-4 py-2.5 border-b border-border text-center">
                    <span className="text-sm font-500 text-muted-foreground tabular-nums">{goal}</span>
                  </td>
                  <td className="px-4 py-2.5 border-b border-border text-center">
                    <span className={`text-sm font-700 tabular-nums ${pct >= 80 ? 'text-primary' : pct >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>{pct}%</span>
                  </td>
                  <td className="px-4 py-2.5 border-b border-border min-w-32">
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div className={`h-2 rounded-full progress-bar-fill ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
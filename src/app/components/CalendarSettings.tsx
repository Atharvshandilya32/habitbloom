'use client';

import React from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

interface CalendarSettingsProps {
  year: number;
  month: number;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
}

export default function CalendarSettings({ year, month, onYearChange, onMonthChange }: CalendarSettingsProps) {
  return (
    <div className="bg-accent rounded-xl card-shadow p-4 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 text-foreground font-semibold">
        <CalendarDays size={18} className="text-primary" />
        <span className="text-sm uppercase tracking-wide">Calendar Settings</span>
      </div>
      <div className="flex items-center gap-2 ml-auto flex-wrap">
        <div className="flex flex-col gap-0.5">
          <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Year</label>
          <input
            type="number"
            value={year}
            min={2020}
            max={2035}
            onChange={e => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 2020 && v <= 2035) onYearChange(v);
            }}
            className="input-focus border border-border rounded-md px-3 py-1.5 text-sm font-semibold w-24 bg-background text-foreground"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Month</label>
          <div className="relative">
            <select
              value={month}
              onChange={e => onMonthChange(parseInt(e.target.value, 10))}
              className="input-focus appearance-none border border-border rounded-md pl-3 pr-8 py-1.5 text-sm font-semibold bg-background text-foreground cursor-pointer"
            >
              {MONTHS.map((m, i) => (
                <option key={`month-${i + 1}`} value={i + 1}>{m}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wide opacity-0">View</label>
          <div className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-semibold">
            {MONTHS[month - 1]} {year}
          </div>
        </div>
      </div>
    </div>
  );
}

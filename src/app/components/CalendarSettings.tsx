'use client';

import React, { useState } from 'react';
import { CalendarDays, ChevronDown, RotateCcw, AlertTriangle } from 'lucide-react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

interface CalendarSettingsProps {
  year: number;
  month: number;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
  onResetMonth: () => void;
}

export default function CalendarSettings({ year, month, onYearChange, onMonthChange, onResetMonth }: CalendarSettingsProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    setShowConfirm(false);
    onResetMonth();
  };

  return (
    <div className="bg-accent rounded-xl card-shadow p-4 flex flex-wrap items-end gap-4">
      {/* Label */}
      <div className="flex items-center gap-2 text-foreground font-semibold self-center">
        <CalendarDays size={18} className="text-primary" />
        <span className="text-sm uppercase tracking-wide">Calendar Settings</span>
      </div>

      <div className="flex items-end gap-2 ml-auto flex-wrap">
        {/* Year */}
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

        {/* Month */}
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

        {/* Current month badge */}
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wide opacity-0">View</label>
          <div className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-semibold">
            {MONTHS[month - 1]} {year}
          </div>
        </div>

        {/* Reset Month button */}
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wide opacity-0">Reset</label>
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              title={`Reset all ticks for ${MONTHS[month - 1]} ${year}`}
            >
              <RotateCcw size={13} />
              Reset Month
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-md px-2 py-1">
              <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />
              <span className="text-xs text-red-700 font-medium">Clear {MONTHS[month - 1]}?</span>
              <button
                onClick={handleReset}
                className="text-xs font-bold text-red-600 hover:text-red-800 underline transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

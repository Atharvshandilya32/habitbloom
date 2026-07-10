'use client';

import React from 'react';

interface OverallDonutChartProps {
  done: number;
  possible: number;
  pct: number;
}

export default function OverallDonutChart({ done, possible, pct }: OverallDonutChartProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="h-full w-full flex items-center justify-center">
      <svg viewBox="0 0 120 120" className="h-40 w-40">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="14"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth="14"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="pointer-events-none absolute text-center">
        <div className="text-2xl font-semibold text-foreground">{pct}%</div>
        <div className="text-xs text-muted-foreground">{done}/{possible}</div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';

interface MonthlyBarChartProps {
  data: { month: string; pct: number; isCurrent: boolean }[];
}

export default function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  return (
    <div className="space-y-2">
      {data.map(item => (
        <div key={item.month} className="flex items-center gap-3">
          <span className="w-10 text-xs text-muted-foreground">{item.month}</span>
          <div className="flex-1 rounded-full bg-muted h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full ${item.isCurrent ? 'bg-primary' : 'bg-secondary'}`}
              style={{ width: `${item.pct}%` }}
            />
          </div>
          <span className="w-10 text-right text-xs font-semibold text-foreground">{item.pct}%</span>
        </div>
      ))}
    </div>
  );
}

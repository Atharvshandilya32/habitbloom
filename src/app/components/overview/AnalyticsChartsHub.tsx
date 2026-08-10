import React from 'react';
import dynamic from 'next/dynamic';
import { BarChart2 } from 'lucide-react';

const MonthlyBarChart = dynamic(() => import('../charts/MonthlyBarChart'), { ssr: false });
const OverallDonutChart = dynamic(() => import('../charts/OverallDonutChart'), { ssr: false });

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

interface AnalyticsChartsHubProps {
  year: number;
  month: number;
  totalDone: number;
  totalPossible: number;
  overallPct: number;
  chartData: { month: string; pct: number; isCurrent: boolean }[];
}

export default function AnalyticsChartsHub({
  year,
  month,
  totalDone,
  totalPossible,
  overallPct,
  chartData,
}: AnalyticsChartsHubProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Monthly Progress Chart */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly Completion Trend ({year})</h3>
            <p className="text-xs text-slate-500">Overall completion % across all 12 months</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-200/60">
            <BarChart2 className="h-4 w-4" />
          </div>
        </div>
        <div className="h-52">
          <MonthlyBarChart data={chartData} />
        </div>
      </div>

      {/* Overall Progress Donut */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Overall Monthly Fulfillment</h3>
            <p className="text-xs text-slate-500">
              {MONTH_NAMES[month - 1]} {year} — {totalDone} of {totalPossible} total
            </p>
          </div>
        </div>
        <div className="h-44 relative">
          <OverallDonutChart done={totalDone} possible={totalPossible} pct={overallPct} />
        </div>
        <div className="flex items-center justify-center gap-6 mt-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-600" />
            <span className="font-semibold text-slate-700">Completed ({totalDone})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-200" />
            <span className="font-semibold text-slate-500">Remaining ({totalPossible - totalDone})</span>
          </div>
        </div>
      </div>
    </div>
  );
}

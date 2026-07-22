'use client';

import React, { useState } from 'react';
import { MonthlyHistory } from '../../../../lib/habitUtils';

interface SixMonthChartProps {
  data: MonthlyHistory[];
}

export default function SixMonthChart({ data }: SixMonthChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const W = 560;
  const H = 180;
  const PAD = { top: 20, right: 20, bottom: 36, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const n = data.length; // always 6

  // X positions for each data point
  const xPos = (i: number) => PAD.left + (i / (n - 1)) * chartW;
  // Y position (0% at bottom, 100% at top)
  const yPos = (pct: number) => PAD.top + chartH - (pct / 100) * chartH;

  // Build polyline points string
  const points = data.map((d, i) => `${xPos(i)},${yPos(d.pct)}`).join(' ');

  // Build closed area path
  const areaPath = [
    `M ${xPos(0)},${yPos(data[0].pct)}`,
    ...data.slice(1).map((d, i) => `L ${xPos(i + 1)},${yPos(d.pct)}`),
    `L ${xPos(n - 1)},${PAD.top + chartH}`,
    `L ${xPos(0)},${PAD.top + chartH}`,
    'Z',
  ].join(' ');

  // Y-axis grid lines at 0, 25, 50, 75, 100
  const gridLines = [0, 25, 50, 75, 100];

  const hasEnoughData = data.filter(d => d.hasData).length >= 1;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto overflow-visible"
        style={{ maxHeight: '200px' }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map(g => (
          <g key={g}>
            <line
              x1={PAD.left}
              y1={yPos(g)}
              x2={PAD.left + chartW}
              y2={yPos(g)}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={g === 0 ? '0' : '4,3'}
            />
            <text
              x={PAD.left - 6}
              y={yPos(g) + 4}
              textAnchor="end"
              fontSize="9"
              fill="#94a3b8"
            >
              {g}%
            </text>
          </g>
        ))}

        {/* Area fill */}
        {hasEnoughData && (
          <path d={areaPath} fill="url(#areaGrad)" />
        )}

        {/* Line */}
        {hasEnoughData && (
          <polyline
            points={points}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points + labels */}
        {data.map((d, i) => {
          const cx = xPos(i);
          const cy = yPos(d.pct);
          const isHovered = hoveredIndex === i;

          return (
            <g key={d.label}>
              {/* Month label */}
              <text
                x={cx}
                y={H - 4}
                textAnchor="middle"
                fontSize="9"
                fill="#64748b"
              >
                {d.label}
              </text>

              {/* Dot */}
              {d.hasData && (
                <>
                  {/* Halo on hover */}
                  {isHovered && (
                    <circle cx={cx} cy={cy} r={10} fill="#10b981" fillOpacity="0.15" />
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 5 : 4}
                    fill={isHovered ? '#059669' : '#10b981'}
                    stroke="white"
                    strokeWidth="2"
                    style={{ cursor: 'pointer', transition: 'r 0.15s' }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />

                  {/* Tooltip */}
                  {isHovered && (
                    <g>
                      <rect
                        x={cx - 26}
                        y={cy - 28}
                        width={52}
                        height={20}
                        rx={5}
                        fill="#1e293b"
                        fillOpacity="0.9"
                      />
                      <text
                        x={cx}
                        y={cy - 14}
                        textAnchor="middle"
                        fontSize="10"
                        fill="white"
                        fontWeight="bold"
                      >
                        {d.pct}%
                      </text>
                    </g>
                  )}
                </>
              )}

              {/* Empty month indicator */}
              {!d.hasData && (
                <circle
                  cx={cx}
                  cy={yPos(0)}
                  r={3}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-emerald-500 rounded-full" />
          <span className="text-[10px] text-muted-foreground">Completion %</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border border-dashed border-slate-300" />
          <span className="text-[10px] text-muted-foreground">No data</span>
        </div>
      </div>
    </div>
  );
}

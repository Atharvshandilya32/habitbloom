import { Habit, HabitLog } from './habitTypes';
import { getHabitStats } from './habitUtils';

export type ProjectionTimeframe = '30d' | '90d' | '1y' | '3y';

export interface HabitProjection {
  habitId: string;
  habitName: string;
  emoji: string;
  category: string;
  currentConsistencyPct: number;
  projectedCompletions: number;
  estimatedTargetDate?: string;
  milestoneTitle: string;
  growthDeltaPct: number;
  dailyVelocityRate: number; // Decimal (0.0 to 1.0)
}

export interface FutureProjectionData {
  timeframe: ProjectionTimeframe;
  daysHorizon: number;
  overallProjectedCompletions: number;
  projectedBloomScoreGain: number;
  habitProjections: HabitProjection[];
  topMilestoneHighlight: string;
  consistencyBoostScenario: {
    boostPct: number;
    boostedCompletions: number;
    extraBloomScore: number;
  };
  elapsedDaysUsed: number;
}

export function calculateFutureProjections(
  habits: Habit[],
  logs: HabitLog,
  timeframe: ProjectionTimeframe = '90d',
  currentBloomScore: number = 0,
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1,
  customBoostPct: number = 15
): FutureProjectionData {
  const horizonDaysMap: Record<ProjectionTimeframe, number> = {
    '30d': 30,
    '90d': 90,
    '1y': 365,
    '3y': 1095,
  };

  const daysHorizon = horizonDaysMap[timeframe];
  const daysInMonth = new Date(year, month, 0).getDate();
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;

  // Determine elapsed days in month to calculate accurate non-diluted daily velocity
  const elapsedDays = isCurrentMonth
    ? Math.max(1, Math.min(now.getDate(), daysInMonth))
    : daysInMonth;

  if (!habits || habits.length === 0) {
    return {
      timeframe,
      daysHorizon,
      overallProjectedCompletions: 0,
      projectedBloomScoreGain: 0,
      habitProjections: [],
      topMilestoneHighlight: 'Add habits to unlock your future trajectory projections',
      consistencyBoostScenario: {
        boostPct: customBoostPct,
        boostedCompletions: 0,
        extraBloomScore: 0,
      },
      elapsedDaysUsed: elapsedDays,
    };
  }

  // Previous month parameters for recency blending
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevDaysInMonth = new Date(prevYear, prevMonth, 0).getDate();

  let totalProjected = 0;

  const habitProjections: HabitProjection[] = habits.map((habit) => {
    // Current month completions up to elapsed days
    let currentDone = 0;
    for (let day = 1; day <= elapsedDays; day++) {
      const key = `${habit.id}_${year}_${month}_${day}`;
      if (logs[key]) currentDone += 1;
    }
    const currentVelocity = currentDone / Math.max(1, elapsedDays);

    // Prior month completions for recency weighting
    let prevDone = 0;
    for (let day = 1; day <= prevDaysInMonth; day++) {
      const key = `${habit.id}_${prevYear}_${prevMonth}_${day}`;
      if (logs[key]) prevDone += 1;
    }
    const prevVelocity = prevDone / Math.max(1, prevDaysInMonth);

    // Blend: 70% current month velocity + 30% prior month velocity (if prior month has logs)
    const hasPrevLogs = prevDone > 0;
    const blendedVelocity = hasPrevLogs
      ? currentVelocity * 0.7 + prevVelocity * 0.3
      : currentVelocity;

    const dailyVelocity = Math.max(0.05, Math.min(1.0, blendedVelocity));
    const projectedCompletions = Math.round(dailyVelocity * daysHorizon);

    totalProjected += projectedCompletions;

    const stats = getHabitStats(habit, logs, daysInMonth, year, month);

    let milestoneTitle = `${projectedCompletions} sessions completed`;
    if (projectedCompletions >= 500) {
      milestoneTitle = `🏆 Legend Master (${projectedCompletions} sessions)`;
    } else if (projectedCompletions >= 100) {
      milestoneTitle = `🥇 Gold Century (${projectedCompletions} sessions)`;
    } else if (projectedCompletions >= 30) {
      milestoneTitle = `🥈 Silver Momentum (${projectedCompletions} sessions)`;
    }

    return {
      habitId: habit.id,
      habitName: habit.name,
      emoji: habit.emoji,
      category: (habit.category as string) || 'General',
      currentConsistencyPct: stats.pct,
      projectedCompletions,
      milestoneTitle,
      growthDeltaPct: Math.round(dailyVelocity * 100),
      dailyVelocityRate: Math.round(dailyVelocity * 100) / 100,
    };
  });

  // Projected Bloom Score Gain calculation (approx 0.45 pts per forecasted check-in up to score cap)
  const maxPossibleGain = Math.max(0, 1000 - currentBloomScore);
  const projectedBloomScoreGain = Math.min(maxPossibleGain, Math.round(totalProjected * 0.45));

  // Dynamic Boost Scenario Calculation
  const multiplier = 1 + (customBoostPct / 100);
  const boostedCompletions = Math.round(totalProjected * multiplier);
  const extraBloomScore = Math.min(
    maxPossibleGain - projectedBloomScoreGain,
    Math.round(projectedBloomScoreGain * (customBoostPct / 100) * 1.2)
  );

  const topHabit = [...habitProjections].sort((a, b) => b.projectedCompletions - a.projectedCompletions)[0];
  const topMilestoneHighlight = topHabit && topHabit.projectedCompletions > 0
    ? `At current velocity, ${topHabit.emoji} ${topHabit.habitName} will reach ${topHabit.projectedCompletions} check-ins in ${daysHorizon} days!`
    : 'Maintain daily consistency to unlock high-horizon milestone targets.';

  return {
    timeframe,
    daysHorizon,
    overallProjectedCompletions: totalProjected,
    projectedBloomScoreGain,
    habitProjections,
    topMilestoneHighlight,
    consistencyBoostScenario: {
      boostPct: customBoostPct,
      boostedCompletions,
      extraBloomScore,
    },
    elapsedDaysUsed: elapsedDays,
  };
}

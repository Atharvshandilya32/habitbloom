import { Habit, HabitLog } from './habitTypes';
import { getCurrentStreak } from './habitUtils';
import { calculateHabitDna } from './habitDnaUtils';

export interface BloomScoreTier {
  name: string;
  emoji: string;
  minScore: number;
  maxScore: number;
  color: string;
  gradient: string;
  badgeBg: string;
  perks: string[];
}

export interface BloomScoreBreakdown {
  consistencyScore: number;   // 0 - 400
  streakScore: number;        // 0 - 200
  diversityScore: number;     // 0 - 200
  xpBonusScore: number;       // 0 - 200
  totalBloomScore: number;    // 0 - 1000
  tier: BloomScoreTier;
  nextTier: BloomScoreTier | null;
  progressToNextTier: number; // 0 - 100%
  pointsToNextTier: number;   // Points remaining until next tier
  elapsedDaysUsed: number;
}

export const BLOOM_TIERS: BloomScoreTier[] = [
  {
    name: 'Seedling',
    emoji: '🌱',
    minScore: 0,
    maxScore: 249,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-600',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    perks: ['Basic Habit Tracking', 'Daily Focus Dashboard', 'Standard Reminders'],
  },
  {
    name: 'Sprout',
    emoji: '🌿',
    minScore: 250,
    maxScore: 499,
    color: 'text-teal-400',
    gradient: 'from-teal-500 to-cyan-600',
    badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    perks: ['Habit DNA Analytics', 'Streak Protection Shield', 'Custom Habit Colors'],
  },
  {
    name: 'Blossom',
    emoji: '🌸',
    minScore: 500,
    maxScore: 749,
    color: 'text-pink-400',
    gradient: 'from-pink-500 to-rose-600',
    badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    perks: ['Future Trajectory Projections', 'Advanced Social Hub Badges', 'Weekly Reflection Insights'],
  },
  {
    name: 'Full Bloom',
    emoji: '🌺',
    minScore: 750,
    maxScore: 899,
    color: 'text-amber-400',
    gradient: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    perks: ['Mastery Retrospective Cards', 'Shared Space Leadership Role', 'Priority Notifications'],
  },
  {
    name: 'Master Gardener',
    emoji: '👑',
    minScore: 900,
    maxScore: 1000,
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-indigo-600',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    perks: ['Legendary Profile Crown', 'Unlimited Custom Spaces', 'Golden Retrospective Badge'],
  },
];

export function calculateBloomScore(
  habits: Habit[],
  logs: HabitLog,
  xp: number = 0,
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1
): BloomScoreBreakdown {
  const defaultTier = BLOOM_TIERS[0];

  if (!habits || habits.length === 0) {
    return {
      consistencyScore: 0,
      streakScore: 0,
      diversityScore: 0,
      xpBonusScore: 0,
      totalBloomScore: 0,
      tier: defaultTier,
      nextTier: BLOOM_TIERS[1],
      progressToNextTier: 0,
      pointsToNextTier: BLOOM_TIERS[1].minScore,
      elapsedDaysUsed: 1,
    };
  }

  const now = new Date();
  const daysInMonth = new Date(year, month, 0).getDate();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  
  // Elapsed days calculation: avoid artificial early-month score dilution
  const elapsedDays = isCurrentMonth
    ? Math.max(1, Math.min(now.getDate(), daysInMonth))
    : daysInMonth;

  // 1. Consistency Score (0 - 400 pts) based on elapsed days to date
  let totalCompletions = 0;
  habits.forEach((habit) => {
    for (let day = 1; day <= elapsedDays; day++) {
      const logKey = `${habit.id}_${year}_${month}_${day}`;
      if (logs[logKey]) totalCompletions += 1;
    }
  });

  const possibleCompletionsToDate = habits.length * elapsedDays;
  const elapsedConsistencyPct = Math.min(100, Math.round((totalCompletions / (possibleCompletionsToDate || 1)) * 100));
  const consistencyScore = Math.round((elapsedConsistencyPct / 100) * 400);

  // 2. Streak Score (0 - 200 pts) with logarithmic diminishing returns
  const streaks = habits.map((h) => getCurrentStreak(h, logs, year, month, daysInMonth));
  const maxStreak = streaks.length > 0 ? Math.max(...streaks) : 0;
  const avgStreak = streaks.length > 0 ? streaks.reduce((a, b) => a + b, 0) / streaks.length : 0;
  
  // Logarithmic streak scaling curve prevents abrupt clipping while rewarding early milestone building
  const maxStreakBonus = Math.log2(maxStreak + 1) * 32;
  const avgStreakBonus = Math.sqrt(avgStreak) * 20;
  const streakScore = Math.min(200, Math.round(maxStreakBonus + avgStreakBonus));

  // 3. Diversity Score (0 - 200 pts)
  const dna = calculateHabitDna(habits, logs, year, month);
  const diversityScore = Math.round((dna.diversityScore / 100) * 200);

  // 4. XP Bonus Score (0 - 200 pts) with fallback to total log check-ins if XP not passed
  let effectiveXp = xp;
  if (effectiveXp === 0 && logs) {
    // Count total logged check-ins as fallback XP (15 XP per check-in)
    const logKeysCount = Object.keys(logs).filter((k) => logs[k] === true).length;
    effectiveXp = logKeysCount * 15;
  }
  const xpBonusScore = Math.min(200, Math.round(Math.sqrt(Math.max(0, effectiveXp)) * 3));

  // Total Bloom Score
  const totalBloomScore = Math.min(1000, consistencyScore + streakScore + diversityScore + xpBonusScore);

  // Determine current & next tier
  let currentTier = BLOOM_TIERS[0];
  let nextTier: BloomScoreTier | null = BLOOM_TIERS[1];

  for (let i = 0; i < BLOOM_TIERS.length; i++) {
    if (totalBloomScore >= BLOOM_TIERS[i].minScore) {
      currentTier = BLOOM_TIERS[i];
      nextTier = i < BLOOM_TIERS.length - 1 ? BLOOM_TIERS[i + 1] : null;
    }
  }

  let progressToNextTier = 100;
  let pointsToNextTier = 0;

  if (nextTier) {
    const range = nextTier.minScore - currentTier.minScore;
    const progress = totalBloomScore - currentTier.minScore;
    progressToNextTier = Math.min(100, Math.max(0, Math.round((progress / (range || 1)) * 100)));
    pointsToNextTier = Math.max(0, nextTier.minScore - totalBloomScore);
  }

  return {
    consistencyScore,
    streakScore,
    diversityScore,
    xpBonusScore,
    totalBloomScore,
    tier: currentTier,
    nextTier,
    progressToNextTier,
    pointsToNextTier,
    elapsedDaysUsed: elapsedDays,
  };
}

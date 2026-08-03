import { Habit, HabitLog, HABIT_CATEGORIES } from './habitTypes';

export interface PersonaProfile {
  title: string;
  emoji: string;
  tagline: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface CategoryBalance {
  category: string;
  emoji: string;
  label: string;
  color: string;
  habitCount: number;
  completionRate: number;
  percentageShare: number;
}

export interface DnaRecommendation {
  title: string;
  subtitle: string;
  emoji: string;
  categoryTag: string;
}

export interface HabitDnaData {
  persona: PersonaProfile;
  overallConsistency: number;
  totalCompletions: number;
  activeHabitsCount: number;
  bestCategory: CategoryBalance | null;
  categoryBalances: CategoryBalance[];
  peakDays: { dayName: string; count: number; velocityPct: number }[];
  strengths: string[];
  growthAreas: string[];
  dnaRecommendations: DnaRecommendation[];
  diversityScore: number;
  elapsedDaysUsed: number;
}

const PERSONAS: Record<string, PersonaProfile> = {
  TITAN: {
    title: 'Consistency Titan',
    emoji: '⚡',
    tagline: 'Unshakable Daily Execution',
    description: 'You display bulletproof discipline across your habits. Consistency is your superpower.',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  EXPLORER: {
    title: 'Balanced Explorer',
    emoji: '🧭',
    tagline: 'Holistic Growth Across All Domains',
    description: 'You maintain a beautifully diversified habit portfolio across fitness, learning, and wellness.',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
  },
  SPECIALIST: {
    title: 'Laser Specialist',
    emoji: '🎯',
    tagline: 'Mastering Target Domains',
    description: 'You channel your momentum intensely into core focal areas to achieve mastery.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  WEEKEND_WARRIOR: {
    title: 'Weekend Warrior',
    emoji: '🔥',
    tagline: 'High Weekend Velocity',
    description: 'Your energy surges during weekends and free time to catch up on critical goals.',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
  },
  RISING_BLOOM: {
    title: 'Rising Bloom',
    emoji: '🌱',
    tagline: 'Building Baseline Momentum',
    description: 'You are laying down the foundation for sustainable habits and daily momentum.',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
  },
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function calculateHabitDna(
  habits: Habit[],
  logs: HabitLog,
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1
): HabitDnaData {
  if (!habits || habits.length === 0) {
    return {
      persona: PERSONAS.RISING_BLOOM,
      overallConsistency: 0,
      totalCompletions: 0,
      activeHabitsCount: 0,
      bestCategory: null,
      categoryBalances: [],
      peakDays: DAY_NAMES.map((name) => ({ dayName: name, count: 0, velocityPct: 0 })),
      strengths: ['Started your HabitBloom journey'],
      growthAreas: ['Add your first habit to generate DNA insights'],
      dnaRecommendations: [
        {
          title: 'Add Your First Habit',
          subtitle: 'Create a simple habit (e.g. Drink Water or Morning Walk) to start building momentum.',
          emoji: '🌱',
          categoryTag: 'Getting Started',
        },
      ],
      diversityScore: 0,
      elapsedDaysUsed: 1,
    };
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  
  // Elapsed days calculation to prevent artificial early-month dilution
  const elapsedDays = isCurrentMonth
    ? Math.max(1, Math.min(now.getDate(), daysInMonth))
    : daysInMonth;

  // Compute exact occurrence count for each day of week (0..6) in the elapsed window
  const dayOfWeekOccurrences = [0, 0, 0, 0, 0, 0, 0];
  for (let day = 1; day <= elapsedDays; day++) {
    const dateObj = new Date(year, month - 1, day);
    dayOfWeekOccurrences[dateObj.getDay()] += 1;
  }

  let totalCompletions = 0;
  const possibleCompletionsToDate = habits.length * elapsedDays;

  // Track category metrics
  const categoryStats: Record<string, { done: number; possibleToDate: number; habitCount: number }> = {};
  HABIT_CATEGORIES.forEach((cat) => {
    categoryStats[cat.id] = { done: 0, possibleToDate: 0, habitCount: 0 };
  });

  // Track completion counts per day of week (0-6)
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0];

  habits.forEach((habit) => {
    const categoryKey = habit.category && categoryStats[habit.category] ? habit.category : HABIT_CATEGORIES[0].id;
    categoryStats[categoryKey].habitCount += 1;
    categoryStats[categoryKey].possibleToDate += elapsedDays;

    for (let day = 1; day <= elapsedDays; day++) {
      const logKey = `${habit.id}_${year}_${month}_${day}`;
      if (logs[logKey]) {
        totalCompletions += 1;
        categoryStats[categoryKey].done += 1;

        const dateObj = new Date(year, month - 1, day);
        dayOfWeekCounts[dateObj.getDay()] += 1;
      }
    }
  });

  const overallConsistency = Math.min(100, Math.round((totalCompletions / (possibleCompletionsToDate || 1)) * 100));

  // Format category balance array
  const categoryBalances: CategoryBalance[] = HABIT_CATEGORIES.map((cat) => {
    const stat = categoryStats[cat.id] || { done: 0, possibleToDate: elapsedDays, habitCount: 0 };
    const rate = stat.possibleToDate > 0 ? Math.round((stat.done / stat.possibleToDate) * 100) : 0;
    const percentageShare = totalCompletions > 0 ? Math.round((stat.done / totalCompletions) * 100) : 0;
    return {
      category: cat.id,
      emoji: cat.emoji,
      label: cat.label,
      color: cat.color,
      habitCount: stat.habitCount,
      completionRate: rate,
      percentageShare,
    };
  }).filter((c) => c.habitCount > 0 || c.completionRate > 0);

  // Sort categories by completion rate
  categoryBalances.sort((a, b) => b.completionRate - a.completionRate);
  const bestCategory = categoryBalances.length > 0 ? categoryBalances[0] : null;

  // Diversity score: number of active categories with >20% consistency
  const activeCategoriesCount = categoryBalances.filter((c) => c.completionRate > 20).length;
  const diversityScore = Math.min(100, Math.round((activeCategoriesCount / 5) * 100));

  // Peak completion days normalized by day occurrence frequency
  const peakDays = dayOfWeekCounts
    .map((count, index) => {
      const occurrences = Math.max(1, dayOfWeekOccurrences[index]);
      const possibleOnThisDay = habits.length * occurrences;
      const velocityPct = Math.min(100, Math.round((count / (possibleOnThisDay || 1)) * 100));
      return {
        dayName: DAY_NAMES[index],
        count,
        velocityPct,
      };
    })
    .sort((a, b) => b.velocityPct - a.velocityPct);

  const weekendCompletions = dayOfWeekCounts[0] + dayOfWeekCounts[6];
  const weekendOccurrences = Math.max(1, dayOfWeekOccurrences[0] + dayOfWeekOccurrences[6]);
  const weekdayCompletions = totalCompletions - weekendCompletions;
  const weekdayOccurrences = Math.max(1, elapsedDays - weekendOccurrences);

  const weekendRate = weekendCompletions / (habits.length * weekendOccurrences || 1);
  const weekdayRate = weekdayCompletions / (habits.length * weekdayOccurrences || 1);
  const isWeekendDominant = weekendRate > weekdayRate * 1.2 && weekendCompletions > 2;

  // Determine Persona
  let persona = PERSONAS.RISING_BLOOM;
  if (overallConsistency >= 75) {
    persona = PERSONAS.TITAN;
  } else if (diversityScore >= 60) {
    persona = PERSONAS.EXPLORER;
  } else if (isWeekendDominant) {
    persona = PERSONAS.WEEKEND_WARRIOR;
  } else if (habits.length > 0 && overallConsistency >= 45) {
    persona = PERSONAS.SPECIALIST;
  }

  // Dynamic Strengths & Growth Areas
  const strengths: string[] = [];
  const growthAreas: string[] = [];

  if (overallConsistency >= 70) {
    strengths.push('High overall execution consistency (>70%)');
  } else {
    growthAreas.push('Aim to boost monthly habit check-in consistency above 60%');
  }

  if (bestCategory) {
    strengths.push(`Strong focus in ${bestCategory.emoji} ${bestCategory.label} (${bestCategory.completionRate}%)`);
  }

  if (diversityScore >= 50) {
    strengths.push('Well-balanced habit categories');
  } else if (categoryBalances.length === 1) {
    growthAreas.push('Diversify into mental wellness or fitness categories for holistic growth');
  }

  if (peakDays.length > 0 && peakDays[0].velocityPct > 0) {
    strengths.push(`Peak productivity day: ${peakDays[0].dayName} (${peakDays[0].velocityPct}% completion)`);
  }

  // Generate DNA Tailored Recommendations
  const dnaRecommendations: DnaRecommendation[] = [];

  if (diversityScore < 40) {
    dnaRecommendations.push({
      title: 'Expand Category Portfolio',
      subtitle: 'Add a habit from Wellness or Mindfulness to balance your growth DNA.',
      emoji: '🧘',
      categoryTag: 'Diversity Boost',
    });
  }

  if (weekendRate < weekdayRate * 0.5) {
    dnaRecommendations.push({
      title: 'Weekend Shield Protection',
      subtitle: 'Set micro-goals for Saturday & Sunday to prevent weekend momentum drops.',
      emoji: '🛡️',
      categoryTag: 'Consistency',
    });
  }

  if (overallConsistency >= 75) {
    dnaRecommendations.push({
      title: 'Level Up Target Challenge',
      subtitle: 'Your consistency is elite! Join a 30-day mastery challenge to test your discipline.',
      emoji: '🏆',
      categoryTag: 'Mastery',
    });
  } else {
    dnaRecommendations.push({
      title: '2-Minute Rule Habit Stacking',
      subtitle: 'Attach low-completion habits right after established daily triggers (e.g. after morning coffee).',
      emoji: '⚡',
      categoryTag: 'Execution',
    });
  }

  return {
    persona,
    overallConsistency,
    totalCompletions,
    activeHabitsCount: habits.length,
    bestCategory,
    categoryBalances,
    peakDays,
    strengths: strengths.length > 0 ? strengths : ['Active daily tracker user'],
    growthAreas: growthAreas.length > 0 ? growthAreas : ['Keep logging daily to unlock deeper DNA insights'],
    dnaRecommendations,
    diversityScore,
    elapsedDaysUsed: elapsedDays,
  };
}

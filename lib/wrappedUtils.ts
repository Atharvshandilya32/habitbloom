import { Habit, HabitLog } from './habitTypes';
import { getHabitStats, getCurrentStreak } from './habitUtils';
import { calculateHabitDna, PersonaProfile } from './habitDnaUtils';
import { calculateBloomScore } from './bloomScoreUtils';

export interface WrappedSlide {
  id: string;
  type: 'intro' | 'total_completions' | 'top_habit' | 'persona' | 'bloom_score' | 'share_card' | 'time_capsule';
  title: string;
  subtitle: string;
  statNumber?: string | number;
  statLabel?: string;
  emoji?: string;
  gradient: string;
  details?: string[];
}

export interface HabitWrappedData {
  periodLabel: string; // e.g. "August 2026"
  year: number;
  month: number;
  totalCompletions: number;
  activeHabitsCount: number;
  topHabitName: string;
  topHabitEmoji: string;
  topHabitCompletions: number;
  longestStreak: number;
  persona: PersonaProfile;
  bloomScore: number;
  tierName: string;
  formattedShareText: string;
  slides: WrappedSlide[];
}

export function generateHabitWrapped(
  habits: Habit[],
  logs: HabitLog,
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1
): HabitWrappedData {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const periodLabel = `${monthNames[month - 1]} ${year}`;
  const daysInMonth = new Date(year, month, 0).getDate();

  if (!habits || habits.length === 0) {
    const dna = calculateHabitDna([], logs, year, month);
    const bloom = calculateBloomScore([], logs, year, month);
    const shareText = `🌱 Just started my habit journey on HabitBloom for ${periodLabel}! #HabitBloom #SelfImprovement`;
    
    return {
      periodLabel,
      year,
      month,
      totalCompletions: 0,
      activeHabitsCount: 0,
      topHabitName: 'No Habits Logged',
      topHabitEmoji: '🌱',
      topHabitCompletions: 0,
      longestStreak: 0,
      persona: dna.persona,
      bloomScore: bloom.totalBloomScore,
      tierName: bloom.tier.name,
      formattedShareText: shareText,
      slides: [
        {
          id: 'intro',
          type: 'intro',
          title: `Your ${periodLabel} Wrapped`,
          subtitle: 'Welcome to your personalized habit retrospective.',
          emoji: '✨',
          gradient: 'from-purple-600 via-indigo-600 to-blue-600',
        },
      ],
    };
  }

  // Calculate habit stats for top habit & streak
  let totalCompletions = 0;
  let topHabitName = habits[0].name;
  let topHabitEmoji = habits[0].emoji;
  let topHabitCompletions = 0;
  let maxStreak = 0;

  habits.forEach((habit) => {
    const stats = getHabitStats(habit, logs, daysInMonth, year, month);
    totalCompletions += stats.done;
    if (stats.done > topHabitCompletions) {
      topHabitCompletions = stats.done;
      topHabitName = habit.name;
      topHabitEmoji = habit.emoji;
    }

    const streak = getCurrentStreak(habit, logs, year, month, daysInMonth);
    if (streak > maxStreak) {
      maxStreak = streak;
    }
  });

  const dna = calculateHabitDna(habits, logs, year, month);
  const bloom = calculateBloomScore(habits, logs, year, month);

  // Smart fallback for #1 Habit if 0 check-ins exist across all habits
  const topHabitTitle = topHabitCompletions > 0
    ? `${topHabitEmoji} ${topHabitName}`
    : `🌱 Habit Blueprint Ready`;
  
  const topHabitSubtitle = topHabitCompletions > 0
    ? `${topHabitCompletions} completions in ${periodLabel}`
    : `Set your habits in motion this month!`;

  const formattedShareText = topHabitCompletions > 0
    ? `🌟 My ${periodLabel} HabitBloom Retrospective:\n• Check-Ins: ${totalCompletions}\n• Longest Streak: ${maxStreak} days\n• Top Habit: ${topHabitEmoji} ${topHabitName}\n• Behavioral DNA: ${dna.persona.emoji} ${dna.persona.title}\n• Bloom Score: ${bloom.totalBloomScore} (${bloom.tier.name})\nPowered by HabitBloom 🌸`
    : `🌱 Ready to crush goals in ${periodLabel} on HabitBloom!\n• Persona: ${dna.persona.emoji} ${dna.persona.title}\n• Bloom Score: ${bloom.totalBloomScore}\nPowered by HabitBloom 🌸`;

  const slides: WrappedSlide[] = [
    {
      id: 'intro',
      type: 'intro',
      title: `Your ${periodLabel} Retrospective`,
      subtitle: 'Let’s look back at your journey, milestones, and daily execution.',
      emoji: '🌟',
      gradient: 'from-purple-600 via-indigo-600 to-blue-600',
    },
    {
      id: 'total_completions',
      type: 'total_completions',
      title: 'Total Check-Ins Logged',
      subtitle: 'Every tick was a vote for the person you wish to become.',
      statNumber: totalCompletions,
      statLabel: 'Habit completions verified',
      emoji: '🎯',
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
      details: [
        `Across ${habits.length} active habits`,
        `Longest active streak: ${maxStreak} days`,
      ],
    },
    {
      id: 'top_habit',
      type: 'top_habit',
      title: topHabitCompletions > 0 ? 'Your #1 Cornerstone Habit' : 'Cornerstone Habit Setup',
      subtitle: topHabitCompletions > 0 ? 'The habit you showed up for with maximum consistency!' : 'Your daily habit framework is locked and ready.',
      statNumber: topHabitTitle,
      statLabel: topHabitSubtitle,
      emoji: topHabitEmoji,
      gradient: 'from-amber-500 via-orange-600 to-rose-600',
    },
    {
      id: 'persona',
      type: 'persona',
      title: 'Behavioral DNA Profile',
      subtitle: dna.persona.tagline,
      statNumber: `${dna.persona.emoji} ${dna.persona.title}`,
      statLabel: dna.persona.description,
      emoji: dna.persona.emoji,
      gradient: 'from-fuchsia-600 via-purple-600 to-pink-600',
      details: dna.strengths,
    },
    {
      id: 'bloom_score',
      type: 'bloom_score',
      title: 'Growth Bloom Score',
      subtitle: `Status Tier: ${bloom.tier.emoji} ${bloom.tier.name}`,
      statNumber: bloom.totalBloomScore,
      statLabel: 'Out of 1000 personal growth points',
      emoji: bloom.tier.emoji,
      gradient: 'from-blue-600 via-indigo-600 to-violet-600',
      details: [
        `Consistency Score: ${bloom.consistencyScore} / 400 pts`,
        `Streak Momentum: ${bloom.streakScore} / 200 pts`,
        `Diversity Index: ${bloom.diversityScore} / 200 pts`,
      ],
    },
    {
      id: 'time_capsule',
      type: 'time_capsule',
      title: 'Letter From Your Past Self',
      subtitle: 'A monthly time capsule of your growth.',
      statNumber: 'Time Capsule',
      statLabel: `You started the month as a ${dna.persona.title} and blossomed.`,
      emoji: '💌',
      gradient: 'from-rose-500 via-pink-600 to-purple-600',
      details: [
        '“Small actions become remarkable lives.”',
        `Your garden thrived with ${habits.length} active habits.`
      ],
    },
    {
      id: 'share_card',
      type: 'share_card',
      title: `${periodLabel} Milestone Highlight`,
      subtitle: 'Copy your retrospective summary card to share with friends or your Space!',
      emoji: '👑',
      gradient: 'from-slate-900 via-purple-950 to-slate-900',
    },
  ];

  return {
    periodLabel,
    year,
    month,
    totalCompletions,
    activeHabitsCount: habits.length,
    topHabitName,
    topHabitEmoji,
    topHabitCompletions,
    longestStreak: maxStreak,
    persona: dna.persona,
    bloomScore: bloom.totalBloomScore,
    tierName: bloom.tier.name,
    formattedShareText,
    slides,
  };
}

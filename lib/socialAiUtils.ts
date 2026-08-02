import { Habit, HabitLog } from './habitTypes';
import { UserSocialProfile, AiChallengeRecommendation } from './socialTypes';
import { formatHbId } from './identityUtils';

/**
 * AI Coach Recommendation Engine
 * Analyzes habit completion logs, streaks, categories, and friends list to generate tailored challenge suggestions.
 */
export function generateAiChallengeRecommendations(
  habits: Habit[],
  logs: HabitLog,
  friends: UserSocialProfile[],
  currentStreak: number = 0
): AiChallengeRecommendation[] {
  const recommendations: AiChallengeRecommendation[] = [];

  // 1. Analyze category frequency and identify lowest completion category
  const categoryStats: Record<string, { total: number; completed: number }> = {};
  habits.forEach((h) => {
    const cat = h.category || 'General';
    if (!categoryStats[cat]) categoryStats[cat] = { total: 0, completed: 0 };
    categoryStats[cat].total += 1;
  });

  Object.keys(logs).forEach((logKey) => {
    if (logs[logKey]) {
      const parts = logKey.split('_');
      const habitId = parts[0];
      const matchedHabit = habits.find((h) => h.id === habitId);
      if (matchedHabit) {
        const cat = matchedHabit.category || 'General';
        if (categoryStats[cat]) {
          categoryStats[cat].completed += 1;
        }
      }
    }
  });

  // Find category that needs boost
  let weakestCategory = '🏃 Fitness';
  let minRatio = 999;
  Object.entries(categoryStats).forEach(([cat, stat]) => {
    const ratio = stat.completed / (stat.total || 1);
    if (ratio < minRatio) {
      minRatio = ratio;
      weakestCategory = cat;
    }
  });

  // Recommendation 1: Recovery / Boost Challenge
  if (currentStreak < 3) {
    recommendations.push({
      id: 'ai_rec_recovery',
      title: '7-Day Ignition Recovery Duel ⚡',
      description: 'Your streak was recently broken or is just starting. Kickstart momentum with a 7-day focused streak sprint.',
      reason: 'AI noticed your current streak is below 3 days. A 7-day duel will reactivate your momentum multiplier!',
      targetDays: 7,
      habitCategory: weakestCategory,
      emoji: '⚡',
    });
  } else {
    recommendations.push({
      id: 'ai_rec_mastery',
      title: '14-Day Consistency Overdrive 🚀',
      description: `You have a promising ${currentStreak}-day streak! Push into high performance in ${weakestCategory}.`,
      reason: `AI calculated your ${weakestCategory} category has high growth potential. Challenge yourself to lock in double XP!`,
      targetDays: 14,
      habitCategory: weakestCategory,
      emoji: '🚀',
    });
  }

  // Recommendation 2: Friend Challenge Recommendation if friends exist
  if (friends.length > 0) {
    // Pick friend with highest active streak or random active friend
    const topFriend = [...friends].sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0))[0];
    if (topFriend) {
      recommendations.push({
        id: `ai_rec_friend_${topFriend.uid}`,
        title: `Challenge ${topFriend.displayName} in ${weakestCategory} ⚔️`,
        description: `Invite ${topFriend.displayName} (${formatHbId(topFriend.hbId)}) to a 5-day habit face-off!`,
        reason: `${topFriend.displayName} is currently on a ${topFriend.currentStreak || 1}-day streak. Head-to-head accountability doubles consistency!`,
        suggestedFriendUid: topFriend.uid,
        suggestedFriendName: topFriend.displayName,
        suggestedFriendHbId: formatHbId(topFriend.hbId),
        targetDays: 5,
        habitCategory: weakestCategory,
        emoji: '⚔️',
      });
    }
  } else {
    recommendations.push({
      id: 'ai_rec_find_friends',
      title: 'Connect with Accountability Partners 🤝',
      description: 'Users who share habits with friends are 3.4x more likely to reach a 30-day streak!',
      reason: 'AI detected 0 active accountability partners. Use your HabitBloom ID to connect with friends!',
      targetDays: 7,
      habitCategory: 'Social Accountability',
      emoji: '🤝',
    });
  }

  // Recommendation 3: Weekend Habit Drop Defense
  recommendations.push({
    id: 'ai_rec_weekend_defense',
    title: 'Weekend Habit Armor 🛡️',
    description: 'Statistically, habit completion drops 42% on Saturdays & Sundays. Set an automated weekend check-in rule!',
    reason: 'AI analysis: Weekend focus protection active. Complete all weekend habits to earn the Weekend Sentinel Badge.',
    targetDays: 2,
    habitCategory: '🧘 Wellness',
    emoji: '🛡️',
  });

  return recommendations;
}

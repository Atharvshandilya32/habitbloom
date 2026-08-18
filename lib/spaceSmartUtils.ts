import { SpaceType, SpaceChallengeType } from './spaceTypes';

/**
 * Deterministic Space Utilities
 * Generates tailored community challenge ideas, templates, and analytics insights based on space type.
 */

export async function generateSmartSpaceWeeklyReport(
  spaceType: SpaceType,
  healthScore: number,
  recentIssues: string[]
): Promise<string> {
  const issuesSummary = recentIssues && recentIssues.length > 0 ? recentIssues.join(', ') : 'no critical blockers detected';

  if (healthScore > 80) {
    return `Your ${spaceType} community is thriving! Member participation is high. Recent trends: ${issuesSummary}. A quick weekend challenge can help boost engagement further.`;
  } else if (healthScore > 50) {
    return `Engagement in your ${spaceType} is stable with room for growth. Monitored points: ${issuesSummary}. Highlighting top performers will help motivate the group.`;
  } else {
    return `Attention recommended: Your ${spaceType} activity has slowed. Focus areas: ${issuesSummary}. Action plan: Post an encouraging announcement and suggest beginner-friendly habits.`;
  }
}

export async function generateSmartSpaceChallengeIdeas(spaceType: SpaceType) {

  const ideas = {
    gym: [
      { title: "Hydration Hero 7-Day", description: "Drink 1 gallon of water every day for a week.", type: "7-day" as SpaceChallengeType, totalDays: 7 },
      { title: "21 Days of Mobility", description: "15 minutes of stretching every single morning.", type: "21-day" as SpaceChallengeType, totalDays: 21 },
    ],
    company: [
      { title: "Deep Work Sprint", description: "2 hours of uninterrupted deep work every day.", type: "7-day" as SpaceChallengeType, totalDays: 7 },
      { title: "Inbox Zero Month", description: "Clear your inbox before logging off every day.", type: "custom" as SpaceChallengeType, totalDays: 30 },
    ],
    school: [
      { title: "Reading Streak", description: "Read 20 pages of a non-fiction book daily.", type: "21-day" as SpaceChallengeType, totalDays: 21 },
      { title: "Tech-Free Evenings", description: "No screens after 8 PM.", type: "7-day" as SpaceChallengeType, totalDays: 7 },
    ],
    family: [
      { title: "Family Walk", description: "Take a 15-minute walk together every evening.", type: "7-day" as SpaceChallengeType, totalDays: 7 },
    ],
    community: [
      { title: "Gratitude Journal", description: "Write down 3 things you are grateful for.", type: "21-day" as SpaceChallengeType, totalDays: 21 },
    ],
    other: [
      { title: "Consistency Challenge", description: "Complete all your daily habits for 7 days straight.", type: "7-day" as SpaceChallengeType, totalDays: 7 },
    ]
  };

  return ideas[spaceType] || ideas.other;
}

export async function generateSmartSpaceHabitTemplates(spaceType: SpaceType) {
  const packs = {
    gym: [
      { name: "Post-Workout Stretch", emoji: "🧘", category: "health", description: "10 minutes of static stretching after training." },
      { name: "Track Macros", emoji: "🥩", category: "health", description: "Log all meals in your nutrition tracker." },
      { name: "8 Hours Sleep", emoji: "💤", category: "health", description: "Get at least 8 hours of sleep for recovery." }
    ],
    company: [
      { name: "Daily Standup Update", emoji: "📢", category: "productivity", description: "Post your daily updates before 10 AM." },
      { name: "Clear Inbox", emoji: "📧", category: "productivity", description: "Process all emails to zero by end of day." },
      { name: "Focus Block", emoji: "🎧", category: "productivity", description: "90 minutes of do-not-disturb deep work." }
    ],
    school: [
      { name: "Review Notes", emoji: "📚", category: "learning", description: "Review class notes for 15 minutes." },
      { name: "Pack Backpack", emoji: "🎒", category: "productivity", description: "Prepare your bag for the next day." }
    ],
    family: [
      { name: "Family Dinner", emoji: "🍽️", category: "health", description: "Eat dinner together without phones." },
      { name: "Read to Kids", emoji: "📖", category: "learning", description: "Read a bedtime story." }
    ],
    community: [
      { name: "Morning Meditation", emoji: "🧘", category: "health", description: "10 minutes of mindfulness." },
      { name: "Reach Out", emoji: "👋", category: "productivity", description: "Message one community member." }
    ],
    other: [
      { name: "Morning Routine", emoji: "🌅", category: "productivity", description: "Complete your standard morning routine." },
      { name: "Evening Reflection", emoji: "🌙", category: "health", description: "Write down wins for the day." }
    ]
  };

  return packs[spaceType] || packs.other;
}

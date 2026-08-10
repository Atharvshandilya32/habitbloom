import { SpaceType, SpaceChallengeType } from './spaceTypes';

/**
 * MOCK AI UTILITIES
 * These functions simulate calls to Gemini. In a production environment,
 * these would be replaced with actual API calls to the Gemini backend,
 * sending a well-crafted prompt based on the provided parameters.
 */

// Simulate network delay for realistic UX
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateSmartSpaceWeeklyReport(
  spaceType: SpaceType,
  healthScore: number,
  recentIssues: string[]
): Promise<string> {
  await simulateDelay(1500);

  if (healthScore > 80) {
    return `Your ${spaceType} community is thriving! Member participation is high. However, to maintain momentum, consider addressing the following: ${recentIssues.join(', ')}. A quick weekend challenge might boost engagement further.`;
  } else if (healthScore > 50) {
    return `Engagement in your ${spaceType} is stable but shows room for improvement. We noticed: ${recentIssues.join(', ')}. I recommend highlighting a top performer to motivate the group.`;
  } else {
    return `Attention needed: Your ${spaceType} engagement has dropped significantly. Key issues: ${recentIssues.join(', ')}. Action plan: Post a highly encouraging announcement and simplify the active challenges.`;
  }
}

export async function generateSmartSpaceChallengeIdeas(spaceType: SpaceType) {
  await simulateDelay(2000);

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
  await simulateDelay(2000);

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

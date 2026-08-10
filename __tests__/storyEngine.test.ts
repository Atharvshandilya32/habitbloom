import { generateDailyStory } from '../lib/storyEngine';
import { Habit, HabitLog } from '../lib/habitTypes';
import { makeLogKey } from '../lib/habitUtils';

console.log('🧪 Starting Story Engine Unit Test Suite...');

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;

const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);
const yYear = yesterday.getFullYear();
const yMonth = yesterday.getMonth() + 1;
const yDate = yesterday.getDate();

const sampleHabits: Habit[] = [
  { id: 'h1', name: 'Morning Run', emoji: '🏃', goal: 20, category: '🏃 Fitness' },
  { id: 'h2', name: 'Read Book', emoji: '📚', goal: 15, category: '📚 Learning' },
];

const singleHabit: Habit[] = [
  { id: 'h1', name: 'Morning Run', emoji: '🏃', goal: 20, category: '🏃 Fitness' }
];

// 1. No habits fallback
assert(
  generateDailyStory([], {}, 0, 1) === "Small actions become remarkable lives.",
  "No habits fallback returns expected message"
);

// 2. Fallback without yesterday's logs
assert(
  generateDailyStory(sampleHabits, {}, 0, 1) === "Today is a blank canvas for your growth.",
  "Fallback with no logs returns blank canvas message"
);

// 3. Fallback with partial yesterday's logs
const partialYesterdayLogs: HabitLog = {
  [makeLogKey('h1', yYear, yMonth, yDate)]: true
};
assert(
  generateDailyStory(sampleHabits, partialYesterdayLogs, 0, 1) === "Yesterday your garden became a little greener.",
  "Fallback with partial yesterday's logs returns greener garden message"
);

// 4. Perfect yesterday
const perfectYesterdayLogs: HabitLog = {
  [makeLogKey('h1', yYear, yMonth, yDate)]: true,
  [makeLogKey('h2', yYear, yMonth, yDate)]: true,
};
assert(
  generateDailyStory(sampleHabits, perfectYesterdayLogs, 0, 1) === "You protected your future self yesterday.",
  "Perfect yesterday returns protected future self message"
);

// 5. Level Proximity
// Level 1 next level XP is 1 * 2 * 50 = 100
// XP = 80 means remainingXP = 20 (<= 30)
assert(
  generateDailyStory(sampleHabits, {}, 80, 1) === "Only 20 XP until your next level.",
  "Level proximity returns XP remaining message"
);

console.log(`\n📊 Story Engine Test Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

import { calculatePersonalRecords, calculateLongestStreakOverall } from '../lib/analyticsUtils';
import { Habit, HabitLog } from '../lib/habitTypes';
import { makeLogKey } from '../lib/habitUtils';

console.log('🧪 Starting Analytics Utils Unit Test Suite...');

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

// 1. Test empty habits and logs
const emptyRecords = calculatePersonalRecords([], {});
assert(emptyRecords.mostHabitsCompleted === 0, 'mostHabitsCompleted is 0 for empty habits/logs');
assert(emptyRecords.longestSuccessfulPeriod === 0, 'longestSuccessfulPeriod is 0 for empty habits/logs');
assert(emptyRecords.highestWeeklyXp === 0, 'highestWeeklyXp is 0 for empty habits/logs');
assert(emptyRecords.highestMonthlyXp === 0, 'highestMonthlyXp is 0 for empty habits/logs');
assert(emptyRecords.highestBloomScore === 0, 'highestBloomScore is 0 for empty habits/logs');
assert(emptyRecords.bestHabitConsistency === 0, 'bestHabitConsistency is 0 for empty habits/logs');

// 2. Test habits with no logs
const sampleHabits: Habit[] = [
  { id: 'h1', name: 'Morning Run', emoji: '🏃', goal: 20, category: '🏃 Fitness' },
  { id: 'h2', name: 'Read Book', emoji: '📚', goal: 15, category: '📚 Learning' },
];

const noLogRecords = calculatePersonalRecords(sampleHabits, {});
assert(noLogRecords.mostHabitsCompleted === 0, 'mostHabitsCompleted is 0 for habits with no logs');
assert(noLogRecords.longestSuccessfulPeriod === 0, 'longestSuccessfulPeriod is 0 for habits with no logs');
assert(noLogRecords.highestWeeklyXp === 0, 'highestWeeklyXp is 0 for habits with no logs');
assert(noLogRecords.highestMonthlyXp === 0, 'highestMonthlyXp is 0 for habits with no logs');
assert(noLogRecords.highestBloomScore === 0, 'highestBloomScore is 0 for habits with no logs');
assert(noLogRecords.bestHabitConsistency === 0, 'bestHabitConsistency is 0 for habits with no logs');

// 3. Test habits with logs (using deterministic mocked date)
const originalDate = global.Date;
const FIXED_SYSTEM_TIME = '2023-05-15T12:00:00Z'; // 15th is safely in the middle of a month and a Monday
class MockDate extends originalDate {
  constructor(...args: any[]) {
    if (args.length === 0) {
      super(FIXED_SYSTEM_TIME);
    } else {
      super(...args as []);
    }
  }
  static now() {
    return new originalDate(FIXED_SYSTEM_TIME).getTime();
  }
}
global.Date = MockDate as any;

const today = new Date();
const y = today.getFullYear();
const m = today.getMonth() + 1;
const d = today.getDate();

const sampleLogs: HabitLog = {};
// Add logs for h1 for today and yesterday
sampleLogs[makeLogKey('h1', y, m, d)] = true;
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
sampleLogs[makeLogKey('h1', yesterday.getFullYear(), yesterday.getMonth() + 1, yesterday.getDate())] = true;

// Add log for h2 for today
sampleLogs[makeLogKey('h2', y, m, d)] = true;

const withLogRecords = calculatePersonalRecords(sampleHabits, sampleLogs);
assert(withLogRecords.mostHabitsCompleted === 3, 'mostHabitsCompleted is correct for habits with logs');
assert(withLogRecords.longestSuccessfulPeriod === 2, 'longestSuccessfulPeriod is correct for habits with logs');
// highestWeeklyXp is 20 because the mocked date (May 15) is a Monday. Yesterday (May 14) was a Sunday, so it falls into the previous week.
assert(withLogRecords.highestWeeklyXp === 20, 'highestWeeklyXp is correct for habits with logs');
assert(withLogRecords.highestMonthlyXp === 30, 'highestMonthlyXp is correct for habits with logs');
assert(withLogRecords.highestBloomScore === 30, 'highestBloomScore is correct for habits with logs');
assert(withLogRecords.bestHabitConsistency > 0, 'bestHabitConsistency is calculated correctly for habits with logs');

// Restore original Date
global.Date = originalDate;

// --- Tests for calculateLongestStreakOverall ---
console.log('\n🧪 Testing calculateLongestStreakOverall...');

assert(calculateLongestStreakOverall([], {}) === 0, 'Returns 0 for empty habits array');
assert(calculateLongestStreakOverall(sampleHabits, {}) === 0, 'Returns 0 for habits with no logs');

// Mock date again for streak testing
global.Date = MockDate as any;
const streakHabits: Habit[] = [
  { id: 'sh1', name: 'Habit 1', emoji: '1️⃣', goal: 30, category: 'General' },
  { id: 'sh2', name: 'Habit 2', emoji: '2️⃣', goal: 30, category: 'General' },
  { id: 'sh3', name: 'Habit 3', emoji: '3️⃣', goal: 30, category: 'General' },
];

const streakLogs: HabitLog = {};
// sh1 has a 1-day streak (today)
streakLogs[makeLogKey('sh1', y, m, d)] = true;

// sh2 has a 3-day streak (today, yesterday, 2 days ago)
streakLogs[makeLogKey('sh2', y, m, d)] = true;
const dMinus1 = new Date(today);
dMinus1.setDate(today.getDate() - 1);
streakLogs[makeLogKey('sh2', dMinus1.getFullYear(), dMinus1.getMonth() + 1, dMinus1.getDate())] = true;

const dMinus2 = new Date(today);
dMinus2.setDate(today.getDate() - 2);
streakLogs[makeLogKey('sh2', dMinus2.getFullYear(), dMinus2.getMonth() + 1, dMinus2.getDate())] = true;

// sh3 has a 2-day streak (yesterday, 2 days ago) - missing today so streak is 0?
// Wait, `getHabitLongestStreak` finds the *maximum* streak over the past 365 days.
// Oh, getHabitLongestStreak checks the max streak over 365 days, it doesn't need to be current.
// Let's create a 4-day streak for sh3 somewhere in the past.
const dPast1 = new Date(today);
dPast1.setDate(today.getDate() - 10);
const dPast2 = new Date(today);
dPast2.setDate(today.getDate() - 11);
const dPast3 = new Date(today);
dPast3.setDate(today.getDate() - 12);
const dPast4 = new Date(today);
dPast4.setDate(today.getDate() - 13);
streakLogs[makeLogKey('sh3', dPast1.getFullYear(), dPast1.getMonth() + 1, dPast1.getDate())] = true;
streakLogs[makeLogKey('sh3', dPast2.getFullYear(), dPast2.getMonth() + 1, dPast2.getDate())] = true;
streakLogs[makeLogKey('sh3', dPast3.getFullYear(), dPast3.getMonth() + 1, dPast3.getDate())] = true;
streakLogs[makeLogKey('sh3', dPast4.getFullYear(), dPast4.getMonth() + 1, dPast4.getDate())] = true;

const maxStreak = calculateLongestStreakOverall(streakHabits, streakLogs);
assert(maxStreak === 4, 'Returns the highest maximum streak among all habits');

global.Date = originalDate;


console.log(`\n📊 Analytics Utils Test Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

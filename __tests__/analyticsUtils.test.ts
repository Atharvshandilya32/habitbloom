import { calculatePersonalRecords, getHabitLongestStreak } from '../lib/analyticsUtils';
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



// 4. Test getHabitLongestStreak
const streakHabit: Habit = { id: 'streak1', name: 'Streak Test', emoji: '🔥', goal: 30, category: 'Test' };

// Test 4.1: Empty logs
assert(getHabitLongestStreak(streakHabit, {}) === 0, 'longest streak is 0 for empty logs');

// Test 4.2: Single logged day
const singleLog: HabitLog = {};
singleLog[makeLogKey('streak1', today.getFullYear(), today.getMonth() + 1, today.getDate())] = true;
assert(getHabitLongestStreak(streakHabit, singleLog) === 1, 'longest streak is 1 for single log');

// Test 4.3: Multiple consecutive days logged
const multiLog: HabitLog = {};
for (let i = 0; i < 5; i++) {
  const testD1 = new Date(today);
  testD1.setDate(today.getDate() - i);
  multiLog[makeLogKey('streak1', testD1.getFullYear(), testD1.getMonth() + 1, testD1.getDate())] = true;
}
assert(getHabitLongestStreak(streakHabit, multiLog) === 5, 'longest streak is calculated correctly for multiple consecutive days');

// Test 4.4: Broken streak
const brokenLog: HabitLog = {};
// Add 2 consecutive days
let testD2 = new Date(today);
brokenLog[makeLogKey('streak1', testD2.getFullYear(), testD2.getMonth() + 1, testD2.getDate())] = true;
testD2.setDate(today.getDate() - 1);
brokenLog[makeLogKey('streak1', testD2.getFullYear(), testD2.getMonth() + 1, testD2.getDate())] = true;

// Skip 2 days, add 4 consecutive days
testD2.setDate(today.getDate() - 3); // so this is today - 4
for (let i = 0; i < 4; i++) {
  const cd = new Date(testD2);
  cd.setDate(testD2.getDate() - i);
  brokenLog[makeLogKey('streak1', cd.getFullYear(), cd.getMonth() + 1, cd.getDate())] = true;
}

// Skip 1 day, add 1 day
testD2.setDate(testD2.getDate() - 5);
brokenLog[makeLogKey('streak1', testD2.getFullYear(), testD2.getMonth() + 1, testD2.getDate())] = true;

assert(getHabitLongestStreak(streakHabit, brokenLog) === 4, 'longest streak is correct when there are broken intervals');


// Restore original Date

global.Date = originalDate;

console.log(`\n📊 Analytics Utils Test Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

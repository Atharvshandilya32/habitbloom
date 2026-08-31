import { calculatePersonalRecords, calculateOverallConsistencyScore } from '../lib/analyticsUtils';
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


// 4. Test calculateOverallConsistencyScore
assert(calculateOverallConsistencyScore([], {}) === 0, 'Overall consistency score is 0 for empty habits');
assert(calculateOverallConsistencyScore(sampleHabits, {}) === 0, 'Overall consistency score is 0 for habits with no logs');

const consistencyLogs: HabitLog = {};
global.Date = MockDate as any;
const todayDate = new Date();

// Create 15 days of logs for h1 (50% completion)
for (let i = 0; i < 15; i++) {
  const d = new Date(todayDate);
  d.setDate(todayDate.getDate() - i);
  consistencyLogs[makeLogKey('h1', d.getFullYear(), d.getMonth() + 1, d.getDate())] = true;
}

// 15 completions out of 60 possible (2 habits * 30 days) -> 25%
let score = calculateOverallConsistencyScore(sampleHabits, consistencyLogs);
assert(score === 25, `Overall consistency score correctly calculates partial completion (expected 25, got ${score})`);

// Create full 30 days of logs for both habits (100% completion)
const fullConsistencyLogs: HabitLog = {};
for (let i = 0; i < 30; i++) {
  const d = new Date(todayDate);
  d.setDate(todayDate.getDate() - i);
  fullConsistencyLogs[makeLogKey('h1', d.getFullYear(), d.getMonth() + 1, d.getDate())] = true;
  fullConsistencyLogs[makeLogKey('h2', d.getFullYear(), d.getMonth() + 1, d.getDate())] = true;
}

score = calculateOverallConsistencyScore(sampleHabits, fullConsistencyLogs);
assert(score === 100, `Overall consistency score is 100 for full completion (got ${score})`);

// Create logs outside the 30-day window to ensure they are ignored
const outsideWindowLogs: HabitLog = {};
const oldDate = new Date(todayDate);
oldDate.setDate(todayDate.getDate() - 35);
outsideWindowLogs[makeLogKey('h1', oldDate.getFullYear(), oldDate.getMonth() + 1, oldDate.getDate())] = true;

score = calculateOverallConsistencyScore(sampleHabits, outsideWindowLogs);
assert(score === 0, `Overall consistency score ignores logs outside 30-day window (got ${score})`);

// Restore original Date
global.Date = originalDate;

console.log(`\n📊 Analytics Utils Test Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

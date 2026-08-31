import { calculatePersonalRecords, calculateTrend30Days } from '../lib/analyticsUtils';
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

// 1b. Test calculateTrend30Days with empty habits and logs
const emptyTrend30 = calculateTrend30Days([], {});
assert(emptyTrend30.length === 30, 'calculateTrend30Days returns 30 days for empty input');
assert(emptyTrend30.every(d => d.completed === 0 && d.possible === 0 && d.rate === 0), 'calculateTrend30Days correctly returns 0 for completed, possible, and rate with empty input');

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

// 2b. Test calculateTrend30Days with habits but no logs
const noLogTrend30 = calculateTrend30Days(sampleHabits, {});
assert(noLogTrend30.length === 30, 'calculateTrend30Days returns 30 days for habits with no logs');
assert(noLogTrend30.every(d => d.completed === 0 && d.possible === sampleHabits.length && d.rate === 0), 'calculateTrend30Days correctly returns 0 for completed/rate and correct possible count with no logs');

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

// 3b. Test calculateTrend30Days with valid logs
const trend30WithLogs = calculateTrend30Days(sampleHabits, sampleLogs);
assert(trend30WithLogs.length === 30, 'calculateTrend30Days returns 30 days for habits with logs');

// Check the last item (today, index 29)
const todayData = trend30WithLogs[29];
assert(todayData.completed === 2, 'calculateTrend30Days correctly calculates completed for today');
assert(todayData.possible === 2, 'calculateTrend30Days correctly calculates possible for today');
assert(todayData.rate === 100, 'calculateTrend30Days correctly calculates rate for today');

// Check the second to last item (yesterday, index 28)
const yesterdayData = trend30WithLogs[28];
assert(yesterdayData.completed === 1, 'calculateTrend30Days correctly calculates completed for yesterday');
assert(yesterdayData.possible === 2, 'calculateTrend30Days correctly calculates possible for yesterday');
assert(yesterdayData.rate === 50, 'calculateTrend30Days correctly calculates rate for yesterday');

// Check an earlier day (e.g., index 0)
const olderData = trend30WithLogs[0];
assert(olderData.completed === 0, 'calculateTrend30Days correctly calculates completed for older days');
assert(olderData.possible === 2, 'calculateTrend30Days correctly calculates possible for older days');
assert(olderData.rate === 0, 'calculateTrend30Days correctly calculates rate for older days');

// Restore original Date
global.Date = originalDate;

console.log(`\n📊 Analytics Utils Test Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

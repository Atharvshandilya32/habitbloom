import { calculatePersonalRecords, calculateTrend7Days } from '../lib/analyticsUtils';
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

// 4. Test calculateTrend7Days with empty habits and logs
const emptyTrend = calculateTrend7Days([], {});
assert(emptyTrend.length === 7, 'calculateTrend7Days returns 7 days for empty habits/logs');
assert(emptyTrend.every(day => day.completed === 0 && day.possible === 0 && day.rate === 0), 'calculateTrend7Days calculates 0s for empty habits/logs');

// 5. Test calculateTrend7Days with habits but no logs
const noLogTrend = calculateTrend7Days(sampleHabits, {});
assert(noLogTrend.length === 7, 'calculateTrend7Days returns 7 days for habits with no logs');
assert(noLogTrend.every(day => day.completed === 0 && day.possible === 2 && day.rate === 0), 'calculateTrend7Days calculates 0 completed/rate and correct possible for habits with no logs');

// 6. Test calculateTrend7Days with habits and logs
const withLogTrend = calculateTrend7Days(sampleHabits, sampleLogs);
assert(withLogTrend.length === 7, 'calculateTrend7Days returns 7 days for habits with logs');
// The last item in the array is "today"
const trendToday = withLogTrend[6];
assert(trendToday.completed === 2, 'calculateTrend7Days calculates correct completed for today');
assert(trendToday.possible === 2, 'calculateTrend7Days calculates correct possible for today');
assert(trendToday.rate === 100, 'calculateTrend7Days calculates correct rate for today');

// The second to last item is "yesterday"
const trendYesterday = withLogTrend[5];
assert(trendYesterday.completed === 1, 'calculateTrend7Days calculates correct completed for yesterday');
assert(trendYesterday.possible === 2, 'calculateTrend7Days calculates correct possible for yesterday');
assert(trendYesterday.rate === 50, 'calculateTrend7Days calculates correct rate for yesterday');

// The rest of the days should have 0 completed
const trendTwoDaysAgo = withLogTrend[4];
assert(trendTwoDaysAgo.completed === 0, 'calculateTrend7Days calculates correct completed for two days ago');
assert(trendTwoDaysAgo.possible === 2, 'calculateTrend7Days calculates correct possible for two days ago');
assert(trendTwoDaysAgo.rate === 0, 'calculateTrend7Days calculates correct rate for two days ago');

// Restore original Date
global.Date = originalDate;

console.log(`\n📊 Analytics Utils Test Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

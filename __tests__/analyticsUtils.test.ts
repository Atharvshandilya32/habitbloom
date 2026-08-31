import { calculatePersonalRecords, getCategoryCompletionStats } from '../lib/analyticsUtils';
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


// 4. Test getCategoryCompletionStats with empty habits and logs
const emptyCategoryStats = getCategoryCompletionStats([], {});
assert(emptyCategoryStats.every(cat => cat.count === 0 && cat.completed === 0 && cat.possible === 0 && cat.rate === 0), 'getCategoryCompletionStats returns zeros for empty habits/logs');

// 5. Test getCategoryCompletionStats with habits and logs
const categoryTestHabits = [
  { id: 'h3', name: 'Morning Run', emoji: '🏃', goal: 20, category: '🏃 Fitness' }, // matches id
  { id: 'h4', name: 'Read Book', emoji: '📚', goal: 15, category: 'Learning' }, // matches label
];

// Reusing MockDate
const originalDate4 = global.Date;
const FIXED_SYSTEM_TIME4 = '2023-05-15T12:00:00Z'; // May has 31 days
class MockDate4 extends originalDate4 {
  constructor(...args) {
    if (args.length === 0) {
      super(FIXED_SYSTEM_TIME4);
    } else {
      super(...args as []);
    }
  }
  static now() {
    return new originalDate4(FIXED_SYSTEM_TIME4).getTime();
  }
}
global.Date = MockDate4 as any;

const categoryTestLogs = {};
const y4 = 2023;
const m4 = 5;
// Add logs for h3 for days 1, 2, 3
categoryTestLogs[makeLogKey('h3', y4, m4, 1)] = true;
categoryTestLogs[makeLogKey('h3', y4, m4, 2)] = true;
categoryTestLogs[makeLogKey('h3', y4, m4, 3)] = true;

// Add logs for h4 for days 1, 2
categoryTestLogs[makeLogKey('h4', y4, m4, 1)] = true;
categoryTestLogs[makeLogKey('h4', y4, m4, 2)] = true;

const categoryStats = getCategoryCompletionStats(categoryTestHabits, categoryTestLogs);
// May has 31 days
const fitnessCat = categoryStats.find(c => c.id === '🏃 Fitness');
assert(fitnessCat !== undefined && fitnessCat.count === 1, 'Fitness category count is correct');
assert(fitnessCat !== undefined && fitnessCat.possible === 31, 'Fitness category possible is correct');
assert(fitnessCat !== undefined && fitnessCat.completed === 3, 'Fitness category completed is correct');
assert(fitnessCat !== undefined && fitnessCat.rate === Math.round((3/31)*100), 'Fitness category rate is correct');

const learningCat = categoryStats.find(c => c.id === '📚 Learning');
assert(learningCat !== undefined && learningCat.count === 1, 'Learning category count is correct (matched by label)');
assert(learningCat !== undefined && learningCat.possible === 31, 'Learning category possible is correct');
assert(learningCat !== undefined && learningCat.completed === 2, 'Learning category completed is correct');
assert(learningCat !== undefined && learningCat.rate === Math.round((2/31)*100), 'Learning category rate is correct');

const financeCat = categoryStats.find(c => c.id === '💰 Finance');
assert(financeCat !== undefined && financeCat.count === 0, 'Finance category count is correct (0)');
assert(financeCat !== undefined && financeCat.possible === 0, 'Finance category possible is correct (0)');
assert(financeCat !== undefined && financeCat.completed === 0, 'Finance category completed is correct (0)');
assert(financeCat !== undefined && financeCat.rate === 0, 'Finance category rate is correct (0)');

global.Date = originalDate4;

console.log(`\n📊 Analytics Utils Test Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

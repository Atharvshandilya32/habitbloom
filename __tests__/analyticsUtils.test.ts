import { calculatePersonalRecords, calculateWeeklyReview } from '../lib/analyticsUtils';
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

// --- Tests for calculateWeeklyReview ---
const refDate = new Date('2023-05-17T12:00:00Z'); // Wednesday

// 1. Test empty state for Weekly Review
const emptyWeeklyReview = calculateWeeklyReview([], {}, refDate);
assert(emptyWeeklyReview.totalCompleted === 0, 'weeklyReview totalCompleted is 0 for empty state');
assert(emptyWeeklyReview.totalPossible === 0, 'weeklyReview totalPossible is 0 for empty state');
assert(emptyWeeklyReview.completionRate === 0, 'weeklyReview completionRate is 0 for empty state');
assert(emptyWeeklyReview.prevWeekCompletionRate === 0, 'weeklyReview prevWeekCompletionRate is 0 for empty state');
assert(emptyWeeklyReview.improvementDelta === 0, 'weeklyReview improvementDelta is 0 for empty state');
assert(emptyWeeklyReview.bestHabit === null, 'weeklyReview bestHabit is null for empty state');
assert(emptyWeeklyReview.weakestHabit === null, 'weeklyReview weakestHabit is null for empty state');

// 2. Test weekly review with data
const weekHabits: Habit[] = [
  { id: 'wh1', name: 'Meditate', emoji: '🧘', goal: 7, category: '🧠 Mental Health' },
  { id: 'wh2', name: 'Code', emoji: '💻', goal: 5, category: '💼 Career' },
];

const weekLogs: HabitLog = {};
// Current Week (starts Monday May 15)
// May 15 (Mon): wh1, wh2
weekLogs[makeLogKey('wh1', 2023, 5, 15)] = true;
weekLogs[makeLogKey('wh2', 2023, 5, 15)] = true;
// May 16 (Tue): wh1
weekLogs[makeLogKey('wh1', 2023, 5, 16)] = true;

// Previous Week (Starts Monday May 8)
// May 8 (Mon): wh1
weekLogs[makeLogKey('wh1', 2023, 5, 8)] = true;
// May 10 (Wed): wh1, wh2
weekLogs[makeLogKey('wh1', 2023, 5, 10)] = true;
weekLogs[makeLogKey('wh2', 2023, 5, 10)] = true;
// May 11 (Thu): wh2
weekLogs[makeLogKey('wh2', 2023, 5, 11)] = true;

const weeklyReview = calculateWeeklyReview(weekHabits, weekLogs, refDate);

assert(weeklyReview.totalPossible === 14, 'weeklyReview totalPossible is correct (7 days * 2 habits = 14)');
assert(weeklyReview.totalCompleted === 3, 'weeklyReview totalCompleted is correct (2 on Mon, 1 on Tue)');
assert(weeklyReview.completionRate === Math.round((3 / 14) * 100), 'weeklyReview completionRate is correct');

const expectedPrevTotalCompleted = 4; // 1 on Mon, 2 on Wed, 1 on Thu
const expectedPrevCompletionRate = Math.round((expectedPrevTotalCompleted / 14) * 100);
assert(weeklyReview.prevWeekCompletionRate === expectedPrevCompletionRate, 'weeklyReview prevWeekCompletionRate is correct');
assert(weeklyReview.improvementDelta === (weeklyReview.completionRate - expectedPrevCompletionRate), 'weeklyReview improvementDelta is correct');

assert(weeklyReview.bestHabit !== null && weeklyReview.bestHabit.name === 'Meditate', 'weeklyReview bestHabit is Meditate (2 completions vs 1)');
assert(weeklyReview.weakestHabit !== null && weeklyReview.weakestHabit.name === 'Code', 'weeklyReview weakestHabit is Code (1 completion vs 2)');
assert(weeklyReview.mostProductiveDay === 'Monday', 'weeklyReview mostProductiveDay is Monday (2 completions)');
assert(weeklyReview.leastProductiveDay === 'Wednesday' || weeklyReview.leastProductiveDay === 'Thursday' || weeklyReview.leastProductiveDay === 'Friday' || weeklyReview.leastProductiveDay === 'Saturday' || weeklyReview.leastProductiveDay === 'Sunday', 'weeklyReview leastProductiveDay is a day with 0 completions');

console.log(`\n📊 Analytics Utils Test Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

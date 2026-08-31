import { calculatePersonalRecords, calculateContributionHeatmap } from '../lib/analyticsUtils';
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

// 4. Test calculateContributionHeatmap
const emptyHeatmap = calculateContributionHeatmap([], {});
assert(emptyHeatmap.length === 365, 'calculateContributionHeatmap returns 365 days by default');
assert(emptyHeatmap.every(c => c.count === 0 && c.level === 0), 'empty heatmap has 0 count and level 0 for all cells');

const customDaysHeatmap = calculateContributionHeatmap([], {}, 7);
assert(customDaysHeatmap.length === 7, 'calculateContributionHeatmap respects custom days parameter');

global.Date = MockDate as any;
const heatmapHabits: Habit[] = [
  { id: 'h1', name: 'H1', emoji: '1', goal: 30, category: 'A' },
  { id: 'h2', name: 'H2', emoji: '2', goal: 30, category: 'A' },
  { id: 'h3', name: 'H3', emoji: '3', goal: 30, category: 'A' },
  { id: 'h4', name: 'H4', emoji: '4', goal: 30, category: 'A' },
  { id: 'h5', name: 'H5', emoji: '5', goal: 30, category: 'A' },
];

const heatmapLogs: HabitLog = {};
// Today: 5 completions (ratio 1.0, count 5) -> level 4
heatmapLogs[makeLogKey('h1', y, m, d)] = true;
heatmapLogs[makeLogKey('h2', y, m, d)] = true;
heatmapLogs[makeLogKey('h3', y, m, d)] = true;
heatmapLogs[makeLogKey('h4', y, m, d)] = true;
heatmapLogs[makeLogKey('h5', y, m, d)] = true;

// Yesterday: 3 completions (ratio 0.6) -> level 3
heatmapLogs[makeLogKey('h1', yesterday.getFullYear(), yesterday.getMonth() + 1, yesterday.getDate())] = true;
heatmapLogs[makeLogKey('h2', yesterday.getFullYear(), yesterday.getMonth() + 1, yesterday.getDate())] = true;
heatmapLogs[makeLogKey('h3', yesterday.getFullYear(), yesterday.getMonth() + 1, yesterday.getDate())] = true;

// 2 days ago: 2 completions (ratio 0.4) -> level 2
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(today.getDate() - 2);
heatmapLogs[makeLogKey('h1', twoDaysAgo.getFullYear(), twoDaysAgo.getMonth() + 1, twoDaysAgo.getDate())] = true;
heatmapLogs[makeLogKey('h2', twoDaysAgo.getFullYear(), twoDaysAgo.getMonth() + 1, twoDaysAgo.getDate())] = true;

// 3 days ago: 1 completion (ratio 0.2) -> level 1
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(today.getDate() - 3);
heatmapLogs[makeLogKey('h1', threeDaysAgo.getFullYear(), threeDaysAgo.getMonth() + 1, threeDaysAgo.getDate())] = true;

const testHeatmap = calculateContributionHeatmap(heatmapHabits, heatmapLogs, 7);
assert(testHeatmap.length === 7, 'calculateContributionHeatmap with logs returns correct number of days');

// The array is filled from oldest to newest, so today is the last element
const todayCell = testHeatmap[6];
assert(todayCell.count === 5 && todayCell.level === 4, 'Level 4 calculated correctly (5 completions)');

const yesterdayCell = testHeatmap[5];
assert(yesterdayCell.count === 3 && yesterdayCell.level === 3, 'Level 3 calculated correctly (3 completions)');

const twoDaysAgoCell = testHeatmap[4];
assert(twoDaysAgoCell.count === 2 && twoDaysAgoCell.level === 2, 'Level 2 calculated correctly (2 completions)');

const threeDaysAgoCell = testHeatmap[3];
assert(threeDaysAgoCell.count === 1 && threeDaysAgoCell.level === 1, 'Level 1 calculated correctly (1 completion)');

const fourDaysAgoCell = testHeatmap[2];
assert(fourDaysAgoCell.count === 0 && fourDaysAgoCell.level === 0, 'Level 0 calculated correctly (0 completions)');

global.Date = originalDate;

console.log(`\n📊 Analytics Utils Test Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

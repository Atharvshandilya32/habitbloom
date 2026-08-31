import { calculatePersonalRecords, calculateHabitHealth } from '../lib/analyticsUtils';
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

// 4. Test calculateHabitHealth
console.log('\n🧪 Testing calculateHabitHealth...');

// 4.1 Test NEW status
// Important: habit IDs cannot have underscores because of how split('_') works in calculateHabitHealth
const hNew: Habit = { id: 'hnew', name: 'New Habit', emoji: '🌱', goal: 31, category: '🎯 Personal Growth' };
const logsNew: HabitLog = {};
logsNew[makeLogKey('hnew', y, m, d)] = true;
const newHealth = calculateHabitHealth(hNew, logsNew);
assert(newHealth.status === '🌱 NEW', 'status is NEW for habit < 7 days old with < 7 completions');
assert(newHealth.rate === 0, 'rate is 0 for NEW habit');

// 4.2 Test THRIVING status
const hThrive: Habit = { id: 'hthrive', name: 'Thriving Habit', emoji: '🚀', goal: 31, category: '🏃 Fitness' };
const logsThrive: HabitLog = {};
logsThrive[makeLogKey('hthrive', 2023, 5, 1)] = true; // age >= 14 days
for (let i = 0; i < 14; i++) {
  const dVal = new Date(today);
  dVal.setDate(dVal.getDate() - i);
  logsThrive[makeLogKey('hthrive', dVal.getFullYear(), dVal.getMonth() + 1, dVal.getDate())] = true;
}
const thriveHealth = calculateHabitHealth(hThrive, logsThrive);
assert(thriveHealth.status === '🌱 THRIVING', 'status is THRIVING for rate >= 80');
assert(thriveHealth.rate === 100, 'rate is 100 for perfect 14 days');
assert(thriveHealth.description.includes('Completed 14 of 14'), 'description mentions 14 of 14 sessions');

// 4.3 Test STABLE status
const hStable: Habit = { id: 'hstable', name: 'Stable Habit', emoji: '🌿', goal: 31, category: '📚 Learning' };
const logsStable: HabitLog = {};
logsStable[makeLogKey('hstable', 2023, 5, 1)] = true; // age >= 14 days
for (let i = 0; i < 9; i++) {
  const dVal = new Date(today);
  dVal.setDate(dVal.getDate() - i);
  logsStable[makeLogKey('hstable', dVal.getFullYear(), dVal.getMonth() + 1, dVal.getDate())] = true;
}
const stableHealth = calculateHabitHealth(hStable, logsStable);
assert(stableHealth.status === '🌿 STABLE', 'status is STABLE for rate >= 50 and < 80');
assert(stableHealth.rate === Math.round((9 / 14) * 100), 'rate is calculated correctly for 9 completions');
assert(stableHealth.description.includes('Completed 9 of 14'), 'description mentions 9 of 14 sessions');

// 4.4 Test NEEDS ATTENTION status
const hNeedsAttn: Habit = { id: 'hattn', name: 'Needs Attention Habit', emoji: '🍂', goal: 31, category: '💰 Finance' };
const logsAttn: HabitLog = {};
logsAttn[makeLogKey('hattn', 2023, 5, 1)] = true; // age >= 14 days
for (let i = 0; i < 4; i++) {
  const dVal = new Date(today);
  dVal.setDate(dVal.getDate() - i);
  logsAttn[makeLogKey('hattn', dVal.getFullYear(), dVal.getMonth() + 1, dVal.getDate())] = true;
}
const attnHealth = calculateHabitHealth(hNeedsAttn, logsAttn);
assert(attnHealth.status === '🍂 NEEDS ATTENTION', 'status is NEEDS ATTENTION for rate < 50');
assert(attnHealth.rate === Math.round((4 / 14) * 100), 'rate is calculated correctly for 4 completions');
assert(attnHealth.description.includes('Completed 4 of 14'), 'description mentions 4 of 14 sessions');

// Restore original Date
global.Date = originalDate;

console.log(`\n📊 Analytics Utils Test Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

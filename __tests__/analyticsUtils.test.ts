import { getCategoryCompletionStats } from '../lib/analyticsUtils';
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

function runTests() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  // 1. Empty Input Handling
  const emptyStats = getCategoryCompletionStats([], {});
  assert(emptyStats.length > 0, 'Empty input returns stats for all categories');
  assert(emptyStats.every(stat => stat.count === 0 && stat.completed === 0 && stat.possible === 0 && stat.rate === 0), 'Empty input results in 0 metrics across all categories');

  // 2. Standard Path Calculation
  const sampleHabits: Habit[] = [
    { id: 'h1', name: 'Running', emoji: '🏃', goal: 30, category: '🏃 Fitness' },
    { id: 'h2', name: 'Lifting', emoji: '🏋️', goal: 30, category: '🏃 Fitness' },
    { id: 'h3', name: 'Reading', emoji: '📚', goal: 30, category: '📚 Learning' },
  ];

  const sampleLogs: HabitLog = {
    [makeLogKey('h1', year, month, 1)]: true,
    [makeLogKey('h1', year, month, 2)]: true,
    [makeLogKey('h3', year, month, 1)]: true,
  };

  const standardStats = getCategoryCompletionStats(sampleHabits, sampleLogs);

  const fitnessStat = standardStats.find(s => s.id === '🏃 Fitness');
  assert(fitnessStat !== undefined, 'Fitness category stat exists');
  assert(fitnessStat?.count === 2, 'Counts two habits in Fitness category');
  assert(fitnessStat?.completed === 2, 'Counts two completions in Fitness category');

  const learningStat = standardStats.find(s => s.id === '📚 Learning');
  assert(learningStat !== undefined, 'Learning category stat exists');
  assert(learningStat?.count === 1, 'Counts one habit in Learning category');
  assert(learningStat?.completed === 1, 'Counts one completion in Learning category');

  // 3. Ensure Bounds Check Works Correctly
  // We mock the filter method to return an array-like object that reports a small length
  // but iterates more times in forEach, simulating a scenario where completions exceed possible.
  const boundsHabitsMock = {
    filter: (cb: any) => {
      return {
        length: 1,
        forEach: (fn: any) => {
          fn({ id: 'h1', category: '🏃 Fitness' });
          fn({ id: 'h2', category: '🏃 Fitness' });
        }
      };
    }
  } as unknown as Habit[];

  const boundsLogsAll: HabitLog = {};
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    boundsLogsAll[makeLogKey('h1', year, month, d)] = true;
    boundsLogsAll[makeLogKey('h2', year, month, d)] = true;
  }

  const boundedStats = getCategoryCompletionStats(boundsHabitsMock, boundsLogsAll);
  const fitnessBoundedStat = boundedStats.find(s => s.id === '🏃 Fitness');
  assert(fitnessBoundedStat !== undefined && fitnessBoundedStat.rate === 100, 'Rates are properly bounded to a maximum of 100');

  console.log(`\n📊 Analytics Utils Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();

import { calculateContributionHeatmap } from '../lib/analyticsUtils';
import { Habit, HabitLog } from '../lib/habitTypes';

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

// Mocking global.Date for consistent tests
const OriginalDate = global.Date;

class MockDate extends OriginalDate {
  constructor(...args: any[]) {
    if (args.length === 0) {
      // Fixed date: 2026-08-31T12:00:00Z
      super('2026-08-31T12:00:00Z');
    } else {
      super(...(args as []));
    }
  }

  static now() {
    return new OriginalDate('2026-08-31T12:00:00Z').getTime();
  }
}

// @ts-ignore
global.Date = MockDate;

const sampleHabits: Habit[] = [
  { id: 'h1', name: 'Morning Run', emoji: '🏃', goal: 20, category: '🏃 Fitness' },
  { id: 'h2', name: 'Read Book', emoji: '📚', goal: 15, category: '📚 Learning' },
];

const sampleLogs: HabitLog = {
  'h1_2026_8_30': true,
  'h2_2026_8_30': true,
  'h1_2026_8_31': true,
  // h2 not completed on 8/31
};

// 1. Heatmap Generation length
const heatmap3Days = calculateContributionHeatmap(sampleHabits, sampleLogs, 3);
assert(heatmap3Days.length === 3, 'calculateContributionHeatmap generates correct number of cells (3 days)');

// 2. Heatmap Values and Levels
// 2026-08-31 is today. 3 days means:
// subDays(0) -> 2026-08-31
// subDays(1) -> 2026-08-30
// subDays(2) -> 2026-08-29

// Wait, the loop in `calculateContributionHeatmap` runs from `days - 1` down to `0`.
// So the first element in `cells` array is subDays(days - 1), which is older.
// The last element is subDays(0), which is today.

const cellToday = heatmap3Days[2]; // 2026-08-31
const cellYesterday = heatmap3Days[1]; // 2026-08-30
const cellDayBefore = heatmap3Days[0]; // 2026-08-29

assert(cellToday.date === '2026-08-31', 'Calculates correct date for today cell');
assert(cellToday.count === 1, 'Calculates correct completion count for today (1 of 2 habits)');
// Ratio = 0.5 -> level 3
assert(cellToday.level === 3, 'Calculates correct level for 0.5 ratio (level 3)');

assert(cellYesterday.date === '2026-08-30', 'Calculates correct date for yesterday cell');
assert(cellYesterday.count === 2, 'Calculates correct completion count for yesterday (2 of 2 habits)');
// Ratio = 1.0 -> level 4
assert(cellYesterday.level === 4, 'Calculates correct level for 1.0 ratio (level 4)');

assert(cellDayBefore.date === '2026-08-29', 'Calculates correct date for day before yesterday cell');
assert(cellDayBefore.count === 0, 'Calculates correct completion count for day before yesterday (0 habits)');
assert(cellDayBefore.level === 0, 'Calculates correct level for 0 ratio (level 0)');


// Restore Date
global.Date = OriginalDate;

console.log(`\n📊 Analytics Utils Test Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

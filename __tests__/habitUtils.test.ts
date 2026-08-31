import { makeLogKey, getMonthKeyPrefix } from '../lib/habitUtils';

console.log('🧪 Starting Habit Utils Key Helpers Test Suite...');

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
  // 1. Tests for makeLogKey
  assert(
    makeLogKey('h1', 2026, 8, 15) === 'h1_2026_8_15',
    'makeLogKey formats regular date correctly'
  );
  assert(
    makeLogKey('h2', 2026, 12, 1) === 'h2_2026_12_1',
    'makeLogKey formats single digit day correctly'
  );
  assert(
    makeLogKey('habit-id', 2026, 1, 9) === 'habit-id_2026_1_9',
    'makeLogKey formats single digit month and day correctly'
  );
  assert(
    makeLogKey('', 2026, 8, 15) === '_2026_8_15',
    'makeLogKey handles empty habit ID correctly'
  );
  assert(
    makeLogKey('h3', 2024, 2, 29) === 'h3_2024_2_29',
    'makeLogKey handles leap year date correctly'
  );
  assert(
    makeLogKey('h4', 0, 0, 0) === 'h4_0_0_0',
    'makeLogKey handles zero date values correctly'
  );

  // 2. Tests for getMonthKeyPrefix
  assert(
    getMonthKeyPrefix(2026, 8) === '_2026_8_',
    'getMonthKeyPrefix formats regular year and month correctly'
  );
  assert(
    getMonthKeyPrefix(2026, 12) === '_2026_12_',
    'getMonthKeyPrefix formats double digit month correctly'
  );
  assert(
    getMonthKeyPrefix(2024, 2) === '_2024_2_',
    'getMonthKeyPrefix formats leap year month correctly'
  );
  assert(
    getMonthKeyPrefix(0, 0) === '_0_0_',
    'getMonthKeyPrefix handles zero date values correctly'
  );

  console.log(`\n📊 Habit Utils Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();

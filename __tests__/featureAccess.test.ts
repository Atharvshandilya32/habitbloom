import { normalizeUserPlan } from '../lib/featureAccess';

/**
 * HabitBloom Feature Access Unit Test Suite
 * Asserts correctness of user plan normalization and access states.
 */
function runTests() {
  console.log('🧪 Starting HabitBloom Feature Access Unit Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Happy Paths
  assert(normalizeUserPlan('PREMIUM') === 'PREMIUM', 'normalizeUserPlan correctly handles PREMIUM string');
  assert(normalizeUserPlan('EARLY_ACCESS') === 'EARLY_ACCESS', 'normalizeUserPlan correctly handles EARLY_ACCESS string');
  assert(normalizeUserPlan('FREE') === 'FREE', 'normalizeUserPlan correctly handles FREE string');

  // 2. Edge Cases and Unexpected Inputs
  assert(normalizeUserPlan(null) === 'FREE', 'normalizeUserPlan correctly defaults to FREE for null');
  assert(normalizeUserPlan(undefined) === 'FREE', 'normalizeUserPlan correctly defaults to FREE for undefined');
  assert(normalizeUserPlan('SOME_OTHER_PLAN') === 'FREE', 'normalizeUserPlan correctly defaults to FREE for unrecognized strings');
  assert(normalizeUserPlan('') === 'FREE', 'normalizeUserPlan correctly defaults to FREE for empty string');
  assert(normalizeUserPlan(123) === 'FREE', 'normalizeUserPlan correctly defaults to FREE for numbers');
  assert(normalizeUserPlan({}) === 'FREE', 'normalizeUserPlan correctly defaults to FREE for objects');
  assert(normalizeUserPlan([]) === 'FREE', 'normalizeUserPlan correctly defaults to FREE for arrays');
  assert(normalizeUserPlan(true) === 'FREE', 'normalizeUserPlan correctly defaults to FREE for booleans');

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

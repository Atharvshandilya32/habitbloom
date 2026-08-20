import { generateInviteCode } from '../lib/spaceUtils';

function runTests() {
  console.log('🧪 Starting Space Utils Unit Test Suite...\n');
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

  // Test: Length of the generated code
  const code1 = generateInviteCode();
  assert(code1.length === 8, 'generateInviteCode should return exactly 8 characters');

  // Test: Alphanumeric composition
  const alphanumericRegex = /^[A-Z0-9]+$/;
  assert(alphanumericRegex.test(code1), 'generateInviteCode should only contain uppercase alphanumeric characters');

  // Test: Randomness/Uniqueness
  const numCodesToGenerate = 100;
  const generatedCodes = new Set<string>();
  let hasDuplicates = false;
  for (let i = 0; i < numCodesToGenerate; i++) {
    const code = generateInviteCode();
    if (generatedCodes.has(code)) {
      hasDuplicates = true;
    }
    generatedCodes.add(code);
  }
  assert(!hasDuplicates, 'generateInviteCode should generate unique codes across multiple calls');

  console.log(`\n📊 Space Utils Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

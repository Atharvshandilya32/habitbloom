import { generateInviteCode, createNewSpace, generateSpaceInvite } from '../lib/spaceUtils';
import assert from 'assert';

function runTests() {
  console.log("🧪 Starting Space Utils Unit Test Suite...");
  let passed = 0;
  let failed = 0;

  function runTest(name: string, testFn: () => void) {
    try {
      testFn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (e: any) {
      console.log(`  ✗ FAIL: ${name} - ${e.message}`);
      failed++;
    }
  }

  runTest("generateInviteCode generates 8-character string", () => {
    const code = generateInviteCode();
    assert.strictEqual(code.length, 8);
  });

  runTest("generateInviteCode uses only alphanumeric characters", () => {
    const code = generateInviteCode();
    assert.match(code, /^[A-Z0-9]{8}$/);
  });

  runTest("createNewSpace generates correct format ID", () => {
    const { space, member } = createNewSpace("Test", "Desc", "other", "user123");
    assert.match(space.id, /^space-\d+-[a-f0-9\-]{36}$/);
    assert.strictEqual(member.spaceId, space.id);
  });

  console.log(`\n📊 Space Utils Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

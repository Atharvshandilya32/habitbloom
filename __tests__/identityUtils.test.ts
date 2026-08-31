import { generateRaw10DigitId } from "../lib/identityUtils";

function runTests() {
  console.log("🧪 Starting identityUtils Test Suite...\n");
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

  // 1. Check basic length and format
  const id1 = generateRaw10DigitId();
  assert(id1.length === 10, "Generated ID is exactly 10 characters long");
  assert(
    /^[1-9][0-9]{9}$/.test(id1),
    "Generated ID consists of 10 digits and does not start with 0",
  );

  // 2. Check uniqueness across multiple calls
  const id2 = generateRaw10DigitId();
  const id3 = generateRaw10DigitId();
  assert(
    id1 !== id2,
    "Successive calls to generateRaw10DigitId return different values (1 vs 2)",
  );
  assert(
    id2 !== id3,
    "Successive calls to generateRaw10DigitId return different values (2 vs 3)",
  );
  assert(
    id1 !== id3,
    "Successive calls to generateRaw10DigitId return different values (1 vs 3)",
  );

  // 3. Generate a bunch to ensure no zero prefix creeps in and uniqueness holds up
  const ids = new Set<string>();
  let formatValid = true;
  for (let i = 0; i < 100; i++) {
    const id = generateRaw10DigitId();
    ids.add(id);
    if (!/^[1-9][0-9]{9}$/.test(id)) {
      formatValid = false;
    }
  }
  assert(ids.size === 100, "Generates 100 unique IDs without collision");
  assert(
    formatValid,
    "All 100 generated IDs follow the correct 10-digit format without leading zeros",
  );

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

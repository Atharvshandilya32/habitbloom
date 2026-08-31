import { sanitizeCSVCell } from '../lib/rosterParser';

console.log('🧪 Starting Roster Parser Unit Test Suite...');

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

// 1. Test empty/falsy inputs
assert(sanitizeCSVCell('') === '', 'Returns empty string for empty input');
// @ts-ignore - testing runtime behavior with falsy inputs
assert(sanitizeCSVCell(null) === '', 'Returns empty string for null input');
// @ts-ignore
assert(sanitizeCSVCell(undefined) === '', 'Returns empty string for undefined input');

// 2. Test normal strings
assert(sanitizeCSVCell('Hello World') === 'Hello World', 'Returns normal string unchanged');
assert(sanitizeCSVCell('  Trim me  ') === 'Trim me', 'Trims whitespace');

// 3. Test stripping of quotes
assert(sanitizeCSVCell('"Double Quotes"') === 'Double Quotes', 'Strips leading and trailing double quotes');
assert(sanitizeCSVCell("'Single Quotes'") === 'Single Quotes', 'Strips leading and trailing single quotes');
assert(sanitizeCSVCell('"  Nested Quotes  "') === '  Nested Quotes  ', 'Strips quotes but inner spaces are not trimmed here');

// 4. Test stripping of leading formula injection characters
assert(sanitizeCSVCell('=1+1') === '1+1', 'Strips leading =');
assert(sanitizeCSVCell('+1+1') === '1+1', 'Strips leading +');
assert(sanitizeCSVCell('-1+1') === '1+1', 'Strips leading -');
assert(sanitizeCSVCell('@SUM(1,2)') === 'SUM(1,2)', 'Strips leading @');
assert(sanitizeCSVCell('\tHidden Tab') === 'Hidden Tab', 'Strips leading tab');
assert(sanitizeCSVCell('\rHidden Return') === 'Hidden Return', 'Strips leading carriage return');

// 5. Test stripping of multiple leading formula characters
assert(sanitizeCSVCell('==+@-1+1') === '1+1', 'Strips multiple leading formula characters');
assert(sanitizeCSVCell('  =-+@SUM(1,2)  ') === 'SUM(1,2)', 'Trims, then strips multiple leading characters');
assert(sanitizeCSVCell('"-=@SUM(1,2)"') === 'SUM(1,2)', 'Strips quotes, then multiple leading characters');

// 6. Test ensuring characters in the middle of the string are NOT stripped
assert(sanitizeCSVCell('Hello = World') === 'Hello = World', 'Does not strip = in the middle');
assert(sanitizeCSVCell('Test+User') === 'Test+User', 'Does not strip + in the middle');
assert(sanitizeCSVCell('test-user@email.com') === 'test-user@email.com', 'Does not strip - or @ in the middle');
assert(sanitizeCSVCell('Row1\tRow2') === 'Row1\tRow2', 'Does not strip tab in the middle');

console.log(`\n📊 Roster Parser Test Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

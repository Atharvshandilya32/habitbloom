import { parseCSVText, sanitizeCSVCell } from '../lib/rosterParser';

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

// 1. Empty CSV string guard
const emptyResult = parseCSVText('');
assert(emptyResult.total === 0, 'Empty CSV - total is 0');
assert(emptyResult.entries.length === 0, 'Empty CSV - entries is empty');
assert(emptyResult.errors.length === 1 && emptyResult.errors[0] === 'File is empty.', 'Empty CSV - correctly returns empty file error');

// 2. 2MB file size guard
const largeFile = 'a'.repeat(2 * 1024 * 1024 + 1);
const largeResult = parseCSVText(largeFile);
assert(largeResult.total === 0, 'Large file - total is 0');
assert(largeResult.entries.length === 0, 'Large file - entries is empty');
assert(largeResult.errors.length === 1 && largeResult.errors[0] === 'File size exceeds 2MB limit.', 'Large file - correctly returns size limit error');

// 3. Basic valid CSV string parsing handling id, name, email, role columns
const basicCSV = `id,name,email,role
123,John Doe,john@example.com,admin
456,Jane Doe,jane@example.com,member`;
const basicResult = parseCSVText(basicCSV);
assert(basicResult.total === 2, 'Basic CSV - total is 2');
assert(basicResult.entries.length === 2, 'Basic CSV - entries has 2 items');
assert(basicResult.entries[0].id === '123' && basicResult.entries[0].name === 'John Doe' && basicResult.entries[0].email === 'john@example.com' && basicResult.entries[0].roleId === 'admin', 'Basic CSV - first entry parsed correctly');
assert(basicResult.entries[1].id === '456' && basicResult.entries[1].name === 'Jane Doe' && basicResult.entries[1].email === 'jane@example.com' && basicResult.entries[1].roleId === 'member', 'Basic CSV - second entry parsed correctly');
assert(basicResult.errors.length === 0, 'Basic CSV - no errors');

// 4. Fallback when missing column headers for ID and Name
const missingHeadersCSV = `123,John Doe,john@example.com,admin
456,Jane Doe,jane@example.com,member`;
const missingHeadersResult = parseCSVText(missingHeadersCSV);
assert(missingHeadersResult.total === 1, 'Missing headers - total is 1 (first row is treated as header)');
assert(missingHeadersResult.entries[0].id === '456' && missingHeadersResult.entries[0].name === 'Jane Doe', 'Missing headers - fallback to 1st and 2nd column works');

// 5. Duplicate IDs limit
const duplicateCSV = `id,name
123,John
123,Jane
456,Bob`;
const duplicateResult = parseCSVText(duplicateCSV);
assert(duplicateResult.total === 2, 'Duplicate IDs - total is 2');
assert(duplicateResult.entries[0].name === 'John' && duplicateResult.entries[1].name === 'Bob', 'Duplicate IDs - correctly skips subsequent entries with the same ID');
assert(duplicateResult.errors.length === 1 && duplicateResult.errors[0].includes('Skipped duplicate ID in file: 123'), 'Duplicate IDs - adds correct error message');

// 6. Fallback name
const missingNameCSV = `id,name,email
123,,john@example.com`;
const missingNameResult = parseCSVText(missingNameCSV);
assert(missingNameResult.total === 1, 'Missing name - total is 1');
assert(missingNameResult.entries[0].name === 'Member 123', 'Missing name - fallback name is Member {cleanId}');

// 7. Secondary fields parsed correctly
const secondaryCSV = `id,name,department,location
123,John,Engineering,NY`;
const secondaryResult = parseCSVText(secondaryCSV);
assert(secondaryResult.total === 1, 'Secondary fields - total is 1');
assert(secondaryResult.entries[0].secondaryData !== undefined, 'Secondary fields - secondaryData is defined');
assert(secondaryResult.entries[0].secondaryData?.department === 'Engineering' && secondaryResult.entries[0].secondaryData?.location === 'NY', 'Secondary fields - correctly parsed into secondaryData');

// 8. Invalid rows skipped
const invalidCSV = `id,name
123,John

456,Jane
,Bob`;
const invalidResult = parseCSVText(invalidCSV);
assert(invalidResult.total === 2, 'Invalid rows - total is 2');
assert(invalidResult.entries[0].id === '123' && invalidResult.entries[1].id === '456', 'Invalid rows - skipped empty and missing ID rows');

// 9. Sanitization logic
const sanitizeCSV = `id,name
123,"=John"
456,'+Jane'
789,@Bob
012,-Alice`;
const sanitizeResult = parseCSVText(sanitizeCSV);
assert(sanitizeResult.entries[0].name === 'John', 'Sanitization - strips =');
assert(sanitizeResult.entries[1].name === 'Jane', 'Sanitization - strips +');
assert(sanitizeResult.entries[2].name === 'Bob', 'Sanitization - strips @');
assert(sanitizeResult.entries[3].name === 'Alice', 'Sanitization - strips -');

// 10. Test limits (guard for > 5001 lines)
let largeLinesCSV = 'id,name\n';
for (let i = 0; i < 5005; i++) {
  largeLinesCSV += `${i},Name ${i}\n`;
}
const largeLinesResult = parseCSVText(largeLinesCSV);
assert(largeLinesResult.total === 5000, 'Large lines limit - total is 5000');
assert(largeLinesResult.errors.length === 1 && largeLinesResult.errors[0].includes('File contains over 5,000 rows'), 'Large lines limit - adds correct error message');

console.log(`\n📊 Roster Parser Test Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

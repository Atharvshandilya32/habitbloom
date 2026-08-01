import { formatHbId } from '../lib/identityUtils';
import { parseCSVText, sanitizeCSVCell } from '../lib/rosterParser';
import { hasPermission } from '../lib/spacePermissions';
import { getTemplateForType } from '../lib/spaceTemplates';

/**
 * HabitBloom Domain Unit & Security Test Suite
 * Asserts enterprise security, CSV sanitization, RBAC permissions, and ID integrity.
 */
function runTests() {
  console.log('🧪 Starting HabitBloom Domain Unit & Security Test Suite...\n');
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

  // 1. HB-ID Formatting Test
  assert(formatHbId('1234567890') === '1234-5678-90', 'Formats 10-digit HB-ID correctly with hyphens');
  assert(formatHbId('short') === 'short', 'Gracefully handles fallback IDs');

  // 2. CSV Formula Injection Sanitization Tests
  assert(sanitizeCSVCell('=SUM(1,2)') === 'SUM(1,2)', 'Strips leading = formula injection');
  assert(sanitizeCSVCell('+123456') === '123456', 'Strips leading + formula injection');
  assert(sanitizeCSVCell('@CMD') === 'CMD', 'Strips leading @ formula injection');
  assert(sanitizeCSVCell('  "John Doe"  ') === 'John Doe', 'Trims whitespace and quotes correctly');

  // 3. Roster Parser Tests
  const csvText = `Admission No,Student Name,Email\n=1001,John Smith,john@school.edu\n1002,Jane Doe,jane@school.edu\n1001,Duplicate User,dup@school.edu`;
  const parsed = parseCSVText(csvText);
  assert(parsed.entries.length === 2, 'Parses valid rows and filters duplicates');
  assert(parsed.entries[0].id === '1001', 'Sanitizes and extracts clean org ID');
  assert(parsed.errors.length > 0, 'Captures duplicate row warnings');

  // 4. Role Permission Engine Tests
  const adminRole = { id: 'admin', name: 'Admin', permissions: { manageMembers: true, deleteSpace: true } };
  const memberRole = { id: 'member', name: 'Member', permissions: { manageMembers: false } };

  assert(hasPermission(adminRole, 'manageMembers') === true, 'Admin role has manageMembers permission');
  assert(hasPermission(memberRole, 'manageMembers') === false, 'Member role denied manageMembers permission');

  // 5. Template Role Generators
  const schoolRoles = getTemplateForType('school');
  assert(schoolRoles.some(r => r.name.toLowerCase().includes('teacher')), 'School template generates Teacher role');
  const gymRoles = getTemplateForType('gym');
  assert(gymRoles.some(r => r.name.toLowerCase().includes('trainer')), 'Gym template generates Trainer role');

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

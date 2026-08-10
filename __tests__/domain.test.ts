import { formatHbId } from '../lib/identityUtils';
import { parseCSVText, sanitizeCSVCell } from '../lib/rosterParser';
import { hasPermission } from '../lib/spacePermissions';
import { getTemplateForType, createPermissions } from '../lib/spaceTemplates';
import { getCurrentStreak } from '../lib/habitUtils';
import { getLevelFromXp } from '../lib/xpEngine';


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
  const adminRole = { id: 'admin', spaceId: 's1', name: 'Admin', description: 'Admin role', color: 'indigo-600', icon: 'shield', order: 1, permissions: createPermissions({ manageMembers: true, deleteSpace: true }) };
  const memberRole = { id: 'member', spaceId: 's1', name: 'Member', description: 'Member role', color: 'blue-500', icon: 'user', order: 2, permissions: createPermissions({ manageMembers: false }) };

  assert(hasPermission(adminRole, 'manageMembers') === true, 'Admin role has manageMembers permission');
  assert(hasPermission(memberRole, 'manageMembers') === false, 'Member role denied manageMembers permission');

  // 5. Template Role Generators
  const schoolRoles = getTemplateForType('school');
  assert(schoolRoles.some(r => r.name.toLowerCase().includes('teacher')), 'School template generates Teacher role');
  const gymRoles = getTemplateForType('gym');
  assert(gymRoles.some(r => r.name.toLowerCase().includes('trainer')), 'Gym template generates Trainer role');

  // 6. Habit Analytics & Streak Engine Tests
  const mockHabit = { id: 'h1', name: 'Exercise', emoji: '🏃', goal: 30, category: 'Health' };
  const mockLogs = {
    'h1_2026_8_1': true,
    'h1_2026_8_2': true,
  };
  const streak = getCurrentStreak(mockHabit, mockLogs, 2026, 8, 31, true);
  assert(typeof streak === 'number' && streak >= 0, 'Streak engine computes valid numeric streak count');

  // 7. XP Engine Tests
  assert(getLevelFromXp(0) === 1, 'XP Engine: 0 XP is level 1');
  assert(getLevelFromXp(99) === 1, 'XP Engine: 99 XP is level 1');
  assert(getLevelFromXp(100) === 2, 'XP Engine: 100 XP is level 2');
  assert(getLevelFromXp(299) === 2, 'XP Engine: 299 XP is level 2');
  assert(getLevelFromXp(300) === 3, 'XP Engine: 300 XP is level 3');
  assert(getLevelFromXp(1000) === 5, 'XP Engine: 1000 XP is level 5');

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();


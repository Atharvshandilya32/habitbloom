import { formatHbId } from '../lib/identityUtils';
import { parseCSVText, sanitizeCSVCell } from '../lib/rosterParser';
import { hasPermission } from '../lib/spacePermissions';
import { getTemplateForType, createPermissions } from '../lib/spaceTemplates';
import { getCurrentStreak, getWeeklyStats } from '../lib/habitUtils';


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

  // 7. Weekly Stats Tests
  // August 2026 starts on a Saturday (firstDayOfMonth = 6). Days in month: 31.
  // Weeks should be:
  // Week 1: 1-1 (1 day) - Saturday
  // Week 2: 2-8 (7 days)
  // Week 3: 9-15 (7 days)
  // Week 4: 16-22 (7 days)
  // Week 5: 23-29 (7 days)
  // Week 6: 30-31 (2 days)
  const mockHabit2 = { id: 'h2', name: 'Reading', emoji: '📚', goal: 30, category: 'Personal' };
  const weeklyMockLogs = {
    'h1_2026_8_1': true,
    'h1_2026_8_2': true, // Week 2
    'h2_2026_8_2': true, // Week 2
    'h1_2026_8_10': true, // Week 3
    'h2_2026_8_31': true, // Week 6
  };

  const weeklyStatsWithHabits = getWeeklyStats([mockHabit, mockHabit2], weeklyMockLogs, 2026, 8, 31);
  assert(weeklyStatsWithHabits.length === 6, 'getWeeklyStats calculates correct number of weeks for Aug 2026');
  assert(weeklyStatsWithHabits[0].label === '1-1', 'getWeeklyStats week 1 boundary is correct');
  assert(weeklyStatsWithHabits[0].possible === 2, 'getWeeklyStats week 1 possible is correct (1 day * 2 habits)');
  assert(weeklyStatsWithHabits[0].done === 1, 'getWeeklyStats week 1 done is correct (1 log)');
  assert(weeklyStatsWithHabits[0].pct === 50, 'getWeeklyStats week 1 pct is correct (50%)');

  assert(weeklyStatsWithHabits[1].label === '2-8', 'getWeeklyStats week 2 boundary is correct');
  assert(weeklyStatsWithHabits[1].possible === 14, 'getWeeklyStats week 2 possible is correct (7 days * 2 habits)');
  assert(weeklyStatsWithHabits[1].done === 2, 'getWeeklyStats week 2 done is correct (2 logs)');

  assert(weeklyStatsWithHabits[5].label === '30-31', 'getWeeklyStats week 6 boundary is correct');
  assert(weeklyStatsWithHabits[5].possible === 4, 'getWeeklyStats week 6 possible is correct (2 days * 2 habits)');
  assert(weeklyStatsWithHabits[5].done === 1, 'getWeeklyStats week 6 done is correct (1 log)');

  const weeklyStatsEmpty = getWeeklyStats([], weeklyMockLogs, 2026, 8, 31);
  assert(weeklyStatsEmpty.length === 6, 'getWeeklyStats works with 0 habits');
  assert(weeklyStatsEmpty[0].possible === 0, 'getWeeklyStats handles possible=0 with 0 habits');
  assert(weeklyStatsEmpty[0].pct === 0, 'getWeeklyStats handles pct=0 with 0 habits to avoid division by zero');

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();


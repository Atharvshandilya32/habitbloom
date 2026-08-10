import { getXpToNextLevel } from '../lib/storyEngine';

console.log('🧪 Starting storyEngine Unit Test Suite...\n');
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

// XP Calculation Tests for getXpToNextLevel(xp, currentLevel)
// Formula: nextLevelXp = currentLevel * (currentLevel + 1) * 50; return nextLevelXp - xp;

// Level 1: nextLevelXp = 1 * 2 * 50 = 100 XP
assert(getXpToNextLevel(0, 1) === 100, 'Calculates 100 XP to next level from 0 XP at Level 1');
assert(getXpToNextLevel(50, 1) === 50, 'Calculates 50 XP to next level from 50 XP at Level 1');
assert(getXpToNextLevel(100, 1) === 0, 'Calculates 0 XP to next level from 100 XP at Level 1');
assert(getXpToNextLevel(120, 1) === -20, 'Calculates -20 XP to next level from 120 XP at Level 1 (Negative Delta)');

// Level 2: nextLevelXp = 2 * 3 * 50 = 300 XP
assert(getXpToNextLevel(100, 2) === 200, 'Calculates 200 XP to next level from 100 XP at Level 2');
assert(getXpToNextLevel(250, 2) === 50, 'Calculates 50 XP to next level from 250 XP at Level 2');
assert(getXpToNextLevel(300, 2) === 0, 'Calculates 0 XP to next level from 300 XP at Level 2');
assert(getXpToNextLevel(350, 2) === -50, 'Calculates -50 XP to next level from 350 XP at Level 2 (Negative Delta)');

// Level 3: nextLevelXp = 3 * 4 * 50 = 600 XP
assert(getXpToNextLevel(300, 3) === 300, 'Calculates 300 XP to next level from 300 XP at Level 3');
assert(getXpToNextLevel(550, 3) === 50, 'Calculates 50 XP to next level from 550 XP at Level 3');
assert(getXpToNextLevel(650, 3) === -50, 'Calculates -50 XP to next level from 650 XP at Level 3 (Negative Delta)');

// Edge cases
assert(getXpToNextLevel(0, 0) === 0, 'Calculates 0 XP to next level from 0 XP at Level 0');
assert(getXpToNextLevel(0, -1) === 0, 'Handles negative levels returning 0 (Level -1)');
assert(getXpToNextLevel(-50, 1) === 150, 'Handles negative XP input (e.g. penalty) returning > max Level XP (150)');

console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
}

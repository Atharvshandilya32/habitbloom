import { calculateHabitDna } from '../lib/habitDnaUtils';
import { calculateBloomScore } from '../lib/bloomScoreUtils';
import { calculateFutureProjections } from '../lib/projectionUtils';
import { generateHabitWrapped } from '../lib/wrappedUtils';
import { Habit, HabitLog } from '../lib/habitTypes';

console.log('🧪 Starting Master Features Unit Test Suite...');

const sampleHabits: Habit[] = [
  { id: 'h1', name: 'Morning Run', emoji: '🏃', goal: 20, category: '🏃 Fitness' },
  { id: 'h2', name: 'Read Book', emoji: '📚', goal: 15, category: '📚 Learning' },
];

const sampleLogs: HabitLog = {
  'h1_2026_8_1': true,
  'h1_2026_8_2': true,
  'h1_2026_8_3': true,
  'h2_2026_8_1': true,
};

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

// 1. Habit DNA Test
const dna = calculateHabitDna(sampleHabits, sampleLogs, 2026, 8);
assert(dna.activeHabitsCount === 2, 'Habit DNA correctly counts active habits');
assert(dna.totalCompletions === 4, 'Habit DNA correctly tallies completion logs');
assert(dna.categoryBalances.length > 0, 'Habit DNA extracts category breakdown');

// 2. Bloom Score Test
const bloom = calculateBloomScore(sampleHabits, sampleLogs, 2026, 8);
assert(bloom.totalBloomScore >= 0 && bloom.totalBloomScore <= 1000, 'Bloom score within 0-1000 bounds');
assert(bloom.tier.name !== undefined, 'Bloom score assigns valid tier object');

// 3. Future Projection Test
const proj = calculateFutureProjections(sampleHabits, sampleLogs, '90d', bloom.totalBloomScore, 2026, 8);
assert(proj.daysHorizon === 90, 'Future projection respects timeframe days horizon');
assert(proj.habitProjections.length === 2, 'Future projection computes forecasts for all habits');

// 4. Habit Wrapped Data Object Test
const wrapped = generateHabitWrapped(sampleHabits, sampleLogs, 2026, 8);
assert(wrapped.totalCompletions > 0, 'Wrapped summary calculates total completions');
assert(wrapped.slides.length >= 5, 'Habit Wrapped generates complete slide deck');

console.log(`\n📊 Master Features Test Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

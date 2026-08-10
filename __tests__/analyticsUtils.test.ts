import { calculateWeeklyReview } from '../lib/analyticsUtils';
import { Habit, HabitLog } from '../lib/habitTypes';

console.log('🧪 Starting Analytics Utils Unit Test Suite...');

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

function runTests() {
  const sampleHabits: Habit[] = [
    { id: 'h1', name: 'Morning Run', emoji: '🏃', goal: 20, category: '🏃 Fitness' },
    { id: 'h2', name: 'Read Book', emoji: '📚', goal: 15, category: '📚 Learning' },
  ];

  // Ref date: Aug 12, 2026 (Wednesday)
  // Current Week: Mon Aug 10 - Sun Aug 16
  // Previous Week: Mon Aug 3 - Sun Aug 9
  const refDate = new Date(2026, 7, 12); // Months are 0-indexed in JS (7 = August)

  const sampleLogs: HabitLog = {
    // Current Week Logs (Aug 10 - Aug 16)
    'h1_2026_8_10': true, // Mon
    'h1_2026_8_11': true, // Tue
    'h2_2026_8_11': true, // Tue
    'h1_2026_8_12': true, // Wed

    // Previous Week Logs (Aug 3 - Aug 9)
    'h1_2026_8_3': true, // Mon
    'h2_2026_8_3': true, // Mon
    'h2_2026_8_4': true, // Tue
    'h2_2026_8_5': true, // Wed
    'h2_2026_8_6': true, // Thu
  };

  const review = calculateWeeklyReview(sampleHabits, sampleLogs, refDate);

  // Assertions for WeeklyReviewSummary
  assert(review.totalPossible === 14, 'Total possible is 14 (7 days * 2 habits)');
  assert(review.totalCompleted === 4, 'Total completed in current week is 4');

  const expectedCompletionRate = Math.round((4 / 14) * 100);
  assert(review.completionRate === expectedCompletionRate, `Completion rate is ${expectedCompletionRate}%`);

  const expectedPrevRate = Math.round((5 / 14) * 100);
  assert(review.prevWeekCompletionRate === expectedPrevRate, `Previous week completion rate is ${expectedPrevRate}%`);

  assert(review.improvementDelta === expectedCompletionRate - expectedPrevRate, 'Improvement delta is calculated correctly');

  assert(review.dailyBreakdown.length === 7, 'Daily breakdown has 7 days');

  assert(review.mostProductiveDay === 'Tuesday', 'Most productive day is Tuesday (2 habits completed)');

  assert(review.bestHabit !== null && review.bestHabit.name === 'Morning Run', 'Best habit is Morning Run (3 completions)');
  assert(review.weakestHabit !== null && review.weakestHabit.name === 'Read Book', 'Weakest habit is Read Book (1 completion)');

  console.log(`\n📊 Analytics Utils Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();

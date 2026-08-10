import { isWeeklyGoalActive, CustomWritingGoal } from '../lib/customWritingGoals';

const OriginalDate = global.Date;
class MockDate extends OriginalDate {
  constructor(...args: any[]) {
    if (args.length === 0) {
      super('2023-10-25T12:00:00Z'); // Current mocked date: 2023-10-25 (Wednesday)
    } else {
      // @ts-ignore
      super(...args);
    }
  }
}
global.Date = MockDate as any;

console.log('🧪 Starting Custom Writing Goals Unit Test Suite...\n');
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

const activeWeeklyGoal: CustomWritingGoal = {
  id: 'g1',
  type: 'weekly',
  content: 'Active weekly goal',
  startDate: '2023-10-23', // Monday
  endDate: '2023-10-29',   // Sunday
  createdAt: '2023-10-23T00:00:00.000Z',
};

const pastWeeklyGoal: CustomWritingGoal = {
  id: 'g2',
  type: 'weekly',
  content: 'Past weekly goal',
  startDate: '2023-10-16',
  endDate: '2023-10-22',
  createdAt: '2023-10-16T00:00:00.000Z',
};

const futureWeeklyGoal: CustomWritingGoal = {
  id: 'g3',
  type: 'weekly',
  content: 'Future weekly goal',
  startDate: '2023-10-30',
  endDate: '2023-11-05',
  createdAt: '2023-10-30T00:00:00.000Z',
};

const monthlyGoal: CustomWritingGoal = {
  id: 'g4',
  type: 'monthly',
  content: 'Monthly goal',
  startDate: '2023-10-01',
  endDate: '2023-10-31',
  createdAt: '2023-10-01T00:00:00.000Z',
};

assert(
  isWeeklyGoalActive(activeWeeklyGoal) === true,
  'isWeeklyGoalActive returns true for a weekly goal whose period includes the current date'
);

assert(
  isWeeklyGoalActive(pastWeeklyGoal) === false,
  'isWeeklyGoalActive returns false for a weekly goal whose period ended before the current date'
);

assert(
  isWeeklyGoalActive(futureWeeklyGoal) === false,
  'isWeeklyGoalActive returns false for a weekly goal whose period begins after the current date'
);

assert(
  isWeeklyGoalActive(monthlyGoal) === false,
  'isWeeklyGoalActive returns false if goal.type is not weekly'
);

console.log(`\n📊 Custom Writing Goals Test Results: ${passed} passed, ${failed} failed.`);
global.Date = OriginalDate;

if (failed > 0) {
  process.exit(1);
}

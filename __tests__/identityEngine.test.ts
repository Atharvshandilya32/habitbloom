import { generateUserIdentity } from '../lib/identityEngine';
import { Habit, HabitLog } from '../lib/habitTypes';
import { makeLogKey } from '../lib/habitUtils';

function runTests() {
  console.log('🧪 Starting HabitBloom Identity Engine Test Suite...\n');
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

  // Use a fixed date so that tests are strictly deterministic
  const fixedDate = new Date('2026-08-31T12:00:00Z');
  const OriginalDate = Date;
  global.Date = class extends OriginalDate {
    constructor(...args: any[]) {
      if (args.length) {
        // @ts-ignore
        super(...args);
      } else {
        // @ts-ignore
        super(fixedDate);
      }
    }
    static now() {
      return fixedDate.getTime();
    }
  } as any;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  // Helper to generate logs for a habit
  function generateLogs(habitId: string, daysBack: number, skipPattern: (date: Date) => boolean = () => false): HabitLog {
    const logs: HabitLog = {};
    const startDate = new Date();
    for (let i = 0; i < daysBack; i++) {
      const d = new Date(startDate.getTime() - i * 24 * 60 * 60 * 1000);
      if (!skipPattern(d)) {
        logs[makeLogKey(habitId, d.getFullYear(), d.getMonth() + 1, d.getDate())] = true;
      }
    }
    return logs;
  }

  // 1. Empty Habits -> New Seed
  let identity = generateUserIdentity([], {});
  assert(identity.id === 'new-seed', 'Empty habits returns New Seed (bronze)');

  // 2. Platinum Tier: Discipline Keeper (avgPct >= 95 and maxStreak > 30)
  let habit: Habit = { id: 'h1', name: 'Workout', emoji: '🏋️', goal: 1, category: 'Health' };
  let logs = generateLogs('h1', 40); // 40 days of perfect logs
  identity = generateUserIdentity([habit], logs);
  assert(identity.id === 'discipline-keeper', 'Perfect consistency returns Discipline Keeper (platinum)');

  // 3. Gold Tier: Morning Architect (morning habits done & avgPct > 75)
  habit = { id: 'h2', name: 'Morning Run', emoji: '🏃', goal: 1, category: 'Health' };
  logs = generateLogs('h2', 30, (d) => d.getDate() % 5 === 0); // Skip some days to get ~80% avgPct, < 95%
  identity = generateUserIdentity([habit], logs);
  assert(identity.id === 'morning-architect', 'Consistent morning habit returns Morning Architect (gold)');

  // 4. Gold Tier: Weekend Warrior (weekendRate > 85 & avgPct > 60)
  habit = { id: 'h3', name: 'Side Hustle', emoji: '💻', goal: 1, category: 'Work' };
  // Only do it on weekends + maybe one weekday, to get avgPct > 60 (if we assume a month of ~30 days, we need ~19 days done)
  // To keep it simple, let's just make it ~65% overall but 100% on weekends.
  logs = generateLogs('h3', 30, (d) => {
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    if (isWeekend) return false; // don't skip weekends
    return d.getDate() % 2 === 0; // skip half of weekdays
  });
  identity = generateUserIdentity([habit], logs);
  assert(identity.id === 'weekend-warrior', 'High weekend rate with good consistency returns Weekend Warrior (gold)');

  // 5. Gold Tier: Focused Learner (learning habits done & avgPct > 60)
  habit = { id: 'h4', name: 'Read a book', emoji: '📖', goal: 1, category: 'Learning' };
  logs = generateLogs('h4', 30, (d) => d.getDate() % 3 === 0); // Skip 1/3 of days -> ~66% avgPct
  identity = generateUserIdentity([habit], logs);
  assert(identity.id === 'focused-learner', 'Consistent learning habit returns Focused Learner (gold)');

  // 6. Silver Tier: Night Owl (evening habits done)
  // Needs evening habit done (>70% pct) but avgPct < 60 to avoid higher tiers. Wait, if avgPct < 60, does evening habit reach >70%?
  // Ah! If we only have ONE habit, its pct IS the avgPct.
  // To have avgPct < 60 but evening habit done (>70%), we need MULTIPLE habits.
  const habitEvening: Habit = { id: 'h5', name: 'Night routine', emoji: '🌙', goal: 1, category: 'Health' };
  const habitDud: Habit = { id: 'h6', name: 'Dud', emoji: '🤷', goal: 1, category: 'Health' };
  logs = generateLogs('h5', 30, (d) => d.getDate() % 4 === 0); // h5 done ~75%
  // h6 has 0 logs.
  // avgPct = (75 + 0) / 2 = ~37.5%
  identity = generateUserIdentity([habitEvening, habitDud], logs);
  assert(identity.id === 'night-owl', 'Consistent evening habit with lower overall avg returns Night Owl (silver)');

  // 7. Silver Tier: Momentum Master (maxStreak >= 14)
  habit = { id: 'h7', name: 'Any', emoji: '✅', goal: 1, category: 'Health' };
  // streak of 15, then empty.
  logs = generateLogs('h7', 15);
  // Avg pct will be ~15/30 = 50%.
  identity = generateUserIdentity([habit], logs);
  assert(identity.id === 'momentum-master', '14+ day streak returns Momentum Master (silver)');

  // 8. Silver Tier: Consistency Builder (avgPct >= 60)
  habit = { id: 'h8', name: 'Any', emoji: '✅', goal: daysInMonth, category: 'Health' };
  logs = {};
  for(let day = 1; day <= Math.ceil(daysInMonth * 0.65); day++) {
      // log days early in month to break current streak but keep avgPct > 60
      logs[makeLogKey('h8', year, month, day)] = true;
  }
  identity = generateUserIdentity([habit], logs);
  assert(identity.id === 'consistency-builder', '60%+ avg pct returns Consistency Builder (silver)');

  // 9. Bronze Tier: Focus Gardener (low stats)
  habit = { id: 'h9', name: 'Any', emoji: '✅', goal: daysInMonth, category: 'Health' };
  logs = {};
  for(let day = 1; day <= Math.ceil(daysInMonth * 0.2); day++) {
      logs[makeLogKey('h9', year, month, day)] = true;
  }
  identity = generateUserIdentity([habit], logs);
  assert(identity.id === 'focus-gardener', 'Low stats returns Focus Gardener (bronze)');


  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

const getXpRequiredForLevelLoop = (level: number) => {
  let xp = 0;
  for (let i = 1; i < level; i++) {
    xp += i * (i + 1) * 50;
  }
  return xp;
};

const getXpRequiredForLevelMath = (level: number) => {
  if (level <= 1) return 0;
  return (50 * (level - 1) * level * (level + 1)) / 3;
};

// Benchmark
const levelsToTest = [10, 50, 100, 500, 1000, 5000, 10000];
const iterations = 100000;

console.log("Benchmarking getXpRequiredForLevel...");

for (const level of levelsToTest) {
  console.log(`\nTesting Level: ${level}, Iterations: ${iterations}`);

  const startLoop = performance.now();
  let resultLoop = 0;
  for (let i = 0; i < iterations; i++) {
    resultLoop = getXpRequiredForLevelLoop(level);
  }
  const endLoop = performance.now();
  const timeLoop = endLoop - startLoop;

  const startMath = performance.now();
  let resultMath = 0;
  for (let i = 0; i < iterations; i++) {
    resultMath = getXpRequiredForLevelMath(level);
  }
  const endMath = performance.now();
  const timeMath = endMath - startMath;

  console.log(`Loop result: ${resultLoop}, time: ${timeLoop.toFixed(4)}ms`);
  console.log(`Math result: ${resultMath}, time: ${timeMath.toFixed(4)}ms`);
  console.log(`Improvement: ${(timeLoop / (timeMath || 0.0001)).toFixed(2)}x faster`);

  if (resultLoop !== resultMath) {
    console.error(`ERROR: Results do not match for level ${level}! Loop: ${resultLoop}, Math: ${resultMath}`);
    process.exit(1);
  }
}

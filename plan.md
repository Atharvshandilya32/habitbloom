1. **Understand the Testing Gap**: The `initOfflineSync` function in `lib/offlineSyncEngine.ts` lacks test coverage.
2. **Determine the Testing Approach**: Since `lib/offlineSyncEngine.ts` interacts with `window` and `localStorage`, and we need to mock Firebase and `localStorage`, we should write a Vitest test in `__tests__/offlineSyncEngine.test.ts`. Wait, we can test it using the `tsx` pure logic approach if we can mock the `window` object or we can use `vitest` which allows better mocking of imports (like `replayMutations`). We should use `vitest` because `replayMutations` relies on `navigator.onLine`, `database`, `auth`, etc.
3. **Write the Test Case**:
   - Mock `window.addEventListener`.
   - Mock `replayMutations`. We might need to extract `replayMutations` to another file or spy on it if we mock the module. Since `initOfflineSync` calls `replayMutations` which is exported from the same module, mocking it directly via `vi.spyOn` or `vi.mock` might be tricky because it's a same-module call. Let's see how `initOfflineSync` is structured.
   - `initOfflineSync` is in `lib/offlineSyncEngine.ts`.
   - The test should verify:
     - It checks if `window` is defined before attaching an event listener.
     - It attaches an 'online' event listener to `window`.
     - It calls `replayMutations` when the 'online' event is triggered.
     - It also tries to call `replayMutations` immediately if `navigator.onLine` is true at startup.
4. **Implementation Details**:
   - Create `__tests__/offlineSyncEngine.test.ts`.
   - Setup `vi.mock('./lib/firebase')` to avoid Firebase initialization errors.
   - Use `vitest` to mock `navigator.onLine` and `window.addEventListener`.
   - Because `initOfflineSync` calls `replayMutations` from the same file, testing that `replayMutations` is called can be done by replacing the implementation of `replayMutations` or just checking if `isReplaying` gets set (but `isReplaying` is not exported), or we could mock `localStorage` and see if `getQueue()` or similar is called, or mock `database/auth` and see if it tries to replay.
   - Wait, `replayMutations` is exported. We can spy on it: `vi.spyOn(offlineSync, 'replayMutations')`. However, ES6 module same-file calls usually don't trigger the spy unless called via `exports.replayMutations()`. Let's test by checking if `queueMutation` and `replayMutations` are functioning, but the task specifically asks for testing `initOfflineSync`.
   - If we can't easily spy on `replayMutations` due to ES module behavior, we can setup a mock queue in `localStorage`, set `navigator.onLine` to true, mock `auth` and `database`, and observe if `set` or `update` (from `firebase/database`) is called! That would be an integration test of `initOfflineSync`.
5. **Add to `package.json`**: Append `&& npx vitest run __tests__/offlineSyncEngine.test.ts` to the `test` script in `package.json` using a Node.js script to avoid parse errors.
6. **Pre-commit Steps**: Call `pre_commit_instructions` and follow them.
7. **Submit**: Submit the branch with testing improvement PR.

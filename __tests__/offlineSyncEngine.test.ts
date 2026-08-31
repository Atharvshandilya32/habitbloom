import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initOfflineSync } from '../lib/offlineSyncEngine';
import { set, update } from 'firebase/database';

// Mock Firebase Realtime Database
vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
}));

// Mock our custom Firebase configuration wrapper
vi.mock('../lib/firebase', () => ({
  database: {},
  auth: { currentUser: { uid: 'test-user-123' } },
}));

describe('initOfflineSync', () => {
    let addEventListenerSpy: any;
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock localStorage
    mockStorage = {};
    const localStorageMock = {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
      removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
      clear: vi.fn(() => { mockStorage = {}; })
    };
    vi.stubGlobal('localStorage', localStorageMock);

    // Mock window.addEventListener
    addEventListenerSpy = vi.fn();
    vi.stubGlobal('window', {
      ...globalThis.window,
      addEventListener: addEventListenerSpy
    });

    // Save and mock navigator.onLine
    vi.stubGlobal('navigator', {
      ...globalThis.navigator,
      onLine: false
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('attaches an "online" event listener to window', () => {
    initOfflineSync();
    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
  });

  it('immediately replays mutations if navigator.onLine is true at startup', async () => {
    // Setup navigator to be online
    vi.stubGlobal('navigator', {
      ...globalThis.navigator,
      onLine: true
    });

    // Queue a mutation manually in the mocked localStorage
    mockStorage['habitbloom_offline_queue'] = JSON.stringify([
      {
        id: 'mut_test_123',
        timestamp: Date.now(),
        type: 'set',
        path: 'test/path',
        data: { value: 42 }
      }
    ]);

    initOfflineSync();

    // wait for async replayMutations to complete
    await new Promise(process.nextTick);

    expect(set).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledWith(undefined, { value: 42 }); // dbRef is undefined because of mock returning undefined, but the call is what matters
  });

  it('replays mutations when the "online" event is triggered', async () => {
    initOfflineSync();

    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    const onlineHandler = addEventListenerSpy.mock.calls.find((call: any[]) => call[0] === 'online')[1];

    // Ensure we are online before triggering handler
    vi.stubGlobal('navigator', {
      ...globalThis.navigator,
      onLine: true
    });

    // Add a mutation to queue
    mockStorage['habitbloom_offline_queue'] = JSON.stringify([
      {
        id: 'mut_test_456',
        timestamp: Date.now(),
        type: 'update',
        path: 'test/path2',
        data: { count: 1 }
      }
    ]);

    // Trigger the online event handler
    onlineHandler();

    // wait for async replayMutations to complete
    await new Promise(process.nextTick);

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(undefined, { count: 1 });
  });
});

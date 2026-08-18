import { describe, it, expect, vi, afterEach } from 'vitest';
import { getUserPlan } from '../lib/featureAccess';
import { get } from 'firebase/database';

// Mock Firebase dependencies
vi.mock('firebase/database', () => {
  return {
    ref: vi.fn(),
    get: vi.fn(),
  };
});

vi.mock('../lib/firebase', () => {
  return {
    database: {},
  };
});

describe('getUserPlan', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return FREE and log a warning when fetching user plan fails', async () => {
    // Spy on console.warn
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Make get() reject to simulate a database failure
    const mockError = new Error('Firebase permission denied');
    vi.mocked(get).mockRejectedValue(mockError);

    // Mock an authenticated user
    const mockUser = { uid: 'test-user-123' } as any;

    // Call the function
    const result = await getUserPlan(mockUser);

    // Assert the fallback behavior
    expect(result).toBe('FREE');

    // Assert the error was handled and logged
    expect(consoleSpy).toHaveBeenCalledWith('Deferred fetching user plan:', mockError);

    // Clean up spy
    consoleSpy.mockRestore();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadRosterToSpace } from '../lib/rosterParser';
import { set, ref } from 'firebase/database';
import { database } from '../lib/firebase';
import { logAuditEvent } from '../lib/auditLogger';
import { RosterEntry } from '../lib/identityTypes';

vi.mock('firebase/database', () => ({
  set: vi.fn(),
  ref: vi.fn((db, path) => path),
}));

// We use an object to allow us to mutate properties for specific tests
const mockFirebase = {
  database: {} as any
};

vi.mock('../lib/firebase', () => ({
  get database() {
    return mockFirebase.database;
  }
}));

vi.mock('../lib/auditLogger', () => ({
  logAuditEvent: vi.fn(),
}));

describe('uploadRosterToSpace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFirebase.database = {}; // Reset database state
  });

  const mockActor = { id: 'actor-1', name: 'Admin User' };

  const mockEntries: RosterEntry[] = [
    { id: '1', name: 'John Doe', createdAt: '2023-01-01', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', createdAt: '2023-01-02' },
  ];

  it('should successfully upload roster entries and log audit event (Happy Path)', async () => {
    (set as any).mockResolvedValueOnce(undefined).mockResolvedValueOnce(undefined);
    (logAuditEvent as any).mockResolvedValueOnce(undefined);

    const result = await uploadRosterToSpace('space-123', mockEntries, mockActor);

    expect(result).toBe(true);
    expect(ref).toHaveBeenCalledTimes(2);
    // Note: since database is an empty object, it is passed down
    expect(ref).toHaveBeenNthCalledWith(1, mockFirebase.database, 'spaceRosters/space-123/1');
    expect(ref).toHaveBeenNthCalledWith(2, mockFirebase.database, 'spaceRosters/space-123/2');

    expect(set).toHaveBeenCalledTimes(2);
    expect(set).toHaveBeenNthCalledWith(1, 'spaceRosters/space-123/1', mockEntries[0]);
    expect(set).toHaveBeenNthCalledWith(2, 'spaceRosters/space-123/2', mockEntries[1]);

    expect(logAuditEvent).toHaveBeenCalledTimes(1);
    expect(logAuditEvent).toHaveBeenCalledWith(
      'space-123',
      mockActor,
      { id: 'ROSTER', name: 'Organization Roster' },
      'ROSTER_UPLOAD',
      'Uploaded 2 roster entries'
    );
  });

  it('should return false if database is not initialized', async () => {
    // Temporarily mock database to undefined for this test
    mockFirebase.database = undefined;

    const result = await uploadRosterToSpace('space-123', mockEntries, mockActor);

    expect(result).toBe(false);
    expect(set).not.toHaveBeenCalled();
  });

  it('should return false if spaceId is missing', async () => {
    const result = await uploadRosterToSpace('', mockEntries, mockActor);

    expect(result).toBe(false);
    expect(set).not.toHaveBeenCalled();
  });

  it('should return false if entries array is empty', async () => {
    const result = await uploadRosterToSpace('space-123', [], mockActor);

    expect(result).toBe(false);
    expect(set).not.toHaveBeenCalled();
  });

  it('should handle errors during upload and return false', async () => {
    const error = new Error('Database write failed');
    (set as any).mockRejectedValueOnce(error);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await uploadRosterToSpace('space-123', mockEntries, mockActor);

    expect(result).toBe(false);
    expect(set).toHaveBeenCalledTimes(1); // Fails on the first one
    expect(logAuditEvent).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to upload roster to space:', error);

    consoleSpy.mockRestore();
  });
});

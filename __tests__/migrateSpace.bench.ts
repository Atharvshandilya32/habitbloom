import { migrateLegacySpace } from '../lib/migrateSpace';
import { Space, SpaceMember } from '../lib/spaceTypes';
import { get, set, update } from 'firebase/database';

jest.mock('firebase/database', () => ({
  ref: jest.fn().mockImplementation((db, path) => path || 'ref'),
  child: jest.fn().mockImplementation((ref, path) => `child_${path}`),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn()
}));

jest.mock('../lib/firebase', () => ({
  database: {}
}));

describe('Performance benchmark: migrateLegacySpace', () => {
  let consoleLogMock: any;
  let consoleErrorMock: any;

  beforeAll(() => {
    consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleLogMock.mockRestore();
    consoleErrorMock.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should measure time to migrate space with 1000 members', async () => {
    const space: Space = {
      id: 'space1',
      name: 'Test Space',
      type: 'community',
      schemaVersion: 1,
      createdAt: Date.now()
    };

    // Generate 1000 members
    const members: Record<string, SpaceMember> = {};
    for (let i = 0; i < 1000; i++) {
      members[`member${i}`] = {
        id: `member${i}`,
        spaceId: 'space1',
        userId: `user${i}`,
        role: 'member',
        joinedAt: Date.now(),
        roleId: ''
      };
    }

    (get as jest.Mock).mockResolvedValue({
      exists: () => true,
      val: () => members
    });

    const start = performance.now();
    const result = await migrateLegacySpace(space);
    const end = performance.now();

    expect(result).toBe(true);

    // Check how many calls were made to `set`
    const setCallCount = (set as jest.Mock).mock.calls.length;
    // Check how many calls were made to `update`
    const updateCallCount = (update as jest.Mock).mock.calls.length;

    console.warn(`Time taken: ${end - start} ms`);
    console.warn(`Set calls: ${setCallCount}`);
    console.warn(`Update calls: ${updateCallCount}`);
  });
});

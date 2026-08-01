import { Space, SpaceInvite, SpaceMember, SpaceType } from './spaceTypes';

export function generateInviteCode(): string {
  // Generates a random alphanumeric code of length 8
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function createNewSpace(
  name: string,
  description: string,
  type: SpaceType,
  userId: string
): { space: Space; member: SpaceMember } {
  const spaceId = `space-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const space: Space = {
    id: spaceId,
    name,
    description,
    type,
    createdBy: userId,
    createdAt: now,
  };

  const member: SpaceMember = {
    spaceId,
    userId,
    role: 'admin',
    joinedAt: now,
  };

  return { space, member };
}

export function generateSpaceInvite(spaceId: string, userId: string): SpaceInvite {
  const code = generateInviteCode();
  return {
    id: `invite-${Date.now()}`,
    spaceId,
    code,
    createdBy: userId,
    createdAt: new Date().toISOString(),
    uses: 0,
  };
}

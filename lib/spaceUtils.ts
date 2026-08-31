import { Space, SpaceInvite, SpaceMember, SpaceType } from "./spaceTypes";

export function generateInviteCode(): string {
  // Generates a random alphanumeric code of length 8 using a CSPRNG
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const randomValues = new Uint8Array(1);

  while (result.length < 8) {
    crypto.getRandomValues(randomValues);
    const val = randomValues[0];
    // 252 is the largest multiple of 36 (chars.length) less than 256.
    // This avoids modulo bias.
    if (val < 252) {
      result += chars[val % chars.length];
    }
  }
  return result;
}

export function createNewSpace(
  name: string,
  description: string,
  type: SpaceType,
  userId: string,
): { space: Space; member: SpaceMember } {
  const spaceId = `space-${Date.now()}-${crypto.randomUUID()}`;
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
    roleId: "", // Will be assigned during migration or backend trigger
    role: "admin",
    joinedAt: now,
  };

  return { space, member };
}

export function generateSpaceInvite(
  spaceId: string,
  userId: string,
): SpaceInvite {
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

export type SpaceRole = 'admin' | 'member' | 'coach';

export type SpaceType = 'gym' | 'school' | 'company' | 'family' | 'community' | 'other';

export interface Space {
  id: string;
  name: string;
  description: string;
  type: SpaceType;
  createdBy: string; // userId
  createdAt: string; // ISO timestamp
  branding?: {
    logoUrl?: string;
    coverUrl?: string;
    themeColor?: string;
  };
}

export interface SpaceMember {
  spaceId: string;
  userId: string;
  role: SpaceRole;
  joinedAt: string; // ISO timestamp
}

export interface SpaceInvite {
  id: string; // unique invite code
  spaceId: string;
  code: string;
  createdBy: string;
  createdAt: string;
  expiresAt?: string; // Optional expiration
  maxUses?: number; // Optional limit
  uses: number;
}

// These will be expanded in Phase 4B
export interface SpaceHabit {
  id: string;
  spaceId: string;
  name: string;
  emoji: string;
  category: string;
  description?: string;
}

export interface SpaceChallenge {
  id: string;
  spaceId: string;
  title: string;
  description: string;
  totalDays: number;
  startDate: string;
  endDate?: string;
}

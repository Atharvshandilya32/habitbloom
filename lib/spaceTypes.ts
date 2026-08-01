export type SpaceRole = 'owner' | 'admin' | 'coach' | 'moderator' | 'member';

export type SpaceType = 'gym' | 'school' | 'company' | 'family' | 'community' | 'other';

export interface SpaceBranding {
  logoUrl?: string;
  coverUrl?: string;
  themeColor?: string;
  welcomeMessage?: string;
}

export interface Space {
  id: string;
  name: string;
  description: string;
  type: SpaceType;
  createdBy: string; // userId
  createdAt: string; // ISO timestamp
  branding?: SpaceBranding;
  features?: {
    analytics?: boolean;
    aiReports?: boolean;
    advancedChallenges?: boolean;
    maxMembers?: number;
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

export interface SpaceAnnouncement {
  id: string;
  spaceId: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string; // ISO timestamp
  isPinned: boolean;
}

export interface SpaceHabitTemplate {
  id: string;
  spaceId: string;
  name: string;
  emoji: string;
  category: string;
  description?: string;
  createdBy: string;
}

export type SpaceChallengeType = '7-day' | '21-day' | 'custom';

export interface SpaceChallenge {
  id: string;
  spaceId: string;
  title: string;
  description: string;
  type: SpaceChallengeType;
  totalDays: number;
  startDate: string; // ISO timestamp
  endDate?: string;
  createdBy: string;
  participants: string[]; // userIds
  rewards?: string; // e.g., badge name or points
}

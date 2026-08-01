export type SpaceType = 'gym' | 'school' | 'college' | 'coaching_institute' | 'yoga_studio' | 'sports_academy' | 'company' | 'community' | 'family' | 'custom' | 'other';

export interface SpaceBranding {
  logoUrl?: string;
  coverUrl?: string;
  themeColor?: string;
  welcomeMessage?: string;
}

export interface Space {
  id: string;
  schemaVersion?: number;
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

export interface SpacePermissions {
  manageMembers: boolean;
  inviteMembers: boolean;
  approveJoinRequests: boolean;
  createChallenges: boolean;
  editChallenges: boolean;
  deleteChallenges: boolean;
  manageTemplates: boolean;
  sendAnnouncements: boolean;
  manageBranding: boolean;
  manageRoles: boolean;
  manageBilling: boolean;
  viewAnalytics: boolean;
  deleteSpace: boolean;
}

export interface CustomRole {
  id: string; // unique role ID, e.g. 'role-admin-123'
  spaceId: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  permissions: SpacePermissions;
  order: number; // For UI sorting
}

export interface SpaceMember {
  spaceId: string;
  userId: string;
  roleId: string;
  role?: string; // Legacy string role, optional for backward compatibility during migration
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

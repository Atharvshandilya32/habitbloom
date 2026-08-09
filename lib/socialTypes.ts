export type UserOnlineStatus = 'online' | 'away' | 'offline';

export type PrivacyLevel = 'public' | 'friends' | 'only_me';

export interface UserPrivacySettings {
  profileVisibility: PrivacyLevel;
  streakVisibility: PrivacyLevel;
  habitsVisibility: PrivacyLevel;
  activityVisibility: PrivacyLevel;
}

export interface UserBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
}

export interface UserSocialProfile {
  uid: string;
  hbId: string;
  username: string;
  displayName: string;
  photoURL?: string | null;
  bio?: string;
  currentStreak: number;
  longestStreak: number;
  habitScore: number;
  totalXP: number;
  level: number;
  levelTitle: string;
  badges: UserBadge[];
  status: UserOnlineStatus;
  lastActive: string;
  friendCount: number;
  completedHabitsCount: number;
  privacy: UserPrivacySettings;
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface FriendRequest {
  id: string;
  senderUid: string;
  senderName: string;
  senderHbId: string;
  senderPhotoURL?: string | null;
  receiverUid: string;
  receiverName: string;
  receiverHbId: string;
  receiverPhotoURL?: string | null;
  status: FriendRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Friendship {
  userA: string;
  userB: string;
  since: string;
}

export type ActivityType = 
  | 'habit_completed' 
  | 'streak_milestone' 
  | 'challenge_won' 
  | 'badge_unlocked'
  | 'level_up';

export type ReactionType = 'celebrate' | 'fire' | 'clap' | 'heart';

export interface ActivityReaction {
  uid: string;
  displayName: string;
  type: ReactionType;
  timestamp: string;
}

export interface ActivityFeedItem {
  id: string;
  authorUid: string;
  authorName: string;
  authorHbId: string;
  authorPhotoURL?: string | null;
  type: ActivityType;
  title: string;
  description: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  reactions?: Record<string, ActivityReaction>; // reactionId -> ActivityReaction
  createdAt: string;
}

export type NotificationType = 
  | 'friend_request' 
  | 'friend_accepted' 
  | 'challenge_invite' 
  | 'challenge_completed'
  | 'leaderboard_change'
  | 'milestone_reached'
  | 'ai_recommendation';

export interface UserNotification {
  id: string;
  recipientUid: string;
  senderUid?: string;
  senderName?: string;
  senderPhotoURL?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

export type ChallengeType = 'daily' | 'weekly' | 'monthly' | 'custom';
export type ChallengeMode = 'individual' | 'friends_only' | 'public' | 'invite_only' | 'private' | 'team';

export interface ChallengeParticipant {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  progress: number; // 0 to 100%
  completedDays: number;
  currentStreak: number;
  joinedAt: string;
}

export interface SocialChallenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  creatorUid: string;
  creatorName: string;
  type: ChallengeType;
  mode: ChallengeMode;
  targetDays: number;
  minCompletionPerDay: number;
  requiredStreak: number;
  targetXP?: number;       // For 'team' mode challenges
  currentTeamXP?: number;  // Pooled total XP
  startDate: string;
  endDate: string;
  winnerUid?: string | null;
  winnerName?: string | null;
  participants: Record<string, ChallengeParticipant>; // uid -> ChallengeParticipant
  status: 'upcoming' | 'active' | 'completed';
  createdAt: string;
}

export type TeamRole = 'owner' | 'admin' | 'member';

export interface TeamMember {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  role: TeamRole;
  joinedAt: string;
  contributionScore: number;
}

export interface SocialTeam {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'Family' | 'School' | 'Company' | 'Friends' | 'Gaming Squad' | 'Custom';
  ownerUid: string;
  members: Record<string, TeamMember>;
  groupStreak: number;
  teamXP: number;
  teamLevel: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  username: string;
  hbId: string;
  photoURL?: string | null;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  level: number;
  completionRate: number; // 0 - 100
  habitScore: number;
  rank?: number;
}

export interface AiChallengeRecommendation {
  id: string;
  title: string;
  description: string;
  reason: string;
  suggestedFriendUid?: string;
  suggestedFriendName?: string;
  suggestedFriendHbId?: string;
  targetDays: number;
  habitCategory: string;
  emoji: string;
}

export interface DirectMessage {
  id: string;
  chatId: string; // usually sorted "uidA_uidB"
  senderUid: string;
  senderName: string;
  receiverUid: string;
  content: string;
  createdAt: string;
  read: boolean;
}

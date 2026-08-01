export interface SpaceIdentityConfig {
  primaryIdLabel: string; // e.g. "Admission Number", "Member ID", "Employee ID"
  secondaryFields?: string[]; // e.g. ["Class", "Section"], ["Department"]
  requireVerification?: boolean;
  allowSelfVerification?: boolean;
}

export interface RosterEntry {
  id: string; // Unique Org Identifier (e.g. "ADM-101", "EMP-504")
  name: string;
  roleId?: string;
  email?: string;
  secondaryData?: Record<string, string>; // e.g. { class: "10", section: "A" }
  createdAt: string;
}

export type AuditActionType = 
  | 'JOIN'
  | 'LEAVE'
  | 'VERIFY_APPROVE'
  | 'VERIFY_REJECT'
  | 'ROLE_CHANGE'
  | 'PROMOTED'
  | 'DEMOTED'
  | 'ROSTER_UPLOAD'
  | 'MEMBER_SUSPENDED'
  | 'REMOVED'
  | 'SPACE_CREATED'
  | 'SPACE_DELETED'
  | 'PROFILE_UPDATED';

export interface AuditLogEntry {
  id: string;
  spaceId: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  targetUserId: string;
  targetUserName: string;
  action: AuditActionType;
  details?: string;
}

export interface DigitalIDCardData {
  hbId: string;
  spaceId: string;
  spaceName: string;
  orgLogoUrl?: string;
  userName: string;
  userPhotoUrl?: string;
  orgIdLabel: string;
  orgIdValue: string;
  roleName: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  joinedAt: string;
}

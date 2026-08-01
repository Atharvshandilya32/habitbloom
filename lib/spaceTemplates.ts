import { CustomRole, SpacePermissions, SpaceType } from './spaceTypes';

// A helper to generate full permissions based on toggles
export const createPermissions = (overrides: Partial<SpacePermissions> = {}): SpacePermissions => ({
  manageMembers: false,
  inviteMembers: false,
  approveJoinRequests: false,
  createChallenges: false,
  editChallenges: false,
  deleteChallenges: false,
  manageTemplates: false,
  sendAnnouncements: false,
  manageBranding: false,
  manageRoles: false,
  manageBilling: false,
  viewAnalytics: false,
  deleteSpace: false,
  ...overrides,
});

export const ALL_PERMISSIONS = createPermissions({
  manageMembers: true, inviteMembers: true, approveJoinRequests: true,
  createChallenges: true, editChallenges: true, deleteChallenges: true,
  manageTemplates: true, sendAnnouncements: true, manageBranding: true,
  manageRoles: true, manageBilling: true, viewAnalytics: true, deleteSpace: true
});

export const ADMIN_PERMISSIONS = createPermissions({
  manageMembers: true, inviteMembers: true, approveJoinRequests: true,
  createChallenges: true, editChallenges: true, deleteChallenges: false,
  manageTemplates: true, sendAnnouncements: true, manageBranding: true,
  manageRoles: false, manageBilling: false, viewAnalytics: true, deleteSpace: false
});

export const COACH_PERMISSIONS = createPermissions({
  manageMembers: false, inviteMembers: true, approveJoinRequests: false,
  createChallenges: true, editChallenges: true, deleteChallenges: false,
  manageTemplates: true, sendAnnouncements: true, manageBranding: false,
  manageRoles: false, manageBilling: false, viewAnalytics: true, deleteSpace: false
});

export const MODERATOR_PERMISSIONS = createPermissions({
  manageMembers: true, inviteMembers: true, approveJoinRequests: true,
  createChallenges: false, editChallenges: false, deleteChallenges: false,
  manageTemplates: false, sendAnnouncements: true, manageBranding: false,
  manageRoles: false, manageBilling: false, viewAnalytics: false, deleteSpace: false
});

export const MEMBER_PERMISSIONS = createPermissions({
  inviteMembers: true, // often members can invite
});

type TemplateDefinition = Omit<CustomRole, 'spaceId'>[];

const SchoolTemplate: TemplateDefinition = [
  { id: 'role-school-owner', name: 'Principal', description: 'Full access to school management', color: 'slate-900', icon: 'graduation-cap', order: 1, permissions: ALL_PERMISSIONS },
  { id: 'role-school-admin', name: 'Vice Principal', description: 'Administrative access', color: 'indigo-600', icon: 'building', order: 2, permissions: ADMIN_PERMISSIONS },
  { id: 'role-school-teacher', name: 'Teacher', description: 'Can manage classes and students', color: 'emerald-600', icon: 'book', order: 3, permissions: COACH_PERMISSIONS },
  { id: 'role-school-student', name: 'Student', description: 'Standard student access', color: 'blue-500', icon: 'user', order: 4, permissions: MEMBER_PERMISSIONS },
];

const GymTemplate: TemplateDefinition = [
  { id: 'role-gym-owner', name: 'Owner', description: 'Full access to gym management', color: 'slate-900', icon: 'crown', order: 1, permissions: ALL_PERMISSIONS },
  { id: 'role-gym-manager', name: 'Manager', description: 'Administrative access', color: 'indigo-600', icon: 'building', order: 2, permissions: ADMIN_PERMISSIONS },
  { id: 'role-gym-trainer', name: 'Trainer', description: 'Can manage workouts and clients', color: 'emerald-600', icon: 'dumbbell', order: 3, permissions: COACH_PERMISSIONS },
  { id: 'role-gym-member', name: 'Member', description: 'Standard member access', color: 'blue-500', icon: 'user', order: 4, permissions: MEMBER_PERMISSIONS },
];

const CompanyTemplate: TemplateDefinition = [
  { id: 'role-company-owner', name: 'Owner', description: 'Full access to company management', color: 'slate-900', icon: 'crown', order: 1, permissions: ALL_PERMISSIONS },
  { id: 'role-company-ceo', name: 'CEO', description: 'Executive access', color: 'purple-600', icon: 'briefcase', order: 2, permissions: ALL_PERMISSIONS },
  { id: 'role-company-hr', name: 'HR', description: 'Human resources and member management', color: 'pink-600', icon: 'users', order: 3, permissions: ADMIN_PERMISSIONS },
  { id: 'role-company-manager', name: 'Manager', description: 'Team management', color: 'indigo-600', icon: 'target', order: 4, permissions: COACH_PERMISSIONS },
  { id: 'role-company-employee', name: 'Employee', description: 'Standard employee access', color: 'blue-500', icon: 'user', order: 5, permissions: MEMBER_PERMISSIONS },
];

// Fallback generic template
const GenericTemplate: TemplateDefinition = [
  { id: 'role-generic-owner', name: 'Owner', description: 'Full access', color: 'slate-900', icon: 'crown', order: 1, permissions: ALL_PERMISSIONS },
  { id: 'role-generic-admin', name: 'Admin', description: 'Administrative access', color: 'indigo-600', icon: 'shield', order: 2, permissions: ADMIN_PERMISSIONS },
  { id: 'role-generic-coach', name: 'Coach/Manager', description: 'Management access', color: 'emerald-600', icon: 'star', order: 3, permissions: COACH_PERMISSIONS },
  { id: 'role-generic-moderator', name: 'Moderator', description: 'Moderation access', color: 'orange-500', icon: 'eye', order: 4, permissions: MODERATOR_PERMISSIONS },
  { id: 'role-generic-member', name: 'Member', description: 'Standard access', color: 'blue-500', icon: 'user', order: 5, permissions: MEMBER_PERMISSIONS },
];

export const getTemplateForType = (type: SpaceType): TemplateDefinition => {
  switch (type) {
    case 'school':
    case 'college':
    case 'coaching_institute':
      return SchoolTemplate;
    case 'gym':
    case 'yoga_studio':
    case 'sports_academy':
      return GymTemplate;
    case 'company':
      return CompanyTemplate;
    default:
      return GenericTemplate;
  }
};

export const getDefaultRolesForSpace = (spaceId: string, type: SpaceType): Record<string, CustomRole> => {
  const template = getTemplateForType(type);
  const roles: Record<string, CustomRole> = {};
  template.forEach(role => {
    roles[role.id] = { ...role, spaceId };
  });
  return roles;
};

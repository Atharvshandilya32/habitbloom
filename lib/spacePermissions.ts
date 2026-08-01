import { CustomRole, SpacePermissions } from './spaceTypes';

export const hasPermission = (role: CustomRole | null | undefined, permissionName: keyof SpacePermissions): boolean => {
  if (!role || !role.permissions) return false;
  return role.permissions[permissionName] === true;
};

export const can = hasPermission;

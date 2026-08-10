import { ref, get, child, update } from 'firebase/database';
import { database } from './firebase';
import { Space, SpaceMember, SpaceRole } from './spaceTypes';
import { getDefaultRolesForSpace, getTemplateForType } from './spaceTemplates';

export const migrateLegacySpace = async (space: Space): Promise<boolean> => {
  if (space.schemaVersion === 2) {
    return true; // Already migrated
  }

  if (!database) return false;

  console.log(`Starting migration for space: ${space.id} (${space.name}) to schemaVersion 2`);

  try {
    const dbRef = ref(database);
    
    // 1. Get default roles for this space type
    const defaultRoles = getDefaultRolesForSpace(space.id, space.type);
    
    // 2. Fetch all members of this space
    const membersSnapshot = await get(child(dbRef, 'spaceMembers'));
    const membersToUpdate: Record<string, SpaceMember> = {};
    
    if (membersSnapshot.exists()) {
      const allMembers = membersSnapshot.val();
      
      // Filter for this space
      Object.keys(allMembers).forEach(key => {
        const member = allMembers[key] as SpaceMember;
        if (member.spaceId === space.id) {
          
          // Determine new roleId based on legacy role string
          let assignedRoleId = '';
          const template = getTemplateForType(space.type);
          
          // Map legacy role to template role
          if (member.role === 'owner') {
            assignedRoleId = template.find(r => r.name.toLowerCase().includes('owner') || r.name.toLowerCase().includes('principal'))?.id || template[0].id;
          } else if (member.role === 'admin') {
            assignedRoleId = template.find(r => r.name.toLowerCase().includes('admin') || r.name.toLowerCase().includes('hr') || r.name.toLowerCase().includes('manager'))?.id || template[1].id;
          } else if (member.role === 'coach') {
            assignedRoleId = template.find(r => r.name.toLowerCase().includes('coach') || r.name.toLowerCase().includes('teacher') || r.name.toLowerCase().includes('trainer'))?.id || template[2].id;
          } else {
            // Default to member
            assignedRoleId = template[template.length - 1].id;
          }

          membersToUpdate[key] = {
            ...member,
            roleId: assignedRoleId
          };
        }
      });
    }

    // 3. Perform atomic update manually (since Realtime DB allows setting specific paths or we can just run promises)
    // We will perform a single multi-path update instead of N+1 sequential/parallel calls to avoid rate limits

    const updates: Record<string, SpaceRole[] | SpaceMember | Space> = {};
    
    // A. Write roles
    updates[`spaceRoles/${space.id}`] = defaultRoles;
    
    // B. Write members
    Object.keys(membersToUpdate).forEach(key => {
      updates[`spaceMembers/${key}`] = membersToUpdate[key];
    });

    // C. Update Space document
    const updatedSpace = { ...space, schemaVersion: 2 };
    updates[`spaces/${space.id}`] = updatedSpace;

    // Perform the multi-path update
    await update(ref(database), updates);

    console.log(`Successfully migrated space: ${space.id}`);
    return true;

  } catch (err) {
    console.error(`Migration failed for space: ${space.id}`, err);
    return false; // Fallback handled by UI checking member.role temporarily
  }
};

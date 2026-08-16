import { ref, push, set } from 'firebase/database';
import { database } from './firebase';
import { AuditActionType, AuditLogEntry } from './identityTypes';

export async function logAuditEvent(
  spaceId: string,
  actor: { id: string; name: string },
  targetUser: { id: string; name: string },
  action: AuditActionType,
  details?: string
): Promise<void> {
  if (!database || !spaceId) return;

  try {
    const logsRef = ref(database, `spaceAuditLogs/${spaceId}`);
    const newLogRef = push(logsRef);
    
    const entry: AuditLogEntry = {
      id: newLogRef.key || `log-${Date.now()}`,
      spaceId,
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      targetUserId: targetUser.id,
      targetUserName: targetUser.name,
      action,
      details: details || '',
    };

    await set(newLogRef, entry);
  } catch (error) {
    console.warn('Failed to write audit log:', error);
  }
}

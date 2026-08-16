import { ref, get, set, runTransaction } from 'firebase/database';
import { database } from './firebase';

/**
 * Generates a random 10-digit number formatted as a string (1000000000 to 9999999999)
 */
export function generateRaw10DigitId(): string {
  const min = 1000000000;
  const max = 9999999999;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

/**
 * Generates a globally unique 10-digit HabitBloom ID and registers it in Firebase atomically
 */
export async function generateUniqueHbId(userId: string): Promise<string> {
  if (!database) {
    return generateRaw10DigitId();
  }

  let attempts = 0;
  while (attempts < 10) {
    const candidateId = generateRaw10DigitId();
    const indexRef = ref(database, `hbIds/${candidateId}`);
    
    try {
      const result = await runTransaction(indexRef, (currentData) => {
        if (currentData === null) {
          return userId; // Claim ID atomically
        }
        return undefined; // Abort transaction if already taken
      });

      if (result.committed) {
        return candidateId;
      }
    } catch {
      // If transaction errors, try next attempt or fallback
    }
    attempts++;
  }

  // Fallback fallback
  return generateRaw10DigitId();
}

/**
 * Formats a 10-digit HabitBloom ID for display (e.g. 1048-3927-56)
 */
export function formatHbId(hbId?: string | null): string {
  if (!hbId || hbId.length !== 10) return hbId || 'HB-PENDING';
  return `${hbId.slice(0, 4)}-${hbId.slice(4, 8)}-${hbId.slice(8)}`;
}

/**
 * Looks up a user's Firebase UID by their 10-digit HabitBloom ID
 */
export async function lookupUserByHbId(hbId: string): Promise<string | null> {
  if (!database || !hbId) return null;
  const rawId = hbId.replace(/-/g, '').trim();
  try {
    const snap = await get(ref(database, `hbIds/${rawId}`));
    if (snap.exists()) {
      return snap.val() as string;
    }
    return null;
  } catch {
    return null;
  }
}

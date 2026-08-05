import { User } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { database } from './firebase';
import { generateUniqueHbId } from './identityUtils';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  updatedAt: string;
  hbId?: string | null; // Reserved for future Universal HabitBloom ID
  experiencePoints?: number;
  currentLevel?: number;
  metadata?: Record<string, unknown>;
}

export async function ensureUserProfile(user: User): Promise<UserProfile | null> {
  if (!database || !user) return null;

  try {
    const profileRef = ref(database, `users/${user.uid}/profile`);
    const snapshot = await get(profileRef);

    const now = new Date().toISOString();

    if (!snapshot.exists()) {
      const hbId = await generateUniqueHbId(user.uid);
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || user.email?.split('@')[0] || `User ${user.uid.slice(0, 5)}`,
        photoURL: user.photoURL || null,
        createdAt: now,
        updatedAt: now,
        hbId,
        experiencePoints: 0,
        currentLevel: 1,
      };

      await set(profileRef, newProfile);
      return newProfile;
    } else {
      const existing = snapshot.val() as UserProfile;
      // Auto-migrate existing users if missing 10-digit hbId
      let hbId = existing.hbId;
      if (!hbId || hbId.length !== 10) {
        hbId = await generateUniqueHbId(user.uid);
      }

      // Update email/displayName/photoURL/hbId if changed or generated
      const updates: Partial<UserProfile> = {};
      if (hbId !== existing.hbId) updates.hbId = hbId;
      if (user.email && user.email !== existing.email) updates.email = user.email;
      if (user.displayName && user.displayName !== existing.displayName) updates.displayName = user.displayName;
      if (user.photoURL && user.photoURL !== existing.photoURL) updates.photoURL = user.photoURL;

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = now;
        await set(profileRef, { ...existing, ...updates });
        return { ...existing, ...updates };
      }

      return existing;
    }
  } catch (error) {
    console.error('Failed to ensure user profile:', error);
    return null;
  }
}

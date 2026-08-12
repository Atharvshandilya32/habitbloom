// Phase 10: Central Feature Access Architecture
// This module centralizes access control for free, premium, and early access features.
// NOTE: Production billing must remain disabled until Date >= January 1, 2027.

import { User } from 'firebase/auth';
import { database } from './firebase';
import { ref, get } from 'firebase/database';
export enum AccessState {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  EARLY_ACCESS = 'EARLY_ACCESS',
  COMING_LATER = 'COMING_LATER',
  DISABLED = 'DISABLED',
}

export type UserPlan = 'FREE' | 'PREMIUM' | 'EARLY_ACCESS';

export function normalizeUserPlan(value: unknown): UserPlan {
  if (value === 'PREMIUM' || value === 'EARLY_ACCESS') {
    return value as UserPlan;
  }
  return 'FREE';
}

export type FeatureId =
  | 'advanced_insights'
  | 'advanced_analytics'
  | 'advanced_garden_customization'
  | 'advanced_spaces'
  | 'future_ai_features';

/**
 * Determines the current access state of a feature for a given user plan.
 */
export function canAccessFeature(plan: UserPlan, featureId: FeatureId): AccessState {
  switch (featureId) {
    case 'advanced_insights':
      if (plan === 'PREMIUM') return AccessState.PREMIUM;
      if (plan === 'EARLY_ACCESS') return AccessState.EARLY_ACCESS;
      return AccessState.COMING_LATER;
    
    case 'advanced_analytics':
    case 'advanced_garden_customization':
    case 'advanced_spaces':
    case 'future_ai_features':
      return AccessState.COMING_LATER;

    default:
      return AccessState.FREE;
  }
}

/**
 * Fetches the normalized UserPlan for a given Firebase Auth user.
 */
export async function getUserPlan(user: User | null | undefined): Promise<UserPlan> {
  if (!user || !database) return 'FREE';
  
  try {
    const profileRef = ref(database, `users/${user.uid}/profile`);
    const snapshot = await get(profileRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return normalizeUserPlan(data?.plan);
    }
  } catch (error) {
    console.error('Error fetching user plan:', error);
  }
  
  return 'FREE';
}

// Phase 10: Central Feature Access Architecture
// This module centralizes access control for free, premium, and early access features.
// NOTE: Production billing must remain disabled until Date >= January 1, 2027.

import { User } from 'firebase/auth';

export enum AccessState {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  EARLY_ACCESS = 'EARLY_ACCESS',
  COMING_LATER = 'COMING_LATER',
  DISABLED = 'DISABLED',
}

export type FeatureId =
  | 'advanced_insights'
  | 'advanced_analytics'
  | 'advanced_garden_customization'
  | 'advanced_spaces'
  | 'future_ai_features';

/**
 * Determines the current access state of a feature for a given user.
 * During Phase 10 validation, most premium candidates will return COMING_LATER.
 */
export function canAccessFeature(user: User | null | undefined, featureId: FeatureId): AccessState {
  // Evaluate premium features (No active subscriptions until 2027)
  switch (featureId) {
    case 'advanced_insights':
      // Test wedge for Phase 10
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

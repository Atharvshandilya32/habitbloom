// Phase 11: Billing Provider Abstraction
// This module defines the interfaces and stub implementations for future payment processing.
// NOTE: Production billing must remain disabled until Date >= January 1, 2027.

export type SubscriptionState =
  | 'FREE'
  | 'TRIAL'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'GRACE_PERIOD';

export interface SubscriptionInfo {
  status: SubscriptionState;
  planId: string;
  nextBillingDate: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface BillingProvider {
  createCheckoutSession(userId: string, priceId: string): Promise<string>;
  getSubscription(userId: string): Promise<SubscriptionInfo | null>;
  cancelSubscription(userId: string): Promise<boolean>;
  restoreSubscription(userId: string): Promise<boolean>;
}

export class MockBillingProvider implements BillingProvider {
  async createCheckoutSession(userId: string, priceId: string): Promise<string> {
    console.warn(`[Billing] createCheckoutSession called for user ${userId}, price ${priceId}`);
    throw new Error('Payments are disabled until January 1, 2027.');
  }

  async getSubscription(userId: string): Promise<SubscriptionInfo | null> {
    console.warn(`[Billing] getSubscription called for user ${userId}`);
    // Return null since we don't have active subscriptions yet
    return null;
  }

  async cancelSubscription(userId: string): Promise<boolean> {
    console.warn(`[Billing] cancelSubscription called for user ${userId}`);
    throw new Error('Payments are disabled until January 1, 2027.');
  }

  async restoreSubscription(userId: string): Promise<boolean> {
    console.warn(`[Billing] restoreSubscription called for user ${userId}`);
    throw new Error('Payments are disabled until January 1, 2027.');
  }
}

// Export a singleton instance of the billing provider
export const billingProvider = new MockBillingProvider();

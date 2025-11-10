/**
 * Payment service for handling Stripe payments and subscriptions
 */

const API_URL = 'http://localhost:3001';

export interface SubscriptionTier {
  name: string;
  price: number;
  interval: 'week' | 'month';
  priceId: string;
  features: string[];
}

export interface SubscriptionStatus {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

/**
 * Get Stripe configuration including publishable key and pricing tiers
 */
export async function getStripeConfig(): Promise<{
  publishableKey: string;
  tiers: Record<string, SubscriptionTier>;
}> {
  const response = await fetch(`${API_URL}/api/payments/config`);
  if (!response.ok) {
    throw new Error('Failed to fetch Stripe config');
  }
  return response.json();
}

/**
 * Create a Stripe Checkout session
 */
export async function createCheckoutSession(
  priceId: string,
  token: string
): Promise<{ sessionId: string; sessionUrl: string }> {
  const response = await fetch(`${API_URL}/api/payments/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ priceId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  return response.json();
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession(token: string): Promise<{ portalUrl: string }> {
  const response = await fetch(`${API_URL}/api/payments/create-portal-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create portal session');
  }

  return response.json();
}

/**
 * Get current subscription status
 */
export async function getSubscriptionStatus(token: string): Promise<SubscriptionStatus> {
  const response = await fetch(`${API_URL}/api/payments/subscription-status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch subscription status');
  }

  return response.json();
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(token: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/api/payments/cancel-subscription`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to cancel subscription');
  }

  return response.json();
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(token: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/api/payments/reactivate-subscription`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reactivate subscription');
  }

  return response.json();
}

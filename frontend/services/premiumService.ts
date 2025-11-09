import { getAccessToken } from './userService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Keep for backward compatibility with components
export type Plan = 'free' | 'monthly' | 'yearly';

export interface FreeTrial {
  expiry: number;
  resumeDownloads: number;
  coverLetters: number;
  aiImprovements: number;
  resumeTailoring: number;
  resumeAnalyses: number;
}

interface Subscription {
  plan: Plan;
  ai_enhancements_used: number;
  downloads_used: number;
  cover_letters_generated: number;
  resume_analyses_done: number;
  trial_used: boolean;
  subscription_expires: string | null;
}

/**
 * Get auth headers with JWT token
 */
const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Get current subscription from database
 */
const getSubscription = async (): Promise<Subscription | null> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/subscriptions/current`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 503) {
        // Database not configured - return free tier
        return null;
      }
      throw new Error(`Failed to fetch subscription: ${response.status}`);
    }

    const data = await response.json();
    return data.subscription;
  } catch (error) {
    console.error('Failed to get subscription:', error);
    return null;
  }
};

/**
 * Check if user has an active premium subscription
 */
const hasPremium = async (): Promise<boolean> => {
  const sub = await getSubscription();
  if (!sub) return false;

  if (sub.plan === 'free') return false;

  // Check if subscription is expired
  if (sub.subscription_expires) {
    const expiryDate = new Date(sub.subscription_expires);
    if (expiryDate < new Date()) {
      return false;
    }
  }

  return sub.plan === 'monthly' || sub.plan === 'yearly';
};

/**
 * Get free trial state (for display purposes)
 */
export const getFreeTrialState = async (): Promise<FreeTrial | null> => {
  const sub = await getSubscription();
  if (!sub) return null;

  // Map database subscription to FreeTrial format for backward compatibility
  const remaining = {
    resumeDownloads: Math.max(0, 3 - (sub.downloads_used || 0)),
    coverLetters: Math.max(0, 2 - (sub.cover_letters_generated || 0)),
    aiImprovements: Math.max(0, 5 - (sub.ai_enhancements_used || 0)),
    resumeTailoring: Math.max(0, 2 - (sub.ai_enhancements_used || 0)),
    resumeAnalyses: Math.max(0, 2 - (sub.resume_analyses_done || 0)),
    expiry: sub.subscription_expires ? new Date(sub.subscription_expires).getTime() : 0,
  };

  return remaining;
};

/**
 * Purchase a plan
 */
export const purchasePlan = async (plan: Plan): Promise<void> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/subscriptions/upgrade`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ plan }),
    });

    if (!response.ok) {
      throw new Error(`Failed to purchase plan: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to purchase plan:', error);
    throw error;
  }
};

/**
 * Check if subscription has expired (for display purposes)
 */
export const hasSubscriptionExpired = async (): Promise<boolean> => {
  const sub = await getSubscription();
  if (!sub || !sub.subscription_expires) return false;

  const expiryDate = new Date(sub.subscription_expires);
  return expiryDate < new Date();
};

/**
 * Clear expired subscription flag (for UI)
 */
export const clearExpiredSubscriptionFlag = (): void => {
  // No-op since we're using database now
  // Kept for backward compatibility with existing components
};

/**
 * Check if watermark should be shown
 */
export const shouldShowWatermark = async (): Promise<boolean> => {
  return !(await hasPremium());
};

// --- Resume Downloads ---
export const canDownloadResume = async (): Promise<boolean> => {
  if (await hasPremium()) return true;

  const sub = await getSubscription();
  if (!sub) return true; // Allow if no subscription record (new user)

  return (sub.downloads_used || 0) < 3;
};

export const useResumeDownload = async (): Promise<void> => {
  if (await hasPremium()) return;

  try {
    const headers = await getAuthHeaders();
    const sub = await getSubscription();

    const response = await fetch(`${API_URL}/api/subscriptions/features`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        downloads_used: (sub?.downloads_used || 0) + 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update downloads: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to update resume download count:', error);
  }
};

// --- AI Improvements ---
export const canUseAIImprovement = async (): Promise<boolean> => {
  if (await hasPremium()) return true;

  const sub = await getSubscription();
  if (!sub) return true; // Allow if no subscription record (new user)

  return (sub.ai_enhancements_used || 0) < 5;
};

export const useAIImprovementAttempt = async (): Promise<void> => {
  if (await hasPremium()) return;

  try {
    const headers = await getAuthHeaders();
    const sub = await getSubscription();

    const response = await fetch(`${API_URL}/api/subscriptions/features`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        ai_enhancements_used: (sub?.ai_enhancements_used || 0) + 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update AI improvements: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to update AI improvement count:', error);
  }
};

// --- Resume Tailoring ---
export const canTailorResume = async (): Promise<boolean> => {
  if (await hasPremium()) return true;

  const sub = await getSubscription();
  if (!sub) return true; // Allow if no subscription record (new user)

  return (sub.ai_enhancements_used || 0) < 5;
};

export const useTailorAttempt = async (): Promise<void> => {
  // Same as AI improvement for free tier
  await useAIImprovementAttempt();
};

// --- Cover Letter Generation ---
export const canGenerateCoverLetter = async (): Promise<boolean> => {
  if (await hasPremium()) return true;

  const sub = await getSubscription();
  if (!sub) return true; // Allow if no subscription record (new user)

  return (sub.cover_letters_generated || 0) < 2;
};

export const useCoverLetterAttempt = async (): Promise<void> => {
  if (await hasPremium()) return;

  try {
    const headers = await getAuthHeaders();
    const sub = await getSubscription();

    const response = await fetch(`${API_URL}/api/subscriptions/features`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        cover_letters_generated: (sub?.cover_letters_generated || 0) + 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update cover letters: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to update cover letter count:', error);
  }
};

// --- Resume Analysis ---
export const canAnalyzeResume = async (): Promise<boolean> => {
  if (await hasPremium()) return true;

  const sub = await getSubscription();
  if (!sub) return true; // Allow if no subscription record (new user)

  return (sub.resume_analyses_done || 0) < 2;
};

export const useResumeAnalysisAttempt = async (): Promise<void> => {
  if (await hasPremium()) return;

  try {
    const headers = await getAuthHeaders();
    const sub = await getSubscription();

    const response = await fetch(`${API_URL}/api/subscriptions/features`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        resume_analyses_done: (sub?.resume_analyses_done || 0) + 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update resume analyses: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to update resume analysis count:', error);
  }
};

// --- Premium Feature Gating ---
export const canAccessApplicationTracker = async (): Promise<boolean> => {
  return await hasPremium();
};

export const canAccessVersionHistory = async (): Promise<boolean> => {
  return await hasPremium();
};

export const checkCourseAccess = (): boolean => {
  return true; // Courses are free for all
};

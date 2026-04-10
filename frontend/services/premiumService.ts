import { getAccessToken } from './userService';

// Production API URL - hardcoded for reliability
const API_URL = 'https://api.careerhubai.com.au';

// Type exports for backward compatibility
export type Plan = 'free' | 'weekly' | 'monthly';

// Free tier limits — MUST stay in sync with backend enforcement in
// backend/src/routes/gemini.ts. Changing these without changing the backend
// will cause the UI to gate differently from the server.
export const FREE_TIER_LIMITS = {
  downloads: 3,
  aiEnhancements: 10,
  resumeTailoring: 3,
  coverLetters: 3,     // shared counter with selection criteria
  resumeAnalyses: 3,   // shared counter with skill gap audits
  versionSaves: 3,
} as const;

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
  ai_tailoring_used: number;
  versions_saved?: number;
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
export const getSubscription = async (): Promise<Subscription | null> => {
  try {
    // Check if user is authenticated first (avoid 401 errors for guest users)
    const token = await getAccessToken();
    if (!token) {
      // Guest user - return null immediately without making API call
      return null;
    }

    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/subscriptions/current`, {
      method: 'GET',
      headers,
      cache: 'no-store', // Prevent browser caching to avoid showing wrong user's data
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
export const hasPremium = async (): Promise<boolean> => {
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

  return sub.plan === 'weekly' || sub.plan === 'monthly';
};

/**
 * Returns remaining free-tier credits for each metered feature.
 * Limits match backend enforcement in backend/src/routes/gemini.ts.
 */
export const getFreeTrialState = async (): Promise<FreeTrial | null> => {
  const sub = await getSubscription();
  if (!sub) return null;

  return {
    resumeDownloads: Math.max(0, FREE_TIER_LIMITS.downloads - (sub.downloads_used || 0)),
    coverLetters: Math.max(0, FREE_TIER_LIMITS.coverLetters - (sub.cover_letters_generated || 0)),
    aiImprovements: Math.max(0, FREE_TIER_LIMITS.aiEnhancements - (sub.ai_enhancements_used || 0)),
    resumeTailoring: Math.max(0, FREE_TIER_LIMITS.resumeTailoring - (sub.ai_tailoring_used || 0)),
    resumeAnalyses: Math.max(0, FREE_TIER_LIMITS.resumeAnalyses - (sub.resume_analyses_done || 0)),
    expiry: sub.subscription_expires ? new Date(sub.subscription_expires).getTime() : 0,
  };
};

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

export const hasSubscriptionExpired = async (): Promise<boolean> => {
  const sub = await getSubscription();
  if (!sub || !sub.subscription_expires) return false;

  const expiryDate = new Date(sub.subscription_expires);
  return expiryDate < new Date();
};

export const clearExpiredSubscriptionFlag = (): void => {
  // No-op since we're using database now
  // Kept for backward compatibility with existing components
};

export const shouldShowWatermark = async (): Promise<boolean> => {
  return !(await hasPremium());
};

// --- Resume Downloads (3 free, unlimited paid) ---
export const canDownloadResume = async (): Promise<boolean> => {
  if (await hasPremium()) return true;

  const sub = await getSubscription();
  if (!sub) return true;

  return (sub.downloads_used || 0) < FREE_TIER_LIMITS.downloads;
};

export const useResumeDownload = async (): Promise<void> => {
  if (await hasPremium()) return;

  try {
    const headers = await getAuthHeaders();
    const sub = await getSubscription();

    // Only track if subscription record exists
    if (!sub) return;

    const response = await fetch(`${API_URL}/api/subscriptions/features`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        downloads_used: (sub?.downloads_used || 0) + 1,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to update resume download count:', response.status);
    }
  } catch (error) {
    // Silently fail - usage tracking is not critical for free tier
    console.debug('Download tracking skipped:', error);
  }
};

// --- AI Enhancements (10 free, unlimited paid) ---
export const canUseAIImprovement = async (): Promise<boolean> => {
  if (await hasPremium()) return true;

  const sub = await getSubscription();
  if (!sub) return true;

  return (sub.ai_enhancements_used || 0) < FREE_TIER_LIMITS.aiEnhancements;
};

export const useAIImprovementAttempt = async (): Promise<void> => {
  if (await hasPremium()) return;

  try {
    const headers = await getAuthHeaders();
    const sub = await getSubscription();

    // Only track if subscription record exists
    if (!sub) return;

    const response = await fetch(`${API_URL}/api/subscriptions/features`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        ai_enhancements_used: (sub?.ai_enhancements_used || 0) + 1,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to update AI improvement count:', response.status);
    }
  } catch (error) {
    // Silently fail - usage tracking is not critical for free tier
    console.debug('AI improvement tracking skipped:', error);
  }
};

// --- Resume Tailoring (3 free, unlimited paid) ---
export const canTailorResume = async (): Promise<boolean> => {
  if (await hasPremium()) return true;

  const sub = await getSubscription();
  if (!sub) return true;

  return (sub.ai_tailoring_used || 0) < FREE_TIER_LIMITS.resumeTailoring;
};

export const useTailorAttempt = async (): Promise<void> => {
  if (await hasPremium()) return;

  try {
    const headers = await getAuthHeaders();
    const sub = await getSubscription();

    if (!sub) return;

    const response = await fetch(`${API_URL}/api/subscriptions/features`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        ai_tailoring_used: (sub?.ai_tailoring_used || 0) + 1,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to update tailoring count:', response.status);
    }
  } catch (error) {
    console.debug('Tailoring tracking skipped:', error);
  }
};

// --- Cover Letter Generation (3 free, unlimited paid — shared with selection criteria) ---
export const canGenerateCoverLetter = async (): Promise<boolean> => {
  if (await hasPremium()) return true;

  const sub = await getSubscription();
  if (!sub) return true;

  return (sub.cover_letters_generated || 0) < FREE_TIER_LIMITS.coverLetters;
};

export const useCoverLetterAttempt = async (): Promise<void> => {
  if (await hasPremium()) return;

  try {
    const headers = await getAuthHeaders();
    const sub = await getSubscription();

    // Only track if subscription record exists
    if (!sub) return;

    const response = await fetch(`${API_URL}/api/subscriptions/features`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        cover_letters_generated: (sub?.cover_letters_generated || 0) + 1,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to update cover letter count:', response.status);
    }
  } catch (error) {
    // Silently fail - usage tracking is not critical for free tier
    console.debug('Cover letter tracking skipped:', error);
  }
};

// --- Resume Analysis (3 free, unlimited paid — shared with skill gap audits) ---
export const canAnalyzeResume = async (): Promise<boolean> => {
  if (await hasPremium()) return true;

  const sub = await getSubscription();
  if (!sub) return true;

  return (sub.resume_analyses_done || 0) < FREE_TIER_LIMITS.resumeAnalyses;
};

export const useResumeAnalysisAttempt = async (): Promise<void> => {
  if (await hasPremium()) return;

  try {
    const headers = await getAuthHeaders();
    const sub = await getSubscription();

    // Only track if subscription record exists
    if (!sub) return;

    const response = await fetch(`${API_URL}/api/subscriptions/features`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        resume_analyses_done: (sub?.resume_analyses_done || 0) + 1,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to update resume analysis count:', response.status);
    }
  } catch (error) {
    // Silently fail - usage tracking is not critical for free tier
    console.debug('Resume analysis tracking skipped:', error);
  }
};

// --- Version History (3 free versions) ---
export const canAccessVersionHistory = async (): Promise<boolean> => {
  // Everyone can access version history, but free users limited to 3 saves
  return true;
};

export const canSaveVersion = async (): Promise<boolean> => {
  if (await hasPremium()) return true;

  const sub = await getSubscription();
  if (!sub) return true;

  // Free users can save up to 3 versions
  return (sub.versions_saved || 0) < FREE_TIER_LIMITS.versionSaves;
};

export const useVersionSave = async (): Promise<void> => {
  if (await hasPremium()) return;

  try {
    const headers = await getAuthHeaders();
    const sub = await getSubscription();

    // Only track if subscription record exists
    if (!sub) return;

    const response = await fetch(`${API_URL}/api/subscriptions/features`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        versions_saved: (sub?.versions_saved || 0) + 1,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to update version save count:', response.status);
    }
  } catch (error) {
    // Silently fail - usage tracking is not critical for free tier
    console.debug('Version save tracking skipped:', error);
  }
};

// --- Premium Feature Gating ---
export const canAccessApplicationTracker = async (): Promise<boolean> => {
  // Application tracker is free for all
  return true;
};

export const checkCourseAccess = (): boolean => {
  return true; // Courses are free for all
};

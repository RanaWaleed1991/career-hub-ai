import { supabase } from '../src/config/supabase';
import { getAccessToken } from './userService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Type exports for backward compatibility
export type Plan = 'free' | 'weekly' | 'monthly';

export interface FreeTrialState {
  isActive: boolean;
  daysRemaining: number;
  generationsRemaining: number;
  totalGenerations: number;
}

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

const FREE_TRIAL_DAYS = 7;
const FREE_TRIAL_GENERATIONS = 5;

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

// NEW: Class-based service for TrialStatus component
class PremiumService {
  async getFreeTrialState(): Promise<FreeTrialState> {
    try {
      console.log('PremiumService: Getting free trial state...');

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('PremiumService: User not authenticated');
        return {
          isActive: false,
          daysRemaining: 0,
          generationsRemaining: 0,
          totalGenerations: FREE_TRIAL_GENERATIONS,
        };
      }

      console.log('PremiumService: Checking trial for user:', user.id);

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subscription && subscription.tier !== 'free') {
        return {
          isActive: false,
          daysRemaining: 0,
          generationsRemaining: 0,
          totalGenerations: FREE_TRIAL_GENERATIONS,
        };
      }

      const accountCreated = new Date(user.created_at);
      const now = new Date();
      const daysSinceCreation = Math.floor((now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, FREE_TRIAL_DAYS - daysSinceCreation);
      const isActive = daysRemaining > 0;

      const aiGenerationsUsed = subscription?.ai_generations_used || 0;
      const generationsRemaining = Math.max(0, FREE_TRIAL_GENERATIONS - aiGenerationsUsed);

      const trialState = {
        isActive: isActive && generationsRemaining > 0,
        daysRemaining,
        generationsRemaining,
        totalGenerations: FREE_TRIAL_GENERATIONS,
      };

      console.log('PremiumService: Trial state:', trialState);
      return trialState;
    } catch (error) {
      console.error('PremiumService: Error:', error);
      return {
        isActive: false,
        daysRemaining: 0,
        generationsRemaining: 0,
        totalGenerations: FREE_TRIAL_GENERATIONS,
      };
    }
  }
}

export const premiumService = new PremiumService();

// OLD: Backward compatible exports for existing components
export const getFreeTrialState = async (): Promise<FreeTrial | null> => {
  const sub = await getSubscription();
  if (!sub) return null;

  const remaining = {
    resumeDownloads: Math.max(0, 3 - (sub.downloads_used || 0)),
    coverLetters: Math.max(0, 3 - (sub.cover_letters_generated || 0)),
    aiImprovements: 999, // Unlimited
    resumeTailoring: 999, // Unlimited
    resumeAnalyses: Math.max(0, 3 - (sub.resume_analyses_done || 0)),
    expiry: sub.subscription_expires ? new Date(sub.subscription_expires).getTime() : 0,
  };

  return remaining;
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

// --- Resume Downloads ---
export const canDownloadResume = async (): Promise<boolean> => {
  if (await hasPremium()) return true;

  const sub = await getSubscription();
  if (!sub) return true;

  return (sub.downloads_used || 0) < 3;
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

// --- AI Improvements (UNLIMITED for free users) ---
export const canUseAIImprovement = async (): Promise<boolean> => {
  // AI enhancements are unlimited for all users
  return true;
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

// --- Resume Tailoring (UNLIMITED for free users) ---
export const canTailorResume = async (): Promise<boolean> => {
  // Resume tailoring is unlimited for all users
  return true;
};

export const useTailorAttempt = async (): Promise<void> => {
  await useAIImprovementAttempt();
};

// --- Cover Letter Generation (3 free) ---
export const canGenerateCoverLetter = async (): Promise<boolean> => {
  if (await hasPremium()) return true;

  const sub = await getSubscription();
  if (!sub) return true;

  return (sub.cover_letters_generated || 0) < 3;
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

// --- Resume Analysis (3 free) ---
export const canAnalyzeResume = async (): Promise<boolean> => {
  if (await hasPremium()) return true;

  const sub = await getSubscription();
  if (!sub) return true;

  return (sub.resume_analyses_done || 0) < 3;
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
  return (sub.versions_saved || 0) < 3;
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

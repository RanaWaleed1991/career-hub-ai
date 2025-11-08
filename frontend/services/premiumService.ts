
const SUBSCRIPTION_KEY = 'career_hub_subscription_v3';
const FREE_TRIAL_KEY = 'career_hub_free_trial_v3';
const SUBSCRIPTION_EXPIRED_KEY = 'career_hub_subscription_expired_v3';

export type Plan = 'weekly' | 'monthly';

interface Subscription {
    plan: Plan;
    expiry: number;
    analysisCount?: number;
}

export interface FreeTrial {
    expiry: number;
    resumeDownloads: number;
    coverLetters: number;
    aiImprovements: number;
    resumeTailoring: number;
    resumeAnalyses: number;
}

const getSubscription = (): Subscription | null => {
  const subStr = localStorage.getItem(SUBSCRIPTION_KEY);
  if (!subStr) return null;
  
  try {
    const sub = JSON.parse(subStr) as Subscription;
    if (Date.now() > sub.expiry) {
      localStorage.removeItem(SUBSCRIPTION_KEY);
      localStorage.setItem(SUBSCRIPTION_EXPIRED_KEY, 'true');
      return null;
    }
    return sub;
  } catch (e) {
    localStorage.removeItem(SUBSCRIPTION_KEY);
    return null;
  }
};

const getFreeTrial = (): FreeTrial | null => {
    let trialStr = localStorage.getItem(FREE_TRIAL_KEY);
    if (!trialStr) {
        // First time user, create a new trial period.
        const newTrial: FreeTrial = {
            expiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
            resumeDownloads: 3,
            coverLetters: 3,
            aiImprovements: 10,
            resumeTailoring: 3,
            resumeAnalyses: 3,
        };
        localStorage.setItem(FREE_TRIAL_KEY, JSON.stringify(newTrial));
        return newTrial;
    }
    try {
        const trial = JSON.parse(trialStr) as FreeTrial;
        if (Date.now() > trial.expiry) {
            // Trial has expired, but don't delete the record.
            return null;
        }
        return trial;
    } catch (e) {
        return null;
    }
}

export const getFreeTrialState = (): FreeTrial | null => {
    return getFreeTrial();
};

export const purchasePlan = (plan: Plan): void => {
  const now = Date.now();
  let subscription: Subscription;

  switch (plan) {
    case 'weekly':
      subscription = {
        plan: 'weekly',
        expiry: now + 7 * 24 * 60 * 60 * 1000, // 7 days
        analysisCount: 10,
      };
      break;
    case 'monthly':
      subscription = {
        plan: 'monthly',
        expiry: now + 30 * 24 * 60 * 60 * 1000, // 30 days
      };
      break;
  }
  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
  clearExpiredSubscriptionFlag();
};

export const hasSubscriptionExpired = (): boolean => {
    return localStorage.getItem(SUBSCRIPTION_EXPIRED_KEY) === 'true';
};

export const clearExpiredSubscriptionFlag = (): void => {
    localStorage.removeItem(SUBSCRIPTION_EXPIRED_KEY);
};

export const shouldShowWatermark = (): boolean => {
    return !getSubscription();
};

const hasPremium = (): boolean => !!getSubscription();

// --- Resume Downloads ---
export const canDownloadResume = (): boolean => {
    if (hasPremium()) return true;
    const trial = getFreeTrial();
    return (trial?.resumeDownloads ?? 0) > 0;
}
export const useResumeDownload = (): void => {
    if (hasPremium()) return;
    const trial = getFreeTrial();
    if (trial && trial.resumeDownloads > 0) {
        const newTrial = { ...trial, resumeDownloads: trial.resumeDownloads - 1 };
        localStorage.setItem(FREE_TRIAL_KEY, JSON.stringify(newTrial));
    }
}

// --- AI Improvements ---
export const canUseAIImprovement = (): boolean => {
    if (hasPremium()) return true;
    const trial = getFreeTrial();
    return (trial?.aiImprovements ?? 0) > 0;
};
export const useAIImprovementAttempt = (): void => {
    if (hasPremium()) return;
    const trial = getFreeTrial();
    if (trial && trial.aiImprovements > 0) {
        const newTrial = { ...trial, aiImprovements: trial.aiImprovements - 1 };
        localStorage.setItem(FREE_TRIAL_KEY, JSON.stringify(newTrial));
    }
};

// --- Resume Tailoring ---
export const canTailorResume = (): boolean => {
    if (hasPremium()) return true;
    const trial = getFreeTrial();
    return (trial?.resumeTailoring ?? 0) > 0;
};
export const useTailorAttempt = (): void => {
    if (hasPremium()) return;
    const trial = getFreeTrial();
    if (trial && trial.resumeTailoring > 0) {
        const newTrial = { ...trial, resumeTailoring: trial.resumeTailoring - 1 };
        localStorage.setItem(FREE_TRIAL_KEY, JSON.stringify(newTrial));
    }
};

// --- Cover Letter Generation ---
export const canGenerateCoverLetter = (): boolean => {
    if (hasPremium()) return true;
    const trial = getFreeTrial();
    return (trial?.coverLetters ?? 0) > 0;
};
export const useCoverLetterAttempt = (): void => {
    if (hasPremium()) return;
    const trial = getFreeTrial();
    if (trial && trial.coverLetters > 0) {
        const newTrial = { ...trial, coverLetters: trial.coverLetters - 1 };
        localStorage.setItem(FREE_TRIAL_KEY, JSON.stringify(newTrial));
    }
};


// --- Resume Analysis ---
export const canAnalyzeResume = (): boolean => {
    const sub = getSubscription();
    if (sub) {
        if (sub.plan === 'monthly') return true;
        if (sub.plan === 'weekly') return (sub.analysisCount ?? 0) > 0;
    }
    const trial = getFreeTrial();
    return (trial?.resumeAnalyses ?? 0) > 0;
};
export const useResumeAnalysisAttempt = (): void => {
    const sub = getSubscription();
    if (sub) {
        if (sub.plan === 'monthly') return;
        if (sub.plan === 'weekly' && sub.analysisCount && sub.analysisCount > 0) {
            const newSub = { ...sub, analysisCount: sub.analysisCount - 1 };
            localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(newSub));
            return;
        }
    }
    const trial = getFreeTrial();
    if (trial && trial.resumeAnalyses > 0) {
        const newTrial = { ...trial, resumeAnalyses: trial.resumeAnalyses - 1 };
        localStorage.setItem(FREE_TRIAL_KEY, JSON.stringify(newTrial));
    }
};


// --- Premium Feature Gating ---
export const canAccessApplicationTracker = (): boolean => hasPremium();
export const canAccessVersionHistory = (): boolean => hasPremium();
export const checkCourseAccess = (): boolean => true; // Courses are free for all

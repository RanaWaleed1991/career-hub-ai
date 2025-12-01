import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { subscriptionDb, ensureDatabaseConfigured, handleDatabaseError } from '../services/database.js';
import { cacheSubscriptions } from '../middleware/cache.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Apply caching AFTER authentication to ensure user-specific cache keys
// Prevents 429 errors from duplicate subscription API calls on login
router.use(cacheSubscriptions);

/**
 * GET /api/subscriptions/current
 * Get user's current subscription
 */
router.get('/current', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const subscription = await subscriptionDb.getCurrent(req.user.id);

    // If no subscription exists, return free tier defaults
    if (!subscription) {
      res.status(200).json({
        subscription: {
          user_id: req.user.id,
          plan: 'free',
          ai_enhancements_used: 0,
          downloads_used: 0,
          cover_letters_generated: 0,
          resume_analyses_done: 0,
          trial_used: false,
          subscription_expires: null,
        },
      });
      return;
    }

    res.status(200).json({ subscription });
  } catch (error) {
    const message = handleDatabaseError(error, 'fetch subscription');
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/subscriptions/upgrade
 * Upgrade user's subscription plan
 */
router.post('/upgrade', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { plan } = req.body;

    if (!plan || !['free', 'weekly', 'monthly'].includes(plan)) {
      res.status(400).json({ error: 'Valid plan is required (free, weekly, monthly)' });
      return;
    }

    // Calculate subscription expiration based on plan
    let expiresAt = null;
    if (plan === 'weekly') {
      // Weekly is weekly subscription
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);
      expiresAt = expiry.toISOString();
    } else if (plan === 'monthly') {
      // Monthly is monthly subscription
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 1);
      expiresAt = expiry.toISOString();
    }

    const subscription = await subscriptionDb.upsert(req.user.id, {
      plan,
      subscription_expires: expiresAt,
      // Reset usage counters on upgrade
      ai_enhancements_used: 0,
      downloads_used: 0,
      cover_letters_generated: 0,
      resume_analyses_done: 0,
    });

    res.status(200).json({ subscription, message: 'Subscription updated successfully' });
  } catch (error) {
    const message = handleDatabaseError(error, 'upgrade subscription');
    res.status(500).json({ error: message });
  }
});

/**
 * PUT /api/subscriptions/features
 * Update feature usage counters
 */
router.put('/features', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const featureUpdates = req.body;

    // Validate feature fields
    const allowedFields = [
      'ai_enhancements_used',
      'downloads_used',
      'cover_letters_generated',
      'resume_analyses_done',
      'trial_used',
    ];

    const hasValidField = Object.keys(featureUpdates).some((key) => allowedFields.includes(key));

    if (!hasValidField) {
      res.status(400).json({ error: 'No valid feature fields provided' });
      return;
    }

    const subscription = await subscriptionDb.updateFeatureUsage(req.user.id, featureUpdates);
    res.status(200).json({ subscription });
  } catch (error) {
    const message = handleDatabaseError(error, 'update feature usage');
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/subscriptions/check-limit/:feature
 * Check if user has reached limit for a feature
 */
router.get('/check-limit/:feature', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { feature } = req.params;
    const subscription = await subscriptionDb.getCurrent(req.user.id);

    // Define limits per plan (matching SUBSCRIPTION_TIERS from stripe config)
    const limits: Record<string, any> = {
      free: {
        ai_enhancements: 3,
        downloads: 3,
        cover_letters: 3,
        resume_analyses: 3,
      },
      weekly: {
        ai_enhancements: Infinity,
        downloads: Infinity,
        cover_letters: Infinity,
        resume_analyses: 10,
      },
      monthly: {
        ai_enhancements: Infinity,
        downloads: Infinity,
        cover_letters: Infinity,
        resume_analyses: Infinity,
      },
    };

    const plan = subscription?.plan || 'free';
    const planLimits = limits[plan];

    // Check if subscription is expired
    if (subscription?.subscription_expires) {
      const expiryDate = new Date(subscription.subscription_expires);
      if (expiryDate < new Date()) {
        // Subscription expired, treat as free
        res.status(200).json({
          limitReached: true,
          message: 'Subscription expired. Please upgrade to continue.',
        });
        return;
      }
    }

    // Map feature names to database fields
    const featureMap: Record<string, string> = {
      ai_enhancements: 'ai_enhancements_used',
      downloads: 'downloads_used',
      cover_letters: 'cover_letters_generated',
      resume_analyses: 'resume_analyses_done',
    };

    const usageField = featureMap[feature];
    if (!usageField) {
      res.status(400).json({ error: 'Invalid feature' });
      return;
    }

    const currentUsage = subscription?.[usageField] || 0;
    const limit = planLimits[feature];
    const limitReached = currentUsage >= limit;

    res.status(200).json({
      limitReached,
      currentUsage,
      limit: limit === Infinity ? 'unlimited' : limit,
      plan,
    });
  } catch (error) {
    const message = handleDatabaseError(error, 'check feature limit');
    res.status(500).json({ error: message });
  }
});

export default router;

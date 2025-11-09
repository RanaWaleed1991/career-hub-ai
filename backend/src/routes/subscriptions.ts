import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { subscriptionDb, ensureDatabaseConfigured, handleDatabaseError } from '../services/database.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

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
          status: 'active',
          features_used: {
            ai_enhancements: 0,
            downloads: 0,
            cover_letters: 0,
            resume_analyses: 0,
          },
          expires_at: null,
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

    if (!plan || !['free', 'monthly', 'yearly'].includes(plan)) {
      res.status(400).json({ error: 'Valid plan is required (free, monthly, yearly)' });
      return;
    }

    // Calculate subscription expiration based on plan
    let expiresAt = null;
    if (plan === 'monthly') {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 1);
      expiresAt = expiry.toISOString();
    } else if (plan === 'yearly') {
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      expiresAt = expiry.toISOString();
    }

    const subscription = await subscriptionDb.upsert(req.user.id, {
      plan,
      status: 'active',
      expires_at: expiresAt,
      // Reset usage counters on upgrade
      features_used: {
        ai_enhancements: 0,
        downloads: 0,
        cover_letters: 0,
        resume_analyses: 0,
      },
    });

    res.status(200).json({ subscription, message: 'Subscription updated successfully' });
  } catch (error) {
    const message = handleDatabaseError(error, 'upgrade subscription');
    res.status(500).json({ error: message });
  }
});

/**
 * PUT /api/subscriptions/features
 * Update feature usage counters (JSONB)
 */
router.put('/features', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { feature, increment = 1 } = req.body;

    // Validate feature name
    const allowedFeatures = ['ai_enhancements', 'downloads', 'cover_letters', 'resume_analyses'];

    if (!feature || !allowedFeatures.includes(feature)) {
      res.status(400).json({ error: 'Valid feature name required (ai_enhancements, downloads, cover_letters, resume_analyses)' });
      return;
    }

    // Get current subscription
    const subscription = await subscriptionDb.getCurrent(req.user.id);
    const currentFeatures = subscription?.features_used || {
      ai_enhancements: 0,
      downloads: 0,
      cover_letters: 0,
      resume_analyses: 0,
    };

    // Increment the feature count
    const updatedFeatures = {
      ...currentFeatures,
      [feature]: (currentFeatures[feature] || 0) + increment,
    };

    // Update subscription with new features_used JSONB
    const updatedSubscription = await subscriptionDb.upsert(req.user.id, {
      features_used: updatedFeatures,
    });

    res.status(200).json({ subscription: updatedSubscription });
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

    // Define limits per plan
    const limits: Record<string, any> = {
      free: {
        ai_enhancements: 5,
        downloads: 3,
        cover_letters: 2,
        resume_analyses: 2,
      },
      monthly: {
        ai_enhancements: Infinity,
        downloads: Infinity,
        cover_letters: Infinity,
        resume_analyses: Infinity,
      },
      yearly: {
        ai_enhancements: Infinity,
        downloads: Infinity,
        cover_letters: Infinity,
        resume_analyses: Infinity,
      },
    };

    const plan = subscription?.plan || 'free';
    const planLimits = limits[plan];

    // Check if subscription is expired
    if (subscription?.expires_at) {
      const expiryDate = new Date(subscription.expires_at);
      if (expiryDate < new Date()) {
        // Subscription expired, treat as free
        res.status(200).json({
          limitReached: true,
          message: 'Subscription expired. Please upgrade to continue.',
        });
        return;
      }
    }

    // Validate feature name
    const validFeatures = ['ai_enhancements', 'downloads', 'cover_letters', 'resume_analyses'];
    if (!validFeatures.includes(feature)) {
      res.status(400).json({ error: 'Invalid feature' });
      return;
    }

    // Get current usage from features_used JSONB
    const featuresUsed = subscription?.features_used || {
      ai_enhancements: 0,
      downloads: 0,
      cover_letters: 0,
      resume_analyses: 0,
    };

    const currentUsage = featuresUsed[feature] || 0;
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

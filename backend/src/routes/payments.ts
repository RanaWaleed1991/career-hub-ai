import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { isStripeConfigured, SUBSCRIPTION_TIERS } from '../config/stripe.js';
import {
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
  cancelSubscription,
  reactivateSubscription,
} from '../services/subscription.js';
import { env } from '../config/env.js';

const router = express.Router();

/**
 * Middleware to check if Stripe is configured
 */
const requireStripe = (req: express.Request, res: Response, next: express.NextFunction) => {
  if (!isStripeConfigured()) {
    res.status(503).json({
      error: 'Payment processing is not configured. Please contact support.',
    });
    return;
  }
  next();
};

/**
 * GET /api/payments/config
 * Get public Stripe configuration
 */
router.get('/config', (req, res) => {
  res.json({
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    tiers: SUBSCRIPTION_TIERS,
  });
});

/**
 * POST /api/payments/create-checkout-session
 * Create a Stripe Checkout session for subscription
 */
router.post(
  '/create-checkout-session',
  authMiddleware,
  requireStripe,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { priceId } = req.body;

      if (!priceId) {
        res.status(400).json({ error: 'priceId is required' });
        return;
      }

      // Validate price ID
      const validPriceIds = Object.values(SUBSCRIPTION_TIERS)
        .map((tier) => tier.priceId)
        .filter((id) => id);

      if (!validPriceIds.includes(priceId)) {
        res.status(400).json({ error: 'Invalid price ID' });
        return;
      }

      // Get user email from auth
      const email = req.user.email;
      if (!email) {
        res.status(400).json({ error: 'User email not found' });
        return;
      }

      // Create checkout session
      const successUrl = `${env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${env.FRONTEND_URL}/subscription/canceled`;

      const session = await createCheckoutSession(
        req.user.id,
        email,
        priceId,
        successUrl,
        cancelUrl
      );

      res.json({
        sessionId: session.id,
        sessionUrl: session.url,
      });
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({
        error: 'Failed to create checkout session',
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/payments/create-portal-session
 * Create a Stripe Customer Portal session
 */
router.post(
  '/create-portal-session',
  authMiddleware,
  requireStripe,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const returnUrl = `${env.FRONTEND_URL}/subscription`;

      const session = await createPortalSession(req.user.id, returnUrl);

      res.json({
        portalUrl: session.url,
      });
    } catch (error: any) {
      console.error('Error creating portal session:', error);
      res.status(500).json({
        error: 'Failed to create portal session',
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/payments/subscription-status
 * Get current user's subscription status
 */
router.get(
  '/subscription-status',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const status = await getSubscriptionStatus(req.user.id);

      res.json(status);
    } catch (error: any) {
      console.error('Error fetching subscription status:', error);
      res.status(500).json({
        error: 'Failed to fetch subscription status',
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/payments/cancel-subscription
 * Cancel user's subscription at period end
 */
router.post(
  '/cancel-subscription',
  authMiddleware,
  requireStripe,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      await cancelSubscription(req.user.id);

      res.json({
        success: true,
        message: 'Subscription will be canceled at the end of the billing period',
      });
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({
        error: 'Failed to cancel subscription',
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/payments/reactivate-subscription
 * Reactivate a canceled subscription
 */
router.post(
  '/reactivate-subscription',
  authMiddleware,
  requireStripe,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      await reactivateSubscription(req.user.id);

      res.json({
        success: true,
        message: 'Subscription reactivated successfully',
      });
    } catch (error: any) {
      console.error('Error reactivating subscription:', error);
      res.status(500).json({
        error: 'Failed to reactivate subscription',
        message: error.message,
      });
    }
  }
);

export default router;

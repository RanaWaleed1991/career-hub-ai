/**
 * TEST EMAIL ENDPOINT
 *
 * ⚠️ WARNING: DELETE THIS FILE BEFORE PRODUCTION DEPLOYMENT ⚠️
 *
 * This endpoint is for testing email functionality during development.
 * It should be removed before deploying to production.
 */

import express, { Request, Response } from 'express';
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPaymentConfirmationEmail,
  sendSubscriptionCancelledEmail,
  isEmailConfigured,
} from '../services/emailService.js';

const router = express.Router();

/**
 * GET /api/test-email/status
 * Check if email service is configured
 */
router.get('/status', (req: Request, res: Response) => {
  const configured = isEmailConfigured();

  res.json({
    configured,
    message: configured
      ? 'Email service is configured and ready'
      : 'Email service is NOT configured. Add SENDGRID_API_KEY to .env file',
  });
});

/**
 * POST /api/test-email/welcome
 * Test welcome email
 *
 * Body: { email: string, name?: string }
 */
router.post('/welcome', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const result = await sendWelcomeEmail(email, name || 'Test User');

    if (result.success) {
      res.json({
        success: true,
        message: `Welcome email sent successfully to ${email}`,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: 'Failed to send welcome email',
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/test-email/password-reset
 * Test password reset email
 *
 * Body: { email: string, name?: string }
 */
router.post('/password-reset', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Generate a fake reset token for testing
    const testToken = 'test_reset_token_' + Date.now();

    const result = await sendPasswordResetEmail(
      email,
      testToken,
      name || 'Test User'
    );

    if (result.success) {
      res.json({
        success: true,
        message: `Password reset email sent successfully to ${email}`,
        resetLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${testToken}`,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: 'Failed to send password reset email',
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/test-email/payment-confirmation
 * Test payment confirmation email
 *
 * Body: { email: string, name?: string, plan?: string, amount?: number }
 */
router.post('/payment-confirmation', async (req: Request, res: Response) => {
  try {
    const { email, name, plan, amount } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const testPlan = plan || 'monthly';
    const testAmount = amount || 2499; // $24.99 in cents
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const result = await sendPaymentConfirmationEmail(
      email,
      name || 'Test User',
      testPlan,
      testAmount,
      nextBillingDate
    );

    if (result.success) {
      res.json({
        success: true,
        message: `Payment confirmation email sent successfully to ${email}`,
        details: {
          plan: testPlan,
          amount: `$${(testAmount / 100).toFixed(2)} AUD`,
          nextBilling: nextBillingDate.toLocaleDateString(),
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: 'Failed to send payment confirmation email',
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/test-email/subscription-cancelled
 * Test subscription cancellation email
 *
 * Body: { email: string, name?: string }
 */
router.post('/subscription-cancelled', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const result = await sendSubscriptionCancelledEmail(
      email,
      name || 'Test User',
      expiryDate
    );

    if (result.success) {
      res.json({
        success: true,
        message: `Subscription cancellation email sent successfully to ${email}`,
        accessUntil: expiryDate.toLocaleDateString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: 'Failed to send cancellation email',
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/test-email/all
 * Send all test emails at once
 *
 * Body: { email: string, name?: string }
 */
router.post('/all', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const userName = name || 'Test User';
    const results = {
      welcome: await sendWelcomeEmail(email, userName),
      passwordReset: await sendPasswordResetEmail(email, 'test_token_' + Date.now(), userName),
      paymentConfirmation: await sendPaymentConfirmationEmail(
        email,
        userName,
        'monthly',
        2499,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ),
      cancellation: await sendSubscriptionCancelledEmail(
        email,
        userName,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ),
    };

    const allSuccessful = Object.values(results).every(r => r.success);

    res.json({
      success: allSuccessful,
      message: allSuccessful
        ? `All 4 test emails sent successfully to ${email}`
        : 'Some emails failed to send. Check individual results below.',
      results: {
        welcome: results.welcome.success ? '✅ Sent' : `❌ Failed: ${results.welcome.error}`,
        passwordReset: results.passwordReset.success ? '✅ Sent' : `❌ Failed: ${results.passwordReset.error}`,
        paymentConfirmation: results.paymentConfirmation.success ? '✅ Sent' : `❌ Failed: ${results.paymentConfirmation.error}`,
        cancellation: results.cancellation.success ? '✅ Sent' : `❌ Failed: ${results.cancellation.error}`,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

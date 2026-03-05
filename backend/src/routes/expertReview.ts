import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/adminAuth.js';
import { stripe, isStripeConfigured, STRIPE_PRICE_IDS } from '../config/stripe.js';
import { env } from '../config/env.js';
import { expertReviewDb } from '../services/database.js';
import { supabase } from '../config/supabase.js';
import {
  sendExpertReviewConfirmation,
  sendResumeSubmittedNotification,
  sendQuestionnaireReady,
  sendQuestionnaireCompletedNotification,
  sendRewrittenResumeReady,
} from '../services/emailService.js';
import { subscriptionDb } from '../services/database.js';

const router = express.Router();

// Admin notification email — you receive these
const ADMIN_EMAIL = env.EMAIL_FROM || 'careerhubaiaus@gmail.com';

/**
 * POST /api/expert-review/create-checkout
 * Create a Stripe Checkout session for the $89 expert review
 */
router.post(
  '/create-checkout',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      if (!isStripeConfigured() || !stripe) {
        res.status(503).json({ error: 'Payment processing not configured' });
        return;
      }

      const priceId = STRIPE_PRICE_IDS.EXPERT_REVIEW;
      if (!priceId) {
        res.status(503).json({ error: 'Expert review pricing not configured' });
        return;
      }

      // Check if user already has an active (non-completed) expert review
      const existing = await expertReviewDb.getActiveByUserId(req.user.id);
      if (existing) {
        res.status(400).json({
          error: 'You already have an active expert review in progress',
          reviewId: existing.id,
          status: existing.status,
        });
        return;
      }

      // Get or create Stripe customer
      const subscription = await subscriptionDb.getCurrent(req.user.id);
      let customerId = subscription?.stripe_customer_id;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: req.user.email,
          metadata: { userId: req.user.id },
        });
        customerId = customer.id;
        await subscriptionDb.upsert(req.user.id, {
          stripe_customer_id: customerId,
          plan: subscription?.plan || 'free',
        });
      }

      // Create one-time checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${env.FRONTEND_URL}/expert-review/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.FRONTEND_URL}/expert-review`,
        metadata: {
          userId: req.user.id,
          type: 'expert_review',
        },
      });

      res.json({ sessionId: session.id, sessionUrl: session.url });
    } catch (error: any) {
      console.error('Error creating expert review checkout:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }
);

/**
 * GET /api/expert-review/status
 * Get user's current/latest expert review status
 */
router.get(
  '/status',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const reviews = await expertReviewDb.getByUserId(req.user.id);
      res.json({ reviews });
    } catch (error: any) {
      console.error('Error fetching expert review status:', error);
      res.status(500).json({ error: 'Failed to fetch review status' });
    }
  }
);

/**
 * POST /api/expert-review/submit-resume
 * User uploads their resume PDF for expert review
 */
router.post(
  '/submit-resume',
  authMiddleware,
  express.raw({ type: ['application/pdf', 'application/octet-stream'], limit: '10mb' }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      // Find the user's pending review
      const review = await expertReviewDb.getActiveByUserId(req.user.id);
      if (!review) {
        res.status(404).json({ error: 'No active expert review found. Please purchase first.' });
        return;
      }

      if (review.status !== 'pending_submission') {
        res.status(400).json({ error: 'Resume already submitted for this review' });
        return;
      }

      const filename = (req.headers['x-filename'] as string) || 'resume.pdf';

      // Upload to Supabase Storage
      if (!supabase) {
        res.status(503).json({ error: 'Storage not configured' });
        return;
      }

      const storagePath = `${req.user.id}/${review.id}/${filename}`;
      const { error: uploadError } = await supabase.storage
        .from('expert-reviews')
        .upload(storagePath, req.body, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        res.status(500).json({ error: 'Failed to upload resume' });
        return;
      }

      // Update review record
      await expertReviewDb.update(review.id, {
        status: 'submitted',
        original_resume_url: storagePath,
        original_resume_filename: filename,
        submitted_at: new Date().toISOString(),
      });

      // Notify admin
      await sendResumeSubmittedNotification(ADMIN_EMAIL, {
        userName: review.user_name || req.user.email,
        userEmail: req.user.email,
        reviewId: review.id,
      });

      res.json({ success: true, message: 'Resume submitted successfully' });
    } catch (error: any) {
      console.error('Error submitting resume:', error);
      res.status(500).json({ error: 'Failed to submit resume' });
    }
  }
);

/**
 * GET /api/expert-review/questionnaire/:reviewId
 * Get the questionnaire for a specific review
 */
router.get(
  '/questionnaire/:reviewId',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const review = await expertReviewDb.getById(req.params.reviewId);
      if (!review || review.user_id !== req.user.id) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.json({
        questionnaire: review.questionnaire || [],
        status: review.status,
        answers: review.questionnaire_answers || [],
      });
    } catch (error: any) {
      console.error('Error fetching questionnaire:', error);
      res.status(500).json({ error: 'Failed to fetch questionnaire' });
    }
  }
);

/**
 * POST /api/expert-review/questionnaire/:reviewId
 * User submits questionnaire answers
 */
router.post(
  '/questionnaire/:reviewId',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const review = await expertReviewDb.getById(req.params.reviewId);
      if (!review || review.user_id !== req.user.id) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      if (review.status !== 'questionnaire_sent') {
        res.status(400).json({ error: 'Questionnaire not available for this review' });
        return;
      }

      const { answers } = req.body;
      if (!answers || !Array.isArray(answers)) {
        res.status(400).json({ error: 'Answers must be an array' });
        return;
      }

      await expertReviewDb.update(review.id, {
        questionnaire_answers: answers,
        questionnaire_completed_at: new Date().toISOString(),
        status: 'questionnaire_completed',
      });

      // Notify admin
      await sendQuestionnaireCompletedNotification(ADMIN_EMAIL, {
        userName: review.user_name || req.user.email,
        userEmail: req.user.email,
        reviewId: review.id,
      });

      res.json({ success: true, message: 'Questionnaire submitted successfully' });
    } catch (error: any) {
      console.error('Error submitting questionnaire:', error);
      res.status(500).json({ error: 'Failed to submit questionnaire' });
    }
  }
);

/**
 * GET /api/expert-review/download/:reviewId
 * User downloads the rewritten resume
 */
router.get(
  '/download/:reviewId',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const review = await expertReviewDb.getById(req.params.reviewId);
      if (!review || review.user_id !== req.user.id) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      if (review.status !== 'completed' || !review.rewritten_resume_url) {
        res.status(400).json({ error: 'Rewritten resume not yet available' });
        return;
      }

      if (!supabase) {
        res.status(503).json({ error: 'Storage not configured' });
        return;
      }

      const { data } = await supabase.storage
        .from('expert-reviews')
        .createSignedUrl(review.rewritten_resume_url, 3600); // 1 hour expiry

      if (!data?.signedUrl) {
        res.status(500).json({ error: 'Failed to generate download link' });
        return;
      }

      res.json({
        downloadUrl: data.signedUrl,
        filename: review.rewritten_resume_filename || 'expert-resume.pdf',
      });
    } catch (error: any) {
      console.error('Error generating download:', error);
      res.status(500).json({ error: 'Failed to generate download' });
    }
  }
);

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * GET /api/expert-review/admin/orders
 * List all expert reviews (admin only)
 */
router.get(
  '/admin/orders',
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const status = req.query.status as string | undefined;
      const orders = await expertReviewDb.getAll(status);
      res.json({ orders });
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }
);

/**
 * GET /api/expert-review/admin/:id
 * Get full review details (admin only)
 */
router.get(
  '/admin/:id',
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const review = await expertReviewDb.getById(req.params.id);
      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }
      res.json({ review });
    } catch (error: any) {
      console.error('Error fetching review:', error);
      res.status(500).json({ error: 'Failed to fetch review' });
    }
  }
);

/**
 * PUT /api/expert-review/admin/:id/status
 * Update review status (admin only)
 */
router.put(
  '/admin/:id/status',
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status, admin_notes } = req.body;

      const validStatuses = [
        'pending_submission', 'submitted', 'in_review',
        'questionnaire_sent', 'questionnaire_completed',
        'revision_in_progress', 'completed',
      ];

      if (status && !validStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (admin_notes !== undefined) updateData.admin_notes = admin_notes;

      await expertReviewDb.update(req.params.id, updateData);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating status:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  }
);

/**
 * POST /api/expert-review/admin/:id/questionnaire
 * Set questionnaire questions (admin only)
 */
router.post(
  '/admin/:id/questionnaire',
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { questions } = req.body;

      if (!questions || !Array.isArray(questions)) {
        res.status(400).json({ error: 'Questions must be an array' });
        return;
      }

      const review = await expertReviewDb.getById(req.params.id);
      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      await expertReviewDb.update(req.params.id, {
        questionnaire: questions,
        questionnaire_sent_at: new Date().toISOString(),
        status: 'questionnaire_sent',
      });

      // Notify user that questionnaire is ready
      if (review.user_email) {
        await sendQuestionnaireReady(review.user_email, review.user_name || 'there');
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error setting questionnaire:', error);
      res.status(500).json({ error: 'Failed to set questionnaire' });
    }
  }
);

/**
 * POST /api/expert-review/admin/:id/upload-rewrite
 * Upload the rewritten resume (admin only)
 */
router.post(
  '/admin/:id/upload-rewrite',
  authMiddleware,
  adminMiddleware,
  express.raw({ type: ['application/pdf', 'application/octet-stream'], limit: '10mb' }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const review = await expertReviewDb.getById(req.params.id);
      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      if (!supabase) {
        res.status(503).json({ error: 'Storage not configured' });
        return;
      }

      const filename = (req.headers['x-filename'] as string) || 'expert-rewrite.pdf';
      const storagePath = `${review.user_id}/${review.id}/rewritten-${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('expert-reviews')
        .upload(storagePath, req.body, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        res.status(500).json({ error: 'Failed to upload rewritten resume' });
        return;
      }

      await expertReviewDb.update(review.id, {
        rewritten_resume_url: storagePath,
        rewritten_resume_filename: filename,
        completed_at: new Date().toISOString(),
        status: 'completed',
      });

      // Notify user that their rewritten resume is ready
      if (review.user_email) {
        await sendRewrittenResumeReady(review.user_email, review.user_name || 'there');
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error uploading rewrite:', error);
      res.status(500).json({ error: 'Failed to upload rewritten resume' });
    }
  }
);

/**
 * GET /api/expert-review/admin/:id/download-original
 * Download user's original resume (admin only)
 */
router.get(
  '/admin/:id/download-original',
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const review = await expertReviewDb.getById(req.params.id);
      if (!review || !review.original_resume_url) {
        res.status(404).json({ error: 'Original resume not found' });
        return;
      }

      if (!supabase) {
        res.status(503).json({ error: 'Storage not configured' });
        return;
      }

      const { data } = await supabase.storage
        .from('expert-reviews')
        .createSignedUrl(review.original_resume_url, 3600);

      if (!data?.signedUrl) {
        res.status(500).json({ error: 'Failed to generate download link' });
        return;
      }

      res.json({
        downloadUrl: data.signedUrl,
        filename: review.original_resume_filename || 'original-resume.pdf',
      });
    } catch (error: any) {
      console.error('Error generating download:', error);
      res.status(500).json({ error: 'Failed to generate download' });
    }
  }
);

/**
 * GET /api/expert-review/admin/:id/answers
 * View questionnaire answers (admin only)
 */
router.get(
  '/admin/:id/answers',
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const review = await expertReviewDb.getById(req.params.id);
      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.json({
        questionnaire: review.questionnaire || [],
        answers: review.questionnaire_answers || [],
        completedAt: review.questionnaire_completed_at,
      });
    } catch (error: any) {
      console.error('Error fetching answers:', error);
      res.status(500).json({ error: 'Failed to fetch answers' });
    }
  }
);

export default router;

/**
 * User Data Management Routes
 *
 * GDPR compliance endpoints for:
 * - Data export (right to data portability)
 * - Account deletion (right to be forgotten)
 */

import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { resumeDb, applicationDb, subscriptionDb, courseDb } from '../services/database.js';

const router = express.Router();

/**
 * Helper to check if Supabase is configured
 */
const ensureSupabaseConfigured = (res: Response): boolean => {
  if (!supabase) {
    res.status(503).json({
      error: 'Authentication service is not configured. Please add Supabase credentials to .env file.',
    });
    return false;
  }
  return true;
};

/**
 * GET /api/user/export-data
 * Export all user data (GDPR compliance - right to data portability)
 *
 * Returns all data associated with the user's account:
 * - User profile
 * - Resumes
 * - Job applications
 * - Course enrollments
 * - Subscription information
 */
router.get('/export-data', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureSupabaseConfigured(res)) return;

    const userId = req.user!.id;
    const userEmail = req.user!.email;

    console.log(`📦 Data export requested by user: ${userEmail}`);

    // Get user profile from Supabase Auth
    const { data: authUser, error: authError } = await supabase!.auth.admin.getUserById(userId);

    if (authError) {
      console.error('Error fetching user data:', authError);
      res.status(500).json({ error: 'Failed to fetch user data' });
      return;
    }

    // Get all resumes
    const resumes = await resumeDb.getAll(userId);

    // Get all resume versions
    const { data: resumeVersions } = await supabase!
      .from('resume_versions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Get all job applications
    const applications = await applicationDb.getAll(userId);

    // Get course enrollments
    const enrollments = await courseDb.getUserEnrollments(userId);

    // Get subscription data
    const subscription = await subscriptionDb.getCurrent(userId);

    // Compile all data
    const exportData = {
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        created_at: authUser.user.created_at,
        user_metadata: authUser.user.user_metadata,
      },
      resumes: resumes || [],
      resume_versions: resumeVersions || [],
      applications: applications || [],
      course_enrollments: enrollments || [],
      subscription: subscription || null,
      exported_at: new Date().toISOString(),
      export_format_version: '1.0',
    };

    console.log(`✅ Data export completed for user: ${userEmail}`);

    // Send as JSON download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="career-hub-data-${Date.now()}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Data export error:', error);
    res.status(500).json({ error: 'Failed to export data. Please try again.' });
  }
});

/**
 * DELETE /api/user/account
 * Delete user account and all associated data
 * (GDPR compliance - right to be forgotten)
 *
 * This will:
 * 1. Delete all resumes and resume versions
 * 2. Delete all job applications
 * 3. Delete all course enrollments
 * 4. Delete subscription data
 * 5. Delete the user's Supabase Auth account
 *
 * IMPORTANT: This action is irreversible!
 */
router.delete('/account', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureSupabaseConfigured(res)) return;

    const userId = req.user!.id;
    const userEmail = req.user!.email;
    const { confirmation } = req.body;

    // Require explicit confirmation
    if (confirmation !== 'DELETE MY ACCOUNT') {
      res.status(400).json({
        error: 'Account deletion requires confirmation',
        message: 'Please send { "confirmation": "DELETE MY ACCOUNT" } to confirm account deletion',
      });
      return;
    }

    console.log(`🗑️ Account deletion requested by user: ${userEmail}`);

    // Delete user data in order (child tables first due to foreign keys)

    // 1. Delete resume versions
    const { error: versionsError } = await supabase!
      .from('resume_versions')
      .delete()
      .eq('user_id', userId);

    if (versionsError) {
      console.error('Error deleting resume versions:', versionsError);
    }

    // 2. Delete course enrollments
    const { error: enrollmentsError } = await supabase!
      .from('course_enrollments')
      .delete()
      .eq('user_id', userId);

    if (enrollmentsError) {
      console.error('Error deleting course enrollments:', enrollmentsError);
    }

    // 3. Delete applications
    const { error: applicationsError } = await supabase!
      .from('applications')
      .delete()
      .eq('user_id', userId);

    if (applicationsError) {
      console.error('Error deleting applications:', applicationsError);
    }

    // 4. Delete resumes
    const { error: resumesError } = await supabase!
      .from('resumes')
      .delete()
      .eq('user_id', userId);

    if (resumesError) {
      console.error('Error deleting resumes:', resumesError);
    }

    // 5. Delete subscription
    const { error: subscriptionError } = await supabase!
      .from('subscriptions')
      .delete()
      .eq('user_id', userId);

    if (subscriptionError) {
      console.error('Error deleting subscription:', subscriptionError);
    }

    // 6. Delete user from Supabase Auth (this is the final step)
    const { error: deleteUserError } = await supabase!.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('Error deleting user account:', deleteUserError);
      res.status(500).json({ error: 'Failed to delete account. Please contact support.' });
      return;
    }

    console.log(`✅ Account and all data deleted for user: ${userEmail}`);

    res.json({
      message: 'Account and all associated data have been permanently deleted',
      deleted_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Failed to delete account. Please try again.' });
  }
});

/**
 * GET /api/user/data-summary
 * Get a summary of user's data (for privacy dashboard)
 *
 * Returns counts of all data associated with the account
 */
router.get('/data-summary', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureSupabaseConfigured(res)) return;

    const userId = req.user!.id;

    // Get counts for all data types
    const resumes = await resumeDb.getAll(userId);
    const applications = await applicationDb.getAll(userId);
    const enrollments = await courseDb.getUserEnrollments(userId);
    const subscription = await subscriptionDb.getCurrent(userId);

    const summary = {
      resumes_count: resumes?.length || 0,
      applications_count: applications?.length || 0,
      course_enrollments_count: enrollments?.length || 0,
      has_active_subscription: !!subscription,
      subscription_plan: subscription?.plan || 'free',
    };

    res.json(summary);
  } catch (error) {
    console.error('Data summary error:', error);
    res.status(500).json({ error: 'Failed to fetch data summary' });
  }
});

export default router;

import express, { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { signupSchema, loginSchema } from '../validators/schemas.js';
import {
  recordFailedLogin,
  isAccountLocked,
  clearLoginAttempts,
} from '../utils/loginAttempts.js';

const router = express.Router();

// Helper to check if Supabase is configured
const ensureSupabaseConfigured = (res: Response): boolean => {
  if (!supabase) {
    res.status(503).json({
      error: 'Authentication service is not configured. Please add Supabase credentials to .env file.'
    });
    return false;
  }
  return true;
};

/**
 * POST /api/auth/signup
 * Register a new user with email and password
 */
router.post('/signup', signupSchema, validate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!ensureSupabaseConfigured(res)) return;

    const { email, password, fullName } = req.body;

    // Create user with Supabase Auth
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 * Includes account lockout protection against brute force attacks
 */
router.post('/login', loginSchema, validate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!ensureSupabaseConfigured(res)) return;

    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if account is locked due to failed attempts
    const lockStatus = isAccountLocked(normalizedEmail);
    if (lockStatus.isLocked) {
      console.warn(`🔒 Locked account login attempt: ${normalizedEmail}`);
      res.status(429).json({
        error: lockStatus.message,
        lockedUntil: lockStatus.lockedUntil,
        remainingAttempts: 0,
      });
      return;
    }

    // Attempt Supabase authentication
    const { data, error } = await supabase!.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      // Record failed login attempt
      const attemptStatus = recordFailedLogin(normalizedEmail);

      res.status(401).json({
        error: attemptStatus.message,
        remainingAttempts: attemptStatus.remainingAttempts,
        lockedUntil: attemptStatus.lockedUntil,
      });
      return;
    }

    // Successful login - clear any failed attempts
    clearLoginAttempts(normalizedEmail);

    console.log(`✅ User logged in: ${normalizedEmail} (ID: ${data.user.id})`);

    res.status(200).json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

/**
 * POST /api/auth/logout
 * Logout the current user (requires auth)
 */
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureSupabaseConfigured(res)) return;

    // Extract token from Authorization header
    const token = req.headers.authorization?.substring(7);

    if (!token) {
      res.status(400).json({ error: 'No token provided' });
      return;
    }

    // Sign out user
    const { error } = await supabase!.auth.admin.signOut(token);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

/**
 * GET /api/auth/user
 * Get current authenticated user info (requires auth)
 */
router.get('/user', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureSupabaseConfigured(res)) return;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Get full user details from Supabase
    const { data, error } = await supabase!.auth.admin.getUserById(req.user.id);

    if (error || !data.user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name || '',
        createdAt: data.user.created_at,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

/**
 * POST /api/auth/google
 * Initiate Google OAuth sign-in
 */
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!ensureSupabaseConfigured(res)) return;

    const { data, error } = await supabase!.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.FRONTEND_URL}/auth/callback`,
      },
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ url: data.url });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'Failed to initiate Google sign-in' });
  }
});

/**
 * POST /api/auth/facebook
 * Initiate Facebook OAuth sign-in
 */
router.post('/facebook', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!ensureSupabaseConfigured(res)) return;

    const { data, error } = await supabase!.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${process.env.FRONTEND_URL}/auth/callback`,
      },
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ url: data.url });
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    res.status(500).json({ error: 'Failed to initiate Facebook sign-in' });
  }
});

/**
 * POST /api/auth/password-reset/request
 * Request password reset email
 * Sends email with reset link to user
 */
router.post('/password-reset/request', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!ensureSupabaseConfigured(res)) return;

    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Supabase sends password reset email automatically
    const { error } = await supabase!.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    // Always return success message (don't reveal if email exists for security)
    if (error) {
      console.error('Password reset request error:', error.message);
    } else {
      console.log(`📧 Password reset email sent to: ${normalizedEmail}`);
    }

    res.status(200).json({
      message: 'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

/**
 * POST /api/auth/password-change
 * Change password for authenticated user
 * Requires valid session
 */
router.post('/password-change', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureSupabaseConfigured(res)) return;

    const { newPassword } = req.body;

    if (!newPassword) {
      res.status(400).json({ error: 'New password is required' });
      return;
    }

    // Validate password strength (basic check)
    if (newPassword.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long' });
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      res.status(400).json({
        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      });
      return;
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);

    if (!token) {
      res.status(401).json({ error: 'No authentication token provided' });
      return;
    }

    // Update password using Supabase
    const { error } = await supabase!.auth.admin.updateUserById(req.user!.id, {
      password: newPassword,
    });

    if (error) {
      console.error('Password change error:', error.message);
      res.status(400).json({ error: error.message });
      return;
    }

    console.log(`🔐 Password changed for user: ${req.user?.email} (ID: ${req.user?.id})`);

    res.status(200).json({
      message: 'Password changed successfully. Please log in with your new password.',
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 * Supabase handles token refresh automatically on client-side,
 * but this endpoint provides server-side refresh capability
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!ensureSupabaseConfigured(res)) return;

    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    // Refresh session with Supabase
    const { data, error } = await supabase!.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      console.warn('Token refresh failed:', error?.message);
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    console.log(`🔄 Token refreshed for user: ${data.user?.email}`);

    res.status(200).json({
      session: data.session,
      user: data.user,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

export default router;

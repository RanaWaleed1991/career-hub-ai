import express, { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

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
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!ensureSupabaseConfigured(res)) return;

    const { email, password, fullName } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

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
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!ensureSupabaseConfigured(res)) return;

    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401).json({ error: error.message });
      return;
    }

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

export default router;

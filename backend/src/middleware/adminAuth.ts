import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import { AuthRequest } from './auth.js';

/**
 * Middleware to verify that the authenticated user is an administrator
 * MUST be used AFTER authMiddleware to ensure user is authenticated first
 */
export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      res.status(503).json({
        error: 'Authentication service is not configured. Please contact the administrator.'
      });
      return;
    }

    // Check if user is authenticated (should be set by authMiddleware)
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Get user data with metadata from Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Check if user has admin role in user_metadata
    const userRole = user.user_metadata?.role;

    if (userRole !== 'admin') {
      res.status(403).json({
        error: 'Access denied. Administrator privileges required.'
      });
      return;
    }

    // User is admin, proceed to next middleware/route handler
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

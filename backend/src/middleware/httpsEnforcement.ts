/**
 * HTTPS Enforcement Middleware
 *
 * Ensures all requests use HTTPS in production and adds
 * security headers for sensitive pages
 */

import { Request, Response, NextFunction } from 'express';
import { isDevelopment } from '../config/validateEnv.js';

/**
 * Redirect HTTP to HTTPS in production
 * Protects data in transit by enforcing encrypted connections
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Next middleware function
 */
export function enforceHttps(req: Request, res: Response, next: NextFunction): void {
  // Skip in development mode
  if (isDevelopment()) {
    return next();
  }

  // Check if request is secure
  const isSecure = req.secure || req.get('x-forwarded-proto') === 'https';

  if (!isSecure) {
    // Redirect to HTTPS
    const httpsUrl = `https://${req.get('host')}${req.url}`;
    console.log(`⚠️ Redirecting HTTP to HTTPS: ${req.get('host')}${req.url}`);
    return res.redirect(301, httpsUrl);
  }

  next();
}

/**
 * Add security headers for sensitive pages
 * Prevents caching and adds additional security headers
 *
 * Use this middleware on routes that handle:
 * - User data (resumes, personal info)
 * - Payment information
 * - Authentication
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Next middleware function
 */
export function addSecurityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevent caching of sensitive data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // These are already set by Helmet (from Sprint 6.1), but we reinforce them here:
  // Prevent page from being displayed in iframe (clickjacking protection)
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable XSS protection (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  next();
}

/**
 * Require HTTPS for specific routes
 * Rejects non-HTTPS requests in production with an error
 *
 * Use this for critical endpoints that must always use HTTPS
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Next middleware function
 */
export function requireHttps(req: Request, res: Response, next: NextFunction): void {
  // Skip in development
  if (isDevelopment()) {
    return next();
  }

  // Check if request is secure
  const isSecure = req.secure || req.get('x-forwarded-proto') === 'https';

  if (!isSecure) {
    console.error(`❌ HTTPS required: ${req.method} ${req.path} from ${req.ip}`);
    return res.status(403).json({
      error: 'HTTPS required for this endpoint',
    });
  }

  next();
}

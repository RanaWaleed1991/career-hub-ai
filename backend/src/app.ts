/**
 * Express App Configuration
 *
 * This file exports the configured Express app without starting the server,
 * allowing it to be imported for testing
 */

// Load polyfills FIRST before any other imports
import './polyfills.js';

import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { helmetConfig, getCorsOptions, jsonErrorHandler, requestSizeLimit } from './middleware/security.js';
import { generalLimiter, aiLimiter, authLimiter, paymentLimiter, strictLimiter } from './middleware/rateLimiting.js';
import { requestLogger, errorLogger, errorHandler, suspiciousActivityDetector } from './middleware/requestLogger.js';
import geminiRoutes from './routes/gemini.js';
import authRoutes from './routes/auth.js';
import resumesRoutes from './routes/resumes.js';
import versionsRoutes from './routes/versions.js';
import applicationsRoutes from './routes/applications.js';
import subscriptionsRoutes from './routes/subscriptions.js';
import paymentsRoutes from './routes/payments.js';
import webhooksRoutes from './routes/webhooks.js';
import jobsRoutes from './routes/jobs.js';
import coursesRoutes from './routes/courses.js';
import userRoutes from './routes/user.js';
import { enforceHttps, addSecurityHeaders } from './middleware/httpsEnforcement.js';

export const app = express();

// ============================================================================
// SECURITY MIDDLEWARE (Order is important!)
// ============================================================================

// 1. HTTPS enforcement (must be first - before any other processing)
app.use(enforceHttps);

// 2. Helmet - Security headers
app.use(helmetConfig);

// 3. CORS - Cross-Origin Resource Sharing
app.use(cors(getCorsOptions()));

// 4. Request logging and monitoring
app.use(requestLogger);
app.use(suspiciousActivityDetector);

// 5. Request size limit check
app.use(requestSizeLimit);

// IMPORTANT: Webhooks must be registered BEFORE express.json() middleware
// because Stripe needs the raw body to verify signatures
app.use('/api/webhooks', webhooksRoutes);

// 5. JSON body parsing for all other routes (with error handling)
app.use(express.json({ limit: '10mb' })); // Increased limit for resume uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(jsonErrorHandler);

// ============================================================================
// ROUTES (with rate limiting)
// ============================================================================

// Health check endpoint (no rate limit)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes - strict rate limiting to prevent brute force
app.use('/api/auth', authLimiter, authRoutes);

// AI-powered routes - rate limited due to high cost
app.use('/api/gemini', aiLimiter, geminiRoutes);

// Payment routes - strict rate limiting to prevent payment abuse
app.use('/api/payments', paymentLimiter, paymentsRoutes);

// Subscription routes - general rate limiting (users check subscription status frequently)
app.use('/api/subscriptions', generalLimiter, subscriptionsRoutes);

// Admin routes - strict rate limiting for sensitive operations
// Note: These are protected by adminMiddleware inside the route files
app.use('/api/jobs', strictLimiter, jobsRoutes);
app.use('/api/courses', strictLimiter, coursesRoutes);

// User data management routes - GDPR compliance (with security headers)
app.use('/api/user', generalLimiter, addSecurityHeaders, userRoutes);

// General API routes - standard rate limiting (with security headers for sensitive data)
app.use('/api/resumes', generalLimiter, addSecurityHeaders, resumesRoutes);
app.use('/api/versions', generalLimiter, addSecurityHeaders, versionsRoutes);
app.use('/api/applications', generalLimiter, addSecurityHeaders, applicationsRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error logging and handling
app.use(errorLogger);
app.use(errorHandler);

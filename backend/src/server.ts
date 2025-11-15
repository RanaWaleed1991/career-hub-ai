// Load polyfills FIRST before any other imports
import './polyfills.js';

import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { validateEnv } from './config/validateEnv.js';
import { performSecurityChecks, logSecurityFeatures } from './utils/securityChecks.js';
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

// Validate environment variables at startup
validateEnv();

// Perform security checks
const securityStatus = performSecurityChecks();

// Exit if critical security issues found
if (!securityStatus.secure) {
  console.error('❌ Critical security issues detected. Server will not start.');
  process.exit(1);
}

// Log enabled security features
logSecurityFeatures();

const app = express();

// ============================================================================
// SECURITY MIDDLEWARE (Order is important!)
// ============================================================================

// 1. Helmet - Security headers (must be first)
app.use(helmetConfig);

// 2. CORS - Cross-Origin Resource Sharing
app.use(cors(getCorsOptions()));

// 3. Request logging and monitoring
app.use(requestLogger);
app.use(suspiciousActivityDetector);

// 4. Request size limit check
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

// Payment routes - rate limited to prevent abuse
app.use('/api/payments', paymentLimiter, paymentsRoutes);
app.use('/api/subscriptions', paymentLimiter, subscriptionsRoutes);

// Admin routes - strict rate limiting for sensitive operations
// Note: These are protected by adminMiddleware inside the route files
app.use('/api/jobs', strictLimiter, jobsRoutes);
app.use('/api/courses', strictLimiter, coursesRoutes);

// General API routes - standard rate limiting
app.use('/api/resumes', generalLimiter, resumesRoutes);
app.use('/api/versions', generalLimiter, versionsRoutes);
app.use('/api/applications', generalLimiter, applicationsRoutes);

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

// Start server
app.listen(env.PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${env.PORT}`);
  console.log(`📡 CORS enabled for: ${env.FRONTEND_URL}`);
  console.log(`🔑 Gemini API key configured: ${env.GEMINI_API_KEY ? '✓' : '✗'}`);

  // Check Supabase configuration
  const supabaseConfigured = env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY;
  console.log(`🔐 Supabase Auth configured: ${supabaseConfigured ? '✓' : '✗'}`);

  if (!supabaseConfigured) {
    console.log('⚠️  WARNING: Supabase is not configured. Authentication will not work.');
    console.log('   Add SUPABASE_URL and SUPABASE_SERVICE_KEY to backend/.env');
    console.log('   See SUPABASE_SETUP.md for setup instructions.');
  }

  // Check Stripe configuration
  const stripeConfigured = env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET;
  console.log(`💳 Stripe Payments configured: ${stripeConfigured ? '✓' : '✗'}`);

  if (!stripeConfigured) {
    console.log('⚠️  WARNING: Stripe is not configured. Payments will not work.');
    console.log('   Add STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and STRIPE_PUBLISHABLE_KEY to backend/.env');
  }
});

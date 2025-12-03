/**
 * Server Entry Point
 *
 * Starts the Express server and performs environment validation
 */

// IMPORTANT: Sentry instrumentation must be imported FIRST
import './instrument.js';

import { env } from './config/env.js';
import { validateEnv } from './config/validateEnv.js';
import { performSecurityChecks, logSecurityFeatures } from './utils/securityChecks.js';
import app from './app.js';

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

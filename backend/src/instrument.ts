/**
 * Sentry Instrumentation
 *
 * MUST be imported at the very top of server.ts before anything else
 * This ensures Sentry can properly instrument all modules
 */

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: "https://01808899537d24543bdb5be1e81e5dcd@o4510462839029760.ingest.us.sentry.io/4510467989962752",

  integrations: [
    // Enable profiling (performance monitoring)
    nodeProfilingIntegration(),
  ],

  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring

  // Set profiling sampling rate
  profilesSampleRate: 1.0, // Profile 100% of transactions

  // Environment
  environment: process.env.NODE_ENV || 'production',
});

export default Sentry;

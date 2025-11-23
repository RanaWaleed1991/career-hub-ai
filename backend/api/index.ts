/**
 * Vercel Serverless Function Entry Point
 *
 * This file exports the Express app as a serverless function for Vercel
 */

// Load polyfills first
import '../src/polyfills.js';

import { app } from '../src/app.js';

// Export the Express app for Vercel serverless
export default app;

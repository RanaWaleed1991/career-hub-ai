/**
 * Test Setup File
 *
 * This file runs before all tests to configure the testing environment
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.PORT = '3001';
process.env.FRONTEND_URL = 'http://localhost:5173';

// Supabase mock credentials
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-service-key-minimum-32-characters-long-for-testing';
process.env.SUPABASE_ANON_KEY = 'test-anon-key-minimum-32-characters-long-for-testing';

// API Keys (mock)
process.env.GEMINI_API_KEY = 'test-gemini-api-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_stripe_secret_key';
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_stripe_publishable_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock_webhook_secret';
process.env.STRIPE_WEEKLY_PRICE_ID = 'price_test_weekly';
process.env.STRIPE_MONTHLY_PRICE_ID = 'price_test_monthly';

// Adzuna API (mock)
process.env.ADZUNA_APP_ID = 'test-adzuna-app-id';
process.env.ADZUNA_API_KEY = 'test-adzuna-api-key';

// Suppress console logs during tests (optional - uncomment if needed)
// This keeps test output clean
global.console = {
  ...console,
  log: jest.fn(), // Silent
  debug: jest.fn(), // Silent
  info: jest.fn(), // Silent
  warn: jest.fn(), // Silent
  error: console.error, // Keep errors visible for debugging
};

// Global test timeout
jest.setTimeout(5000); // 5 seconds

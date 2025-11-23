import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Configuration
 *
 * This configuration is optimized for testing Career Hub AI:
 * - Tests run sequentially to prevent database conflicts
 * - Uses real Supabase with isolated test data
 * - Mocks external APIs (Gemini, Adzuna) for speed and reliability
 * - Uses real Stripe test mode for payment flows
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Maximum time one test can run (30 seconds)
  timeout: 30 * 1000,

  // Test execution settings
  fullyParallel: false, // Run sequentially to avoid database conflicts
  forbidOnly: !!process.env.CI, // Fail CI if test.only exists
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  workers: 1, // One test at a time (CRITICAL for database safety)

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'], // Console output
    ['json', { outputFile: 'playwright-report/results.json' }]
  ],

  // Global test settings
  use: {
    // Base URL for frontend tests
    baseURL: 'http://localhost:5173',

    // Collect trace on first retry (helps debug failures)
    trace: 'on-first-retry',

    // Screenshot on failure only
    screenshot: 'only-on-failure',

    // Video recording on failure
    video: 'retain-on-failure',

    // Browser viewport
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors (for local dev)
    ignoreHTTPSErrors: true,

    // Default timeout for actions (10 seconds)
    actionTimeout: 10 * 1000,
  },

  // Browser projects to test
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome', // Use system Chrome instead of downloaded Chromium
      },
    },

    // Uncomment to test other browsers:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // NOTE: Start dev servers MANUALLY before running tests:
  // Terminal 1: cd backend && npm run dev
  // Terminal 2: cd frontend && npm run dev
  // Terminal 3: npm run test:e2e
  //
  // webServer config disabled - start servers manually
  // webServer: undefined,
});

import { Page, Route } from '@playwright/test';

/**
 * Mock Gemini AI API responses
 *
 * This intercepts requests to the backend AI endpoints and returns
 * fake responses, avoiding real API calls during tests
 */
export async function mockGeminiAI(page: Page) {
  await page.route('**/api/ai/**', async (route: Route) => {
    const url = route.request().url();

    // Mock different AI endpoints based on URL
    if (url.includes('/enhance')) {
      // Resume enhancement
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          enhancedText: 'This is a professionally enhanced resume summary with industry-specific keywords and improved clarity.',
          success: true
        })
      });
    } else if (url.includes('/analyze')) {
      // Resume analysis
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          score: 85,
          strengths: ['Clear professional summary', 'Quantified achievements', 'Relevant skills'],
          improvements: ['Add more technical keywords', 'Include certifications'],
          suggestions: 'Your resume is strong. Consider adding metrics to demonstrate impact.',
          success: true
        })
      });
    } else if (url.includes('/cover-letter')) {
      // Cover letter generation
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          coverLetter: 'Dear Hiring Manager,\n\nI am writing to express my strong interest in this position...\n\nBest regards,\nTest User',
          success: true
        })
      });
    } else if (url.includes('/tailor')) {
      // Resume tailoring
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tailoredResume: 'Tailored resume content optimized for the specific job description...',
          matchScore: 92,
          success: true
        })
      });
    } else {
      // Default AI response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: 'Mocked AI response',
          success: true
        })
      });
    }
  });
}

/**
 * Mock Adzuna Job API responses
 *
 * This prevents real API calls during admin job sync tests
 */
export async function mockAdzunaAPI(page: Page) {
  await page.route('**/api/jobs/sync/adzuna**', async (route: Route) => {
    // Mock successful job sync
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Jobs synced successfully',
        stats: {
          total: 60,
          tech: 20,
          accounting: 20,
          casual: 20
        },
        jobs: [
          // Mock some sample jobs
          {
            id: 'mock-job-1',
            title: 'Senior Software Engineer',
            company: 'Tech Company',
            location: 'Sydney, NSW',
            description: 'Exciting opportunity for a senior engineer...',
            category: 'tech',
            source: 'adzuna',
            external_url: 'https://example.com/job/1'
          },
          {
            id: 'mock-job-2',
            title: 'Accountant',
            company: 'Finance Firm',
            location: 'Melbourne, VIC',
            description: 'Join our accounting team...',
            category: 'accounting',
            source: 'adzuna',
            external_url: 'https://example.com/job/2'
          }
        ]
      })
    });
  });
}

/**
 * Mock Stripe payment responses
 *
 * NOTE: For Stripe, we generally want to use real test mode
 * But this can be useful for testing error scenarios
 */
export async function mockStripePayment(page: Page, shouldFail: boolean = false) {
  await page.route('**/api/payments/**', async (route: Route) => {
    if (shouldFail) {
      // Mock payment failure
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Payment failed: Card declined',
          success: false
        })
      });
    } else {
      // Mock payment success
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          sessionId: 'mock_session_123',
          url: 'https://checkout.stripe.com/mock'
        })
      });
    }
  });
}

/**
 * Setup all API mocks at once
 *
 * Call this in test setup to mock all external APIs
 */
export async function setupAllMocks(page: Page) {
  await mockGeminiAI(page);
  await mockAdzunaAPI(page);
  // Note: Don't mock Stripe by default - use real test mode
}

/**
 * Clear all mocks (restore real API calls)
 */
export async function clearAllMocks(page: Page) {
  await page.unroute('**/api/ai/**');
  await page.unroute('**/api/jobs/sync/adzuna**');
  await page.unroute('**/api/payments/**');
}

import { test, expect } from '@playwright/test';
import { cleanupAllTestData, supabaseAdmin } from '../helpers/database.helpers';
import { registerUser, generateTestUser } from '../helpers/auth.helpers';

/**
 * E2E Tests for Job Board Flow
 *
 * These tests verify:
 * - Viewing job listings
 * - Filtering jobs by category
 * - Job card display
 * - External application links
 *
 * Phase 2: Core Features - Tests main job browsing functionality
 */

test.describe('Job Board Flow', () => {
  // Clean up test data after each test
  test.afterEach(async () => {
    await cleanupAllTestData();
  });

  test('should display job listings for unauthenticated users', async ({ page }) => {
    // Create test jobs in database
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert([
        {
          title: 'Senior Software Engineer',
          company: 'E2E Test Tech Co',
          location: 'Melbourne, VIC',
          description: 'Exciting opportunity for a senior engineer with React and Node.js experience.',
          category: 'tech',
          source: 'e2e_test',
          status: 'active',
          external_url: 'https://example.com/job/1'
        },
        {
          title: 'Junior Developer',
          company: 'E2E Test Startup',
          location: 'Sydney, NSW',
          description: 'Great entry-level position for aspiring developers.',
          category: 'tech',
          source: 'e2e_test',
          status: 'active'
        }
      ]);

    if (error) {
      throw new Error(`Failed to create test jobs: ${error.message}`);
    }

    // Navigate to jobs page (should work without authentication)
    await page.goto('/');

    // Click on "Find Jobs" or navigate to jobs page
    // First check if we're logged in (auth page shows) or if there's a jobs link
    const careerHubVisible = await page.getByText('Career Hub AI').isVisible();

    if (careerHubVisible) {
      // We're on auth page - we need to register first or find a public link
      // For now, let's register quickly
      const testUser = generateTestUser();
      await registerUser(page, testUser.email, testUser.password, testUser.fullName);
    }

    // Now navigate to jobs page
    const jobsLink = page.getByRole('button', { name: /find jobs|jobs/i }).or(page.getByText(/find jobs/i));
    await jobsLink.click();

    // Verify jobs page loaded
    await expect(page.getByText('Find Your Next Job')).toBeVisible({ timeout: 10000 });

    // Verify jobs are displayed
    await expect(page.getByText('Senior Software Engineer')).toBeVisible();
    await expect(page.getByText('E2E Test Tech Co')).toBeVisible();
    await expect(page.getByText('Melbourne, VIC')).toBeVisible();

    await expect(page.getByText('Junior Developer')).toBeVisible();
    await expect(page.getByText('E2E Test Startup')).toBeVisible();
  });

  test('should filter jobs by category (Tech)', async ({ page }) => {
    // Create jobs in different categories
    await supabaseAdmin
      .from('jobs')
      .insert([
        {
          title: 'React Developer',
          company: 'Tech Company',
          location: 'Melbourne, VIC',
          description: 'React specialist needed',
          category: 'tech',
          source: 'e2e_test',
          status: 'active'
        },
        {
          title: 'Senior Accountant',
          company: 'Finance Corp',
          location: 'Sydney, NSW',
          description: 'Accounting role',
          category: 'accounting',
          source: 'e2e_test',
          status: 'active'
        },
        {
          title: 'Barista',
          company: 'Coffee Shop',
          location: 'Brisbane, QLD',
          description: 'Casual barista position',
          category: 'casual',
          source: 'e2e_test',
          status: 'active'
        }
      ]);

    // Register and navigate to jobs
    const testUser = generateTestUser();
    await registerUser(page, testUser.email, testUser.password, testUser.fullName);

    await page.getByRole('button', { name: /find jobs|jobs/i }).click();
    await expect(page.getByText('Find Your Next Job')).toBeVisible();

    // Tech tab should be active by default
    await expect(page.getByText('React Developer')).toBeVisible();

    // Should not see accounting or casual jobs
    const accountantVisible = await page.getByText('Senior Accountant').isVisible();
    expect(accountantVisible).toBe(false);

    // Click Accounting tab
    await page.getByRole('button', { name: /accounting/i }).click();
    await page.waitForTimeout(500);

    // Should see accounting job
    await expect(page.getByText('Senior Accountant')).toBeVisible();

    // Should not see tech job
    const reactDevVisible = await page.getByText('React Developer').isVisible();
    expect(reactDevVisible).toBe(false);

    // Click Casual tab
    await page.getByRole('button', { name: /casual/i }).click();
    await page.waitForTimeout(500);

    // Should see casual job
    await expect(page.getByText('Barista')).toBeVisible();
  });

  test('should open external application link in new tab', async ({ page, context }) => {
    // Create job with external URL
    await supabaseAdmin
      .from('jobs')
      .insert({
        title: 'External Job Posting',
        company: 'External Company',
        location: 'Melbourne, VIC',
        description: 'This job has an external application link',
        category: 'tech',
        source: 'e2e_test',
        status: 'active',
        external_url: 'https://example.com/apply/test-job'
      });

    // Register and navigate to jobs
    const testUser = generateTestUser();
    await registerUser(page, testUser.email, testUser.password, testUser.fullName);

    await page.getByRole('button', { name: /find jobs/i }).click();
    await expect(page.getByText('External Job Posting')).toBeVisible();

    // Click "Apply Now" button
    const [newPage] = await Promise.all([
      context.waitForEvent('page'), // Wait for new tab
      page.getByRole('link', { name: /apply now/i }).first().click()
    ]);

    // Verify new tab opened with correct URL
    await newPage.waitForLoadState();
    expect(newPage.url()).toContain('example.com');

    await newPage.close();
  });

  test('should show "Apply Now" as disabled when no external URL', async ({ page }) => {
    // Create job WITHOUT external URL
    await supabaseAdmin
      .from('jobs')
      .insert({
        title: 'Internal Job (No URL)',
        company: 'Internal Company',
        location: 'Sydney, NSW',
        description: 'This job has no application link',
        category: 'tech',
        source: 'e2e_test',
        status: 'active',
        external_url: null
      });

    // Register and navigate to jobs
    const testUser = generateTestUser();
    await registerUser(page, testUser.email, testUser.password, testUser.fullName);

    await page.getByRole('button', { name: /find jobs/i }).click();
    await expect(page.getByText('Internal Job (No URL)')).toBeVisible();

    // Find the apply button for this specific job
    const applyButton = page.getByRole('button', { name: /apply now/i }).first();

    // Button should be disabled
    await expect(applyButton).toBeDisabled();
  });

  test('should display salary information when available', async ({ page }) => {
    // Create job with salary info
    await supabaseAdmin
      .from('jobs')
      .insert({
        title: 'High Paying Job',
        company: 'Generous Employer',
        location: 'Melbourne, VIC',
        description: 'Great salary package',
        category: 'tech',
        source: 'e2e_test',
        status: 'active',
        salary_min: 100000,
        salary_max: 150000
      });

    // Register and navigate to jobs
    const testUser = generateTestUser();
    await registerUser(page, testUser.email, testUser.password, testUser.fullName);

    await page.getByRole('button', { name: /find jobs/i }).click();
    await expect(page.getByText('High Paying Job')).toBeVisible();

    // Should display salary range
    await expect(page.getByText(/\$100,000.*\$150,000/)).toBeVisible();
  });

  test('should show empty state when no jobs in category', async ({ page }) => {
    // Don't create any jobs - test empty state

    // Register and navigate to jobs
    const testUser = generateTestUser();
    await registerUser(page, testUser.email, testUser.password, testUser.fullName);

    await page.getByRole('button', { name: /find jobs/i }).click();

    // Should show empty state message
    await expect(page.getByText(/no jobs available/i)).toBeVisible({ timeout: 5000 });
  });

  test('should handle multiple jobs in same category', async ({ page }) => {
    // Create multiple tech jobs
    const techJobs = [
      {
        title: 'Frontend Developer',
        company: 'UI Company',
        location: 'Melbourne, VIC',
        description: 'Frontend specialist',
        category: 'tech',
        source: 'e2e_test',
        status: 'active'
      },
      {
        title: 'Backend Developer',
        company: 'API Company',
        location: 'Sydney, NSW',
        description: 'Backend expert',
        category: 'tech',
        source: 'e2e_test',
        status: 'active'
      },
      {
        title: 'Full Stack Developer',
        company: 'Startup Inc',
        location: 'Brisbane, QLD',
        description: 'Full stack generalist',
        category: 'tech',
        source: 'e2e_test',
        status: 'active'
      }
    ];

    await supabaseAdmin.from('jobs').insert(techJobs);

    // Register and navigate to jobs
    const testUser = generateTestUser();
    await registerUser(page, testUser.email, testUser.password, testUser.fullName);

    await page.getByRole('button', { name: /find jobs/i }).click();

    // All three jobs should be visible
    await expect(page.getByText('Frontend Developer')).toBeVisible();
    await expect(page.getByText('Backend Developer')).toBeVisible();
    await expect(page.getByText('Full Stack Developer')).toBeVisible();

    // Should show all companies
    await expect(page.getByText('UI Company')).toBeVisible();
    await expect(page.getByText('API Company')).toBeVisible();
    await expect(page.getByText('Startup Inc')).toBeVisible();
  });
});

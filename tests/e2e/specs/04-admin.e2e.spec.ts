import { test, expect } from '@playwright/test';
import { cleanupAllTestData, createTestAdmin, createTestUser, supabaseAdmin } from '../helpers/database.helpers';
import { login, loginAsAdmin } from '../helpers/auth.helpers';
import { mockAdzunaAPI } from '../helpers/mock.helpers';

/**
 * E2E Tests for Admin Panel Flow
 *
 * These tests verify:
 * - Admin access control
 * - Job management (create, delete)
 * - Course management (create, delete)
 * - Adzuna job sync
 *
 * Phase 4: Admin Panel - Most complex, tests privileged operations
 */

test.describe('Admin Panel Flow', () => {
  // Clean up test data after each test
  test.afterEach(async () => {
    await cleanupAllTestData();
  });

  test('should allow admin user to access admin panel', async ({ page }) => {
    // Create admin user
    const admin = await createTestAdmin();

    // Login as admin
    await loginAsAdmin(page, admin.email, admin.password);

    // Should be redirected to admin page automatically
    // OR we can navigate there manually
    await page.waitForTimeout(2000);

    // Check if we're on admin page or dashboard
    const adminPanelVisible = await page.getByText('Admin Panel').isVisible();

    if (!adminPanelVisible) {
      // Navigate to admin page manually
      const adminButton = page.getByRole('button', { name: /admin panel/i });
      await adminButton.click();
    }

    // Verify admin panel loaded
    await expect(page.getByText('Admin Panel')).toBeVisible({ timeout: 10000 });

    // Should see admin tabs
    await expect(page.getByText('Manage Jobs')).toBeVisible();
    await expect(page.getByText('Manage Courses')).toBeVisible();
  });

  test('should block non-admin user from accessing admin panel', async ({ page }) => {
    // Create regular user
    const regularUser = await createTestUser('Regular User');

    // Login as regular user
    await login(page, regularUser.email, regularUser.password);

    // Verify we're on dashboard
    await expect(page.getByText('Dashboard')).toBeVisible();

    // Admin panel button should NOT be visible
    const adminButtonVisible = await page.getByRole('button', { name: /admin panel/i }).isVisible();
    expect(adminButtonVisible).toBe(false);
  });

  test('should create a new job as admin', async ({ page }) => {
    // Create admin user
    const admin = await createTestAdmin();
    await loginAsAdmin(page, admin.email, admin.password);

    // Navigate to admin panel
    const adminButton = page.getByRole('button', { name: /admin panel/i });
    if (await adminButton.isVisible()) {
      await adminButton.click();
    }

    await expect(page.getByText('Admin Panel')).toBeVisible();

    // Make sure we're on Jobs tab
    const manageJobsTab = page.getByRole('button', { name: /manage jobs/i });
    await manageJobsTab.click();

    // Fill job creation form
    await page.locator('input[type="text"]').filter({ has: page.locator('label:has-text("Job Title")') }).fill('E2E Test Job Position');

    // Alternative approach - find inputs by their proximity to labels
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill('E2E Test Job Position'); // Job Title
    await inputs.nth(1).fill('E2E Test Company Ltd'); // Company
    await inputs.nth(2).fill('Melbourne, VIC'); // Location

    // Fill description
    await page.locator('textarea').first().fill('This is an E2E test job posting with detailed description.');

    // Select category
    await page.locator('select').first().selectOption('tech');

    // Submit form
    await page.getByRole('button', { name: /add job/i }).click();

    // Wait for success alert
    await page.waitForTimeout(2000);

    // Verify job appears in the list
    await expect(page.getByText('E2E Test Job Position')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('E2E Test Company Ltd')).toBeVisible();
  });

  test('should delete a job as admin', async ({ page }) => {
    // Create a test job first
    await supabaseAdmin
      .from('jobs')
      .insert({
        title: 'Job to Delete',
        company: 'Delete Me Inc',
        location: 'Sydney, NSW',
        description: 'This job will be deleted',
        category: 'tech',
        source: 'manual',
        status: 'active'
      });

    // Create admin and login
    const admin = await createTestAdmin();
    await loginAsAdmin(page, admin.email, admin.password);

    // Navigate to admin panel
    const adminButton = page.getByRole('button', { name: /admin panel/i });
    if (await adminButton.isVisible()) {
      await adminButton.click();
    }

    await expect(page.getByText('Admin Panel')).toBeVisible();

    // Should see the job in the list
    await expect(page.getByText('Job to Delete')).toBeVisible({ timeout: 5000 });

    // Click delete button (look for red button or trash icon)
    const deleteButton = page.locator('button').filter({ hasText: /delete|remove/i }).or(
      page.locator('button.text-red-500')
    ).first();

    await deleteButton.click();

    // Confirm deletion in dialog
    page.on('dialog', dialog => dialog.accept());
    await page.waitForTimeout(1000);

    // Verify job is removed
    const jobStillVisible = await page.getByText('Job to Delete').isVisible();
    expect(jobStillVisible).toBe(false);
  });

  test('should sync jobs from Adzuna (mocked)', async ({ page }) => {
    // Mock Adzuna API
    await mockAdzunaAPI(page);

    // Create admin and login
    const admin = await createTestAdmin();
    await loginAsAdmin(page, admin.email, admin.password);

    // Navigate to admin panel
    const adminButton = page.getByRole('button', { name: /admin panel/i });
    if (await adminButton.isVisible()) {
      await adminButton.click();
    }

    await expect(page.getByText('Admin Panel')).toBeVisible();

    // Click sync button
    const syncButton = page.getByRole('button', { name: /sync from adzuna/i });
    await syncButton.click();

    // Confirm sync
    page.on('dialog', dialog => dialog.accept());

    // Wait for sync to complete
    await page.waitForTimeout(3000);

    // Should show success message
    await expect(page.getByText(/successfully synced.*jobs/i)).toBeVisible({ timeout: 10000 });
  });

  test('should create a free course as admin', async ({ page }) => {
    // Create admin and login
    const admin = await createTestAdmin();
    await loginAsAdmin(page, admin.email, admin.password);

    // Navigate to admin panel
    const adminButton = page.getByRole('button', { name: /admin panel/i });
    if (await adminButton.isVisible()) {
      await adminButton.click();
    }

    await expect(page.getByText('Admin Panel')).toBeVisible();

    // Switch to Courses tab
    await page.getByRole('button', { name: /manage courses/i }).click();

    // Fill course creation form
    const inputs = page.locator('input[type="text"], input[type="url"]');
    await inputs.filter({ hasText: /title/i }).or(page.locator('label:has-text("Course Title")').locator('..').locator('input')).first().fill('E2E Free Test Course');

    // Alternative: Fill by index
    await page.locator('input[placeholder*="Complete Web Development"]').fill('E2E Free Test Course');
    await page.locator('input[placeholder*="Udemy, Coursera"]').fill('E2E Test Platform');
    await page.locator('textarea[placeholder*="description"]').fill('This is a free test course created by E2E tests');
    await page.locator('input[placeholder*="YouTube"]').fill('https://youtube.com/watch?v=e2etest123');

    // Select type: free
    await page.locator('select').filter({ has: page.locator('option:has-text("Free")') }).selectOption('free');

    // Optional fields
    await page.locator('input[placeholder*="10 hours"]').fill('5 hours');
    await page.locator('select').filter({ has: page.locator('option:has-text("Beginner")') }).selectOption('beginner');
    await page.locator('input[placeholder*="Programming, Design"]').fill('E2E Testing');

    // Submit
    await page.getByRole('button', { name: /add course/i }).click();

    // Wait for success
    await page.waitForTimeout(2000);

    // Verify course appears in list
    await expect(page.getByText('E2E Free Test Course')).toBeVisible({ timeout: 5000 });
  });

  test('should create a paid course with affiliate link as admin', async ({ page }) => {
    // Create admin and login
    const admin = await createTestAdmin();
    await loginAsAdmin(page, admin.email, admin.password);

    // Navigate to admin panel
    const adminButton = page.getByRole('button', { name: /admin panel/i });
    if (await adminButton.isVisible()) {
      await adminButton.click();
    }

    await expect(page.getByText('Admin Panel')).toBeVisible();

    // Switch to Courses tab
    await page.getByRole('button', { name: /manage courses/i }).click();

    // Fill course form
    await page.locator('input[placeholder*="Complete Web Development"]').fill('E2E Paid Premium Course');
    await page.locator('input[placeholder*="Udemy, Coursera"]').fill('E2E Test Platform');
    await page.locator('textarea[placeholder*="description"]').fill('Premium paid course for E2E testing');
    await page.locator('input[placeholder*="YouTube"]').fill('https://udemy.com/premium-e2e');

    // Select type: paid
    const typeSelect = page.locator('select').filter({ has: page.locator('option:has-text("Paid")') });
    await typeSelect.selectOption('paid');

    // Wait for affiliate link field to appear
    await page.waitForTimeout(500);

    // Fill affiliate link (required for paid)
    await page.locator('input[placeholder*="affiliate"]').fill('https://udemy.com/premium-e2e?ref=e2etest123');

    // Submit
    await page.getByRole('button', { name: /add course/i }).click();

    // Wait for success
    await page.waitForTimeout(2000);

    // Verify course appears
    await expect(page.getByText('E2E Paid Premium Course')).toBeVisible({ timeout: 5000 });

    // Should show "paid" type indicator
    await expect(page.getByText(/type.*paid/i)).toBeVisible();
  });

  test('should delete a course as admin', async ({ page }) => {
    // Create a test course first
    await supabaseAdmin
      .from('courses')
      .insert({
        title: 'Course to Delete',
        provider: 'E2E Test Provider',
        description: 'This course will be deleted',
        video_url: 'https://youtube.com/delete-me',
        type: 'free',
        status: 'active'
      });

    // Create admin and login
    const admin = await createTestAdmin();
    await loginAsAdmin(page, admin.email, admin.password);

    // Navigate to admin panel
    const adminButton = page.getByRole('button', { name: /admin panel/i });
    if (await adminButton.isVisible()) {
      await adminButton.click();
    }

    await expect(page.getByText('Admin Panel')).toBeVisible();

    // Switch to Courses tab
    await page.getByRole('button', { name: /manage courses/i }).click();

    // Wait for courses to load
    await page.waitForTimeout(1000);

    // Should see the course
    await expect(page.getByText('Course to Delete')).toBeVisible({ timeout: 5000 });

    // Click delete button
    const deleteButtons = page.locator('button.text-red-500');
    await deleteButtons.first().click();

    // Confirm deletion
    page.on('dialog', dialog => dialog.accept());
    await page.waitForTimeout(1000);

    // Verify course is removed
    const courseStillVisible = await page.getByText('Course to Delete').isVisible();
    expect(courseStillVisible).toBe(false);
  });

  test('should show job count in admin panel', async ({ page }) => {
    // Create some test jobs
    await supabaseAdmin
      .from('jobs')
      .insert([
        {
          title: 'Job 1',
          company: 'Company 1',
          location: 'Location 1',
          description: 'Description 1',
          category: 'tech',
          source: 'manual',
          status: 'active'
        },
        {
          title: 'Job 2',
          company: 'Company 2',
          location: 'Location 2',
          description: 'Description 2',
          category: 'accounting',
          source: 'manual',
          status: 'active'
        }
      ]);

    // Create admin and login
    const admin = await createTestAdmin();
    await loginAsAdmin(page, admin.email, admin.password);

    // Navigate to admin panel
    const adminButton = page.getByRole('button', { name: /admin panel/i });
    if (await adminButton.isVisible()) {
      await adminButton.click();
    }

    await expect(page.getByText('Admin Panel')).toBeVisible();

    // Should show job count
    await expect(page.getByText(/existing jobs.*2/i)).toBeVisible({ timeout: 5000 });
  });

  test('should show course count in admin panel', async ({ page }) => {
    // Create some test courses
    await supabaseAdmin
      .from('courses')
      .insert([
        {
          title: 'Course 1',
          provider: 'Provider 1',
          description: 'Description 1',
          video_url: 'https://youtube.com/course1',
          type: 'free',
          status: 'active'
        },
        {
          title: 'Course 2',
          provider: 'Provider 2',
          description: 'Description 2',
          video_url: 'https://youtube.com/course2',
          type: 'paid',
          affiliate_link: 'https://udemy.com/course2?ref=test',
          status: 'active'
        },
        {
          title: 'Course 3',
          provider: 'Provider 3',
          description: 'Description 3',
          video_url: 'https://youtube.com/course3',
          type: 'free',
          status: 'active'
        }
      ]);

    // Create admin and login
    const admin = await createTestAdmin();
    await loginAsAdmin(page, admin.email, admin.password);

    // Navigate to admin panel
    const adminButton = page.getByRole('button', { name: /admin panel/i });
    if (await adminButton.isVisible()) {
      await adminButton.click();
    }

    await expect(page.getByText('Admin Panel')).toBeVisible();

    // Switch to Courses tab
    await page.getByRole('button', { name: /manage courses/i }).click();

    // Should show course count
    await expect(page.getByText(/existing courses.*3/i)).toBeVisible({ timeout: 5000 });
  });
});

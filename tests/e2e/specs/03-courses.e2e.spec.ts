import { test, expect } from '@playwright/test';
import { cleanupAllTestData, supabaseAdmin } from '../helpers/database.helpers';
import { registerUser, generateTestUser } from '../helpers/auth.helpers';

/**
 * E2E Tests for Courses Flow
 *
 * These tests verify:
 * - Viewing course listings
 * - Filtering courses by type (free/paid)
 * - Course enrollment tracking
 * - Affiliate link redirects for paid courses
 *
 * Phase 2: Core Features - Tests course browsing and enrollment
 */

test.describe('Courses Flow', () => {
  // Clean up test data after each test
  test.afterEach(async () => {
    await cleanupAllTestData();
  });

  test('should display free and paid courses', async ({ page }) => {
    // Create test courses
    await supabaseAdmin
      .from('courses')
      .insert([
        {
          title: 'Free React Course',
          provider: 'E2E Test Provider',
          description: 'Learn React for free with this comprehensive course',
          video_url: 'https://youtube.com/watch?v=test123',
          type: 'free',
          category: 'Programming',
          level: 'beginner',
          duration: '10 hours',
          status: 'active'
        },
        {
          title: 'Advanced Node.js Masterclass',
          provider: 'E2E Test Platform',
          description: 'Master Node.js with this paid premium course',
          video_url: 'https://udemy.com/nodejs-masterclass',
          affiliate_link: 'https://udemy.com/nodejs-masterclass?ref=e2etest',
          type: 'paid',
          category: 'Backend Development',
          level: 'advanced',
          duration: '20 hours',
          status: 'active'
        }
      ]);

    // Register and navigate to courses
    const testUser = generateTestUser();
    await registerUser(page, testUser.email, testUser.password, testUser.fullName);

    // Navigate to courses page
    await page.getByRole('button', { name: /explore courses|courses/i }).click();

    // Verify courses page loaded
    await expect(page.getByText('Recommended Courses')).toBeVisible({ timeout: 10000 });

    // Both courses should be visible
    await expect(page.getByText('Free React Course')).toBeVisible();
    await expect(page.getByText('Advanced Node.js Masterclass')).toBeVisible();

    // Verify course details
    await expect(page.getByText('E2E Test Provider')).toBeVisible();
    await expect(page.getByText('E2E Test Platform')).toBeVisible();
  });

  test('should separate free and paid courses into sections', async ({ page }) => {
    // Create courses
    await supabaseAdmin
      .from('courses')
      .insert([
        {
          title: 'Free Python Course',
          provider: 'E2E Test Provider',
          description: 'Free Python basics',
          video_url: 'https://youtube.com/python',
          type: 'free',
          status: 'active'
        },
        {
          title: 'Paid JavaScript Course',
          provider: 'E2E Test Platform',
          description: 'Premium JavaScript training',
          video_url: 'https://udemy.com/javascript',
          affiliate_link: 'https://udemy.com/javascript?ref=test',
          type: 'paid',
          status: 'active'
        }
      ]);

    // Register and navigate
    const testUser = generateTestUser();
    await registerUser(page, testUser.email, testUser.password, testUser.fullName);
    await page.getByRole('button', { name: /courses/i }).click();

    // Should have separate sections
    await expect(page.getByText('Free Courses')).toBeVisible();
    await expect(page.getByText('Premium Courses')).toBeVisible();

    // Free course should be in free section
    const freeSectionText = await page.locator('section').filter({ hasText: 'Free Courses' }).textContent();
    expect(freeSectionText).toContain('Free Python Course');

    // Paid course should be in premium section
    const paidSectionText = await page.locator('section').filter({ hasText: 'Premium Courses' }).textContent();
    expect(paidSectionText).toContain('Paid JavaScript Course');
  });

  test('should enroll in free course', async ({ page, context }) => {
    // Create free course
    await supabaseAdmin
      .from('courses')
      .insert({
        title: 'Free Testing Course',
        provider: 'E2E Test Provider',
        description: 'Test course for enrollment',
        video_url: 'https://youtube.com/watch?v=enrollment-test',
        type: 'free',
        status: 'active'
      });

    // Register and navigate
    const testUser = generateTestUser();
    await registerUser(page, testUser.email, testUser.password, testUser.fullName);
    await page.getByRole('button', { name: /courses/i }).click();

    await expect(page.getByText('Free Testing Course')).toBeVisible();

    // Click "Start Learning" button
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /start learning/i }).first().click()
    ]);

    // Should redirect to video URL in new tab
    await newPage.waitForLoadState();
    expect(newPage.url()).toContain('youtube.com');

    await newPage.close();
  });

  test('should redirect to affiliate link for paid course', async ({ page, context }) => {
    // Create paid course with affiliate link
    await supabaseAdmin
      .from('courses')
      .insert({
        title: 'Paid Premium Course',
        provider: 'E2E Test Platform',
        description: 'Premium paid course with affiliate tracking',
        video_url: 'https://udemy.com/premium-course',
        affiliate_link: 'https://udemy.com/premium-course?ref=affiliate123',
        type: 'paid',
        status: 'active'
      });

    // Register and navigate
    const testUser = generateTestUser();
    await registerUser(page, testUser.email, testUser.password, testUser.fullName);
    await page.getByRole('button', { name: /courses/i }).click();

    await expect(page.getByText('Paid Premium Course')).toBeVisible();

    // Click "View Course" button (for paid courses)
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /view course/i }).first().click()
    ]);

    // Should redirect to affiliate link
    await newPage.waitForLoadState();
    expect(newPage.url()).toContain('udemy.com');
    expect(newPage.url()).toContain('ref=affiliate123');

    await newPage.close();
  });

  test('should display course metadata (duration, level, category)', async ({ page }) => {
    // Create course with full metadata
    await supabaseAdmin
      .from('courses')
      .insert({
        title: 'Complete Web Development',
        provider: 'E2E Test Academy',
        description: 'Full stack web development course',
        video_url: 'https://udemy.com/web-dev',
        type: 'free',
        duration: '15 hours',
        level: 'intermediate',
        category: 'Web Development',
        thumbnail_url: 'https://example.com/thumbnail.jpg',
        status: 'active'
      });

    // Register and navigate
    const testUser = generateTestUser();
    await registerUser(page, testUser.email, testUser.password, testUser.fullName);
    await page.getByRole('button', { name: /courses/i }).click();

    await expect(page.getByText('Complete Web Development')).toBeVisible();

    // Should display metadata
    await expect(page.getByText('15 hours')).toBeVisible();
    await expect(page.getByText(/intermediate/i)).toBeVisible();
    await expect(page.getByText('Web Development')).toBeVisible();
  });

  test('should show PAID badge on paid courses', async ({ page }) => {
    // Create paid course
    await supabaseAdmin
      .from('courses')
      .insert({
        title: 'Expensive Premium Course',
        provider: 'E2E Test Platform',
        description: 'Premium course with badge',
        video_url: 'https://udemy.com/expensive',
        affiliate_link: 'https://udemy.com/expensive?ref=test',
        type: 'paid',
        status: 'active'
      });

    // Register and navigate
    const testUser = generateTestUser();
    await registerUser(page, testUser.email, testUser.password, testUser.fullName);
    await page.getByRole('button', { name: /courses/i }).click();

    await expect(page.getByText('Expensive Premium Course')).toBeVisible();

    // Should show PAID badge
    await expect(page.getByText('PAID')).toBeVisible();
  });

  test('should show empty state when no courses available', async ({ page }) => {
    // Don't create any courses

    // Register and navigate
    const testUser = generateTestUser();
    await registerUser(page, testUser.email, testUser.password, testUser.fullName);
    await page.getByRole('button', { name: /courses/i }).click();

    // Should show empty state
    await expect(page.getByText(/no.*courses available/i)).toBeVisible({ timeout: 5000 });
  });

  test('should display course thumbnail when available', async ({ page }) => {
    // Create course with thumbnail
    await supabaseAdmin
      .from('courses')
      .insert({
        title: 'Course with Thumbnail',
        provider: 'E2E Test Provider',
        description: 'This course has a thumbnail',
        video_url: 'https://youtube.com/thumbnail-test',
        type: 'free',
        thumbnail_url: 'https://example.com/course-thumbnail.jpg',
        status: 'active'
      });

    // Register and navigate
    const testUser = generateTestUser();
    await registerUser(page, testUser.email, testUser.password, testUser.fullName);
    await page.getByRole('button', { name: /courses/i }).click();

    await expect(page.getByText('Course with Thumbnail')).toBeVisible();

    // Check if image exists with the thumbnail URL
    const thumbnail = page.locator('img[src*="course-thumbnail.jpg"]');
    await expect(thumbnail).toBeVisible();
  });

  test('should show initial letter when no thumbnail', async ({ page }) => {
    // Create course WITHOUT thumbnail
    await supabaseAdmin
      .from('courses')
      .insert({
        title: 'Advanced Data Science',
        provider: 'E2E Test Provider',
        description: 'Course without thumbnail',
        video_url: 'https://youtube.com/no-thumbnail',
        type: 'free',
        thumbnail_url: null,
        status: 'active'
      });

    // Register and navigate
    const testUser = generateTestUser();
    await registerUser(page, testUser.email, testUser.password, testUser.fullName);
    await page.getByRole('button', { name: /courses/i }).click();

    await expect(page.getByText('Advanced Data Science')).toBeVisible();

    // Should show initial letter "A" (from "Advanced")
    await expect(page.getByText('A')).toBeVisible();
  });

  test('should handle multiple courses in same category', async ({ page }) => {
    // Create multiple free courses
    const freeCourses = [
      {
        title: 'React Fundamentals',
        provider: 'E2E Test Provider',
        description: 'React basics',
        video_url: 'https://youtube.com/react',
        type: 'free',
        status: 'active'
      },
      {
        title: 'Vue.js Introduction',
        provider: 'E2E Test Provider',
        description: 'Vue basics',
        video_url: 'https://youtube.com/vue',
        type: 'free',
        status: 'active'
      },
      {
        title: 'Angular Essentials',
        provider: 'E2E Test Provider',
        description: 'Angular basics',
        video_url: 'https://youtube.com/angular',
        type: 'free',
        status: 'active'
      }
    ];

    await supabaseAdmin.from('courses').insert(freeCourses);

    // Register and navigate
    const testUser = generateTestUser();
    await registerUser(page, testUser.email, testUser.password, testUser.fullName);
    await page.getByRole('button', { name: /courses/i }).click();

    // All three courses should be visible
    await expect(page.getByText('React Fundamentals')).toBeVisible();
    await expect(page.getByText('Vue.js Introduction')).toBeVisible();
    await expect(page.getByText('Angular Essentials')).toBeVisible();
  });
});

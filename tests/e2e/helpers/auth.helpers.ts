import { Page, expect } from '@playwright/test';

/**
 * Register a new user via the UI
 *
 * @param page Playwright page object
 * @param email User email
 * @param password User password
 * @param fullName User's full name
 */
export async function registerUser(
  page: Page,
  email: string,
  password: string,
  fullName: string = 'Test User'
) {
  // Navigate to auth page (should show by default for unauthenticated users)
  await page.goto('/');

  // Wait for auth page to load
  await expect(page.getByText('Career Hub AI')).toBeVisible();

  // Pre-set localStorage to prevent Welcome Modal from appearing
  // This is more reliable than trying to close it after registration
  await page.evaluate((userEmail) => {
    const welcomeKey = `welcome_shown_${userEmail.toLowerCase().trim()}`;
    localStorage.setItem(welcomeKey, 'true');
  }, email);

  // Check if we're on login view, switch to signup if needed
  const signupLinkText = "Don't have an account? Sign up";
  const isLoginView = await page.getByText(signupLinkText).isVisible();

  if (isLoginView) {
    await page.getByText(signupLinkText).click();
  }

  // Wait for signup form to be visible
  await expect(page.locator('#fullname-signup')).toBeVisible();

  // Fill signup form
  await page.locator('#fullname-signup').fill(fullName);
  await page.locator('#email-signup').fill(email);
  await page.locator('#password-signup').fill(password);
  await page.locator('#confirm-password-signup').fill(password);

  // Submit form
  await page.getByRole('button', { name: 'Create Account' }).click();

  // Wait for successful registration (redirects to dashboard)
  await page.waitForURL(/\//, { timeout: 15000 });

  // Verify we're logged in by checking for dashboard elements
  // Welcome Modal won't appear because we pre-set the localStorage key
  await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });
}

/**
 * Login an existing user via the UI
 *
 * @param page Playwright page object
 * @param email User email
 * @param password User password
 */
export async function login(page: Page, email: string, password: string) {
  // Navigate to auth page
  await page.goto('/');

  // Wait for auth page to load
  await expect(page.getByText('Career Hub AI')).toBeVisible();

  // Check if we're on signup view, switch to login if needed
  const loginLinkText = 'Already have an account? Sign in';
  const isSignupView = await page.getByText(loginLinkText).isVisible();

  if (isSignupView) {
    await page.getByText(loginLinkText).click();
  }

  // Wait for login form to be visible
  await expect(page.locator('#email-login')).toBeVisible();

  // Fill login form
  await page.locator('#email-login').fill(email);
  await page.locator('#password-login').fill(password);

  // Submit form
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for successful login (redirects to dashboard)
  await page.waitForURL(/\//, { timeout: 15000 });

  // Verify we're logged in
  await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });
}

/**
 * Login as admin user via UI
 *
 * @param page Playwright page object
 * @param email Admin email
 * @param password Admin password
 */
export async function loginAsAdmin(page: Page, email: string, password: string) {
  await login(page, email, password);

  // Admin users are auto-redirected to admin page
  // Wait a bit for potential redirect
  await page.waitForTimeout(1000);
}

/**
 * Logout the current user via UI
 *
 * @param page Playwright page object
 */
export async function logout(page: Page) {
  // Click user menu in header (look for logout button parent)
  // Based on Header component structure, logout button should be visible
  const logoutButton = page.getByRole('button', { name: /logout|sign out/i });

  if (await logoutButton.isVisible()) {
    await logoutButton.click();

    // Wait for redirect to auth page
    await page.waitForURL(/\//, { timeout: 5000 });

    // Verify we're logged out (should see auth page)
    await expect(page.getByText('Career Hub AI')).toBeVisible();
  } else {
    throw new Error('Logout button not found');
  }
}

/**
 * Check if user is logged in
 *
 * @param page Playwright page object
 * @returns True if logged in, false otherwise
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    await page.goto('/');
    // If we see Dashboard, we're logged in
    const dashboardVisible = await page.getByText('Dashboard').isVisible({ timeout: 3000 });
    return dashboardVisible;
  } catch {
    return false;
  }
}

/**
 * Generate unique test email
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `e2e-test-${timestamp}-${random}@mailinator.com`;
}

/**
 * Generate test user credentials
 */
export function generateTestUser() {
  return {
    email: generateTestEmail(),
    password: 'TestPassword123!@#',
    fullName: 'E2E Test User',
  };
}


const CURRENT_USER_KEY = 'career_hub_current_user';
export const ADMIN_EMAIL = 'admin@careerhub.ai';
export const ADMIN_PASSWORD = 'SecureAdminPassword123!';

/**
 * Logs a user in by storing their email in session storage.
 * For the admin user, it validates the password.
 * @param email The user's email address.
 * @param password The user's password (optional).
 * @returns {boolean} True if login is successful, false otherwise.
 */
export const login = (email: string, password?: string): boolean => {
  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail) return false;

  // Admin Login Check
  if (normalizedEmail === ADMIN_EMAIL) {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(CURRENT_USER_KEY, normalizedEmail);
      return true;
    }
    return false; // Wrong password for admin
  }

  // Regular User Simulation (no password check)
  sessionStorage.setItem(CURRENT_USER_KEY, normalizedEmail);
  return true;
};

/**
 * Logs the current user out.
 */
export const logout = (): void => {
  sessionStorage.removeItem(CURRENT_USER_KEY);
};

/**
 * Gets the current logged-in user's email.
 */
export const getCurrentUserEmail = (): string | null => {
  return sessionStorage.getItem(CURRENT_USER_KEY);
};

/**
 * Checks if the current user is an administrator.
 */
export const isAdmin = (): boolean => {
    return getCurrentUserEmail() === ADMIN_EMAIL;
};
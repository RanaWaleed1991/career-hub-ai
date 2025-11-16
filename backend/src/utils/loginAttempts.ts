/**
 * Login Attempts Tracker
 *
 * Tracks failed login attempts and implements account lockout
 * to prevent brute force attacks
 */

interface LoginAttempt {
  email: string;
  attempts: number;
  lastAttempt: Date;
  lockedUntil?: Date;
}

// In-memory store (in production, consider Redis for multi-server deployment)
const loginAttempts = new Map<string, LoginAttempt>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

/**
 * Record failed login attempt
 * Returns lockout status and remaining attempts
 */
export function recordFailedLogin(email: string): {
  isLocked: boolean;
  remainingAttempts: number;
  lockedUntil?: Date;
  message: string;
} {
  const normalizedEmail = email.toLowerCase().trim();
  const now = new Date();

  let attempt = loginAttempts.get(normalizedEmail);

  if (!attempt) {
    // First failed attempt
    attempt = {
      email: normalizedEmail,
      attempts: 1,
      lastAttempt: now,
    };
  } else {
    // Check if outside attempt window - reset if so
    if (now.getTime() - attempt.lastAttempt.getTime() > ATTEMPT_WINDOW) {
      attempt.attempts = 1;
      attempt.lockedUntil = undefined;
    } else {
      // Increment attempts
      attempt.attempts++;
      attempt.lastAttempt = now;

      // Lock account if max attempts reached
      if (attempt.attempts >= MAX_ATTEMPTS) {
        attempt.lockedUntil = new Date(now.getTime() + LOCKOUT_DURATION);
      }
    }
  }

  loginAttempts.set(normalizedEmail, attempt);

  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - attempt.attempts);
  const isLocked = !!attempt.lockedUntil && attempt.lockedUntil > now;

  let message = 'Invalid email or password';
  if (isLocked) {
    const minutesLeft = Math.ceil((attempt.lockedUntil!.getTime() - now.getTime()) / 60000);
    message = `Account locked due to too many failed login attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.`;
  } else if (remainingAttempts > 0 && remainingAttempts <= 2) {
    message = `Invalid email or password. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining before lockout.`;
  }

  console.warn(`⚠️  Failed login attempt for ${normalizedEmail} (${attempt.attempts}/${MAX_ATTEMPTS})`);

  return {
    isLocked,
    remainingAttempts,
    lockedUntil: attempt.lockedUntil,
    message,
  };
}

/**
 * Check if account is currently locked
 */
export function isAccountLocked(email: string): {
  isLocked: boolean;
  lockedUntil?: Date;
  message?: string;
} {
  const normalizedEmail = email.toLowerCase().trim();
  const attempt = loginAttempts.get(normalizedEmail);
  const now = new Date();

  if (!attempt || !attempt.lockedUntil) {
    return { isLocked: false };
  }

  // Check if lockout expired
  if (attempt.lockedUntil <= now) {
    // Reset attempts
    loginAttempts.delete(normalizedEmail);
    return { isLocked: false };
  }

  const minutesLeft = Math.ceil((attempt.lockedUntil.getTime() - now.getTime()) / 60000);
  const message = `Account locked. Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.`;

  return {
    isLocked: true,
    lockedUntil: attempt.lockedUntil,
    message,
  };
}

/**
 * Clear login attempts (after successful login)
 */
export function clearLoginAttempts(email: string): void {
  const normalizedEmail = email.toLowerCase().trim();
  const hadAttempts = loginAttempts.has(normalizedEmail);

  if (hadAttempts) {
    console.log(`✅ Cleared failed login attempts for ${normalizedEmail}`);
  }

  loginAttempts.delete(normalizedEmail);
}

/**
 * Get current attempt count for an email
 */
export function getAttemptCount(email: string): number {
  const normalizedEmail = email.toLowerCase().trim();
  const attempt = loginAttempts.get(normalizedEmail);
  return attempt?.attempts || 0;
}

/**
 * Clean up old attempts (run periodically)
 * Removes attempts older than the attempt window
 */
export function cleanupOldAttempts(): void {
  const now = new Date();
  const cutoff = now.getTime() - ATTEMPT_WINDOW;
  let cleaned = 0;

  for (const [email, attempt] of loginAttempts.entries()) {
    if (attempt.lastAttempt.getTime() < cutoff) {
      loginAttempts.delete(email);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} old login attempts`);
  }
}

// Run cleanup every hour
setInterval(cleanupOldAttempts, 60 * 60 * 1000);

/**
 * Get statistics about login attempts (for admin monitoring)
 */
export function getLoginAttemptStats(): {
  totalTracked: number;
  lockedAccounts: number;
  attemptsInWindow: number;
} {
  const now = new Date();
  let lockedAccounts = 0;
  let attemptsInWindow = 0;

  for (const attempt of loginAttempts.values()) {
    if (attempt.lockedUntil && attempt.lockedUntil > now) {
      lockedAccounts++;
    }
    if (now.getTime() - attempt.lastAttempt.getTime() < ATTEMPT_WINDOW) {
      attemptsInWindow++;
    }
  }

  return {
    totalTracked: loginAttempts.size,
    lockedAccounts,
    attemptsInWindow,
  };
}

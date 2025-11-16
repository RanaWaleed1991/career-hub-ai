/**
 * Unit Tests for Login Attempts Tracker
 *
 * Tests for Sprint 6.3 login attempt tracking and account lockout
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  recordFailedLogin,
  isAccountLocked,
  clearLoginAttempts,
  getLoginAttemptStats,
} from '../../src/utils/loginAttempts.js';

// Mock Date.now() for predictable tests
const mockNow = new Date('2024-01-01T12:00:00Z').getTime();

describe('Login Attempts Tracker', () => {
  beforeEach(() => {
    // Clear all login attempts before each test
    clearLoginAttempts('test@example.com');
    clearLoginAttempts('admin@example.com');
    clearLoginAttempts('locked@example.com');

    // Reset Date.now mock
    jest.spyOn(Date, 'now').mockReturnValue(mockNow);
  });

  describe('recordFailedLogin', () => {
    it('should record first failed attempt', () => {
      const result = recordFailedLogin('test@example.com');

      expect(result.isLocked).toBe(false);
      expect(result.remainingAttempts).toBe(4); // 5 max - 1 attempt
    });

    it('should increment attempts on multiple failures', () => {
      recordFailedLogin('test@example.com'); // Attempt 1
      recordFailedLogin('test@example.com'); // Attempt 2
      const result = recordFailedLogin('test@example.com'); // Attempt 3

      expect(result.remainingAttempts).toBe(2); // 5 - 3
    });

    it('should lock account after 5 failed attempts', () => {
      recordFailedLogin('test@example.com'); // 1
      recordFailedLogin('test@example.com'); // 2
      recordFailedLogin('test@example.com'); // 3
      recordFailedLogin('test@example.com'); // 4
      const result = recordFailedLogin('test@example.com'); // 5

      expect(result.isLocked).toBe(true);
      expect(result.remainingAttempts).toBe(0);
      expect(result.lockedUntil).toBeDefined();
    });

    it('should normalize email (case-insensitive)', () => {
      recordFailedLogin('Test@Example.COM');
      const result = recordFailedLogin('test@example.com');

      expect(result.remainingAttempts).toBe(3); // Should count both attempts
    });

    it('should set lockout duration to 15 minutes', () => {
      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        recordFailedLogin('test@example.com');
      }

      const result = recordFailedLogin('test@example.com');

      expect(result.lockedUntil).toBeDefined();
      if (result.lockedUntil) {
        const lockoutDuration = result.lockedUntil.getTime() - mockNow;
        const fifteenMinutes = 15 * 60 * 1000;
        expect(lockoutDuration).toBe(fifteenMinutes);
      }
    });

    it('should reset attempts after time window expires', () => {
      // Record initial attempts
      recordFailedLogin('test@example.com');
      recordFailedLogin('test@example.com');

      // Advance time by 16 minutes (beyond 15-minute window)
      const sixteenMinutesLater = mockNow + (16 * 60 * 1000);
      jest.spyOn(Date, 'now').mockReturnValue(sixteenMinutesLater);

      // New attempt should reset counter
      const result = recordFailedLogin('test@example.com');

      expect(result.remainingAttempts).toBe(4); // Reset to first attempt
    });
  });

  describe('isAccountLocked', () => {
    it('should return false for account with no attempts', () => {
      const result = isAccountLocked('new@example.com');

      expect(result.isLocked).toBe(false);
      expect(result.lockedUntil).toBeUndefined();
    });

    it('should return false for account with few attempts', () => {
      recordFailedLogin('test@example.com');
      recordFailedLogin('test@example.com');

      const result = isAccountLocked('test@example.com');

      expect(result.isLocked).toBe(false);
    });

    it('should return true for locked account', () => {
      // Lock the account
      for (let i = 0; i < 5; i++) {
        recordFailedLogin('test@example.com');
      }

      const result = isAccountLocked('test@example.com');

      expect(result.isLocked).toBe(true);
      expect(result.lockedUntil).toBeDefined();
    });

    it('should return false after lockout expires', () => {
      // Lock the account
      for (let i = 0; i < 5; i++) {
        recordFailedLogin('test@example.com');
      }

      // Advance time beyond lockout period (16 minutes)
      const sixteenMinutesLater = mockNow + (16 * 60 * 1000);
      jest.spyOn(Date, 'now').mockReturnValue(sixteenMinutesLater);

      const result = isAccountLocked('test@example.com');

      expect(result.isLocked).toBe(false);
    });

    it('should normalize email', () => {
      // Lock with lowercase
      for (let i = 0; i < 5; i++) {
        recordFailedLogin('test@example.com');
      }

      // Check with uppercase
      const result = isAccountLocked('TEST@EXAMPLE.COM');

      expect(result.isLocked).toBe(true);
    });
  });

  describe('clearLoginAttempts', () => {
    it('should clear attempts for specific email', () => {
      // Record some attempts
      recordFailedLogin('test@example.com');
      recordFailedLogin('test@example.com');

      // Clear attempts
      clearLoginAttempts('test@example.com');

      // Next attempt should start fresh
      const result = recordFailedLogin('test@example.com');
      expect(result.remainingAttempts).toBe(4); // First attempt
    });

    it('should clear lockout status', () => {
      // Lock the account
      for (let i = 0; i < 5; i++) {
        recordFailedLogin('test@example.com');
      }

      // Clear attempts
      clearLoginAttempts('test@example.com');

      // Should no longer be locked
      const result = isAccountLocked('test@example.com');
      expect(result.isLocked).toBe(false);
    });

    it('should not affect other emails', () => {
      // Record attempts for two emails
      recordFailedLogin('user1@example.com');
      recordFailedLogin('user2@example.com');

      // Clear only one
      clearLoginAttempts('user1@example.com');

      // user1 should be cleared
      const result1 = recordFailedLogin('user1@example.com');
      expect(result1.remainingAttempts).toBe(4);

      // user2 should still have attempts
      const result2 = recordFailedLogin('user2@example.com');
      expect(result2.remainingAttempts).toBe(3); // Already had 1, now 2
    });
  });

  describe('getLoginAttemptStats', () => {
    it('should return stats for all accounts', () => {
      // Create some attempts
      recordFailedLogin('user1@example.com');
      recordFailedLogin('user1@example.com');

      for (let i = 0; i < 5; i++) {
        recordFailedLogin('user2@example.com'); // Lock this one
      }

      const stats = getLoginAttemptStats();

      expect(stats.totalAttempts).toBeGreaterThanOrEqual(2);
      expect(stats.lockedAccounts).toBeGreaterThanOrEqual(1);
    });

    it('should return empty stats when no attempts', () => {
      const stats = getLoginAttemptStats();

      expect(stats.totalAttempts).toBe(0);
      expect(stats.lockedAccounts).toBe(0);
      expect(stats.recentAttempts).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive attempts', () => {
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(recordFailedLogin('test@example.com'));
      }

      // Should be locked after 5 attempts
      expect(results[4].isLocked).toBe(true);
      expect(results[9].isLocked).toBe(true);
    });

    it('should handle empty email', () => {
      const result = recordFailedLogin('');

      expect(result.remainingAttempts).toBe(4);
    });

    it('should handle special characters in email', () => {
      const email = "user+tag@example.com";
      const result = recordFailedLogin(email);

      expect(result.remainingAttempts).toBe(4);
    });

    it('should handle concurrent attempts from different users', () => {
      const result1 = recordFailedLogin('user1@example.com');
      const result2 = recordFailedLogin('user2@example.com');
      const result3 = recordFailedLogin('user1@example.com');

      expect(result1.remainingAttempts).toBe(4);
      expect(result2.remainingAttempts).toBe(4);
      expect(result3.remainingAttempts).toBe(3); // user1's second attempt
    });
  });

  describe('Security Scenarios', () => {
    it('should prevent brute force attacks', () => {
      // Simulate brute force attempt
      const results = [];
      for (let i = 0; i < 20; i++) {
        results.push(recordFailedLogin('victim@example.com'));
      }

      // Account should be locked after 5 attempts
      expect(results[4].isLocked).toBe(true);

      // All subsequent attempts should show locked status
      for (let i = 5; i < 20; i++) {
        expect(results[i].isLocked).toBe(true);
      }
    });

    it('should allow legitimate user after lockout expires', () => {
      // Lock the account
      for (let i = 0; i < 5; i++) {
        recordFailedLogin('user@example.com');
      }

      // Verify locked
      expect(isAccountLocked('user@example.com').isLocked).toBe(true);

      // Advance time beyond lockout
      const sixteenMinutesLater = mockNow + (16 * 60 * 1000);
      jest.spyOn(Date, 'now').mockReturnValue(sixteenMinutesLater);

      // Should be unlocked and able to try again
      expect(isAccountLocked('user@example.com').isLocked).toBe(false);
      const result = recordFailedLogin('user@example.com');
      expect(result.remainingAttempts).toBe(4); // Fresh start
    });
  });
});

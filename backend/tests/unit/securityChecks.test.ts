/**
 * Unit Tests for Security Checks
 *
 * Tests for Sprint 6.1 security validation utilities
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  performSecurityChecks,
  logSecurityFeatures,
} from '../../src/utils/securityChecks.js';

describe('Security Checks', () => {
  // Store original environment variables
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset environment to test state before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment after each test
    process.env = originalEnv;
  });

  describe('performSecurityChecks', () => {
    it('should pass with all required environment variables', () => {
      // All required vars are set in tests/setup.ts
      const result = performSecurityChecks();

      expect(result.secure).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect missing SUPABASE_URL', () => {
      delete process.env.SUPABASE_URL;

      const result = performSecurityChecks();

      expect(result.secure).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues).toContain(expect.stringContaining('SUPABASE_URL'));
    });

    it('should detect missing GEMINI_API_KEY', () => {
      delete process.env.GEMINI_API_KEY;

      const result = performSecurityChecks();

      expect(result.secure).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues).toContain(expect.stringContaining('GEMINI_API_KEY'));
    });

    it('should detect missing STRIPE_SECRET_KEY', () => {
      delete process.env.STRIPE_SECRET_KEY;

      const result = performSecurityChecks();

      expect(result.secure).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues).toContain(expect.stringContaining('STRIPE_SECRET_KEY'));
    });

    it('should allow development mode without HTTPS', () => {
      process.env.NODE_ENV = 'development';

      const result = performSecurityChecks();

      // Should not require HTTPS in development
      expect(result.secure).toBe(true);
    });

    it('should require HTTPS in production mode', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.FRONTEND_URL;
      process.env.FRONTEND_URL = 'http://example.com'; // HTTP, not HTTPS

      const result = performSecurityChecks();

      // Should warn about HTTP in production
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should validate API key format', () => {
      process.env.GEMINI_API_KEY = 'short'; // Too short

      const result = performSecurityChecks();

      // Should detect invalid API key format
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should detect multiple missing variables', () => {
      delete process.env.SUPABASE_URL;
      delete process.env.GEMINI_API_KEY;
      delete process.env.STRIPE_SECRET_KEY;

      const result = performSecurityChecks();

      expect(result.secure).toBe(false);
      expect(result.issues.length).toBeGreaterThanOrEqual(3);
    });

    it('should return security status object', () => {
      const result = performSecurityChecks();

      expect(result).toHaveProperty('secure');
      expect(result).toHaveProperty('issues');
      expect(typeof result.secure).toBe('boolean');
      expect(Array.isArray(result.issues)).toBe(true);
    });
  });

  describe('logSecurityFeatures', () => {
    it('should not throw errors', () => {
      expect(() => logSecurityFeatures()).not.toThrow();
    });

    it('should execute successfully with valid config', () => {
      // All env vars are set in test setup
      const result = logSecurityFeatures();

      // Should complete without errors
      expect(result).toBeUndefined();
    });

    it('should handle missing optional features gracefully', () => {
      // Remove some optional features
      delete process.env.ADZUNA_APP_ID;

      // Should still log without errors
      expect(() => logSecurityFeatures()).not.toThrow();
    });
  });

  describe('Production Security Requirements', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should require HTTPS frontend URL in production', () => {
      process.env.FRONTEND_URL = 'http://example.com';

      const result = performSecurityChecks();

      expect(result.issues.some((issue: string) =>
        issue.toLowerCase().includes('https')
      )).toBe(true);
    });

    it('should accept HTTPS frontend URL in production', () => {
      process.env.FRONTEND_URL = 'https://example.com';

      const result = performSecurityChecks();

      // Should not have HTTPS-related issues
      const httpsIssues = result.issues.filter((issue: string) =>
        issue.toLowerCase().includes('https')
      );
      expect(httpsIssues).toHaveLength(0);
    });

    it('should validate all critical security features', () => {
      const result = performSecurityChecks();

      // In production with all vars set, should pass
      expect(result.secure).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty environment variables', () => {
      process.env.GEMINI_API_KEY = '';

      const result = performSecurityChecks();

      expect(result.secure).toBe(false);
    });

    it('should handle whitespace-only environment variables', () => {
      process.env.SUPABASE_URL = '   ';

      const result = performSecurityChecks();

      expect(result.secure).toBe(false);
    });

    it('should handle null environment variables', () => {
      process.env.STRIPE_SECRET_KEY = undefined as any;

      const result = performSecurityChecks();

      expect(result.secure).toBe(false);
    });

    it('should validate PORT number', () => {
      process.env.PORT = 'not-a-number';

      const result = performSecurityChecks();

      // Should detect invalid port
      expect(result.issues.some((issue: string) =>
        issue.toLowerCase().includes('port')
      )).toBe(true);
    });

    it('should allow valid PORT number', () => {
      process.env.PORT = '3001';

      const result = performSecurityChecks();

      // Should not have port-related issues
      const portIssues = result.issues.filter((issue: string) =>
        issue.toLowerCase().includes('port') && issue.toLowerCase().includes('invalid')
      );
      expect(portIssues).toHaveLength(0);
    });
  });

  describe('Security Configuration', () => {
    it('should validate Supabase configuration', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_KEY = 'valid-key-minimum-32-characters-long';

      const result = performSecurityChecks();

      // Should not have Supabase-related issues
      const supabaseIssues = result.issues.filter((issue: string) =>
        issue.toLowerCase().includes('supabase')
      );
      expect(supabaseIssues).toHaveLength(0);
    });

    it('should validate Stripe configuration', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_valid_key';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_valid_secret';

      const result = performSecurityChecks();

      // Should not have Stripe-related issues in test mode
      const stripeIssues = result.issues.filter((issue: string) =>
        issue.toLowerCase().includes('stripe') &&
        !issue.toLowerCase().includes('test') // Ignore test mode warnings
      );
      expect(stripeIssues).toHaveLength(0);
    });

    it('should detect Adzuna API configuration', () => {
      process.env.ADZUNA_APP_ID = 'test-app-id';
      process.env.ADZUNA_API_KEY = 'test-api-key';

      const result = performSecurityChecks();

      // Adzuna is optional, should not cause security failure
      expect(result.secure).toBe(true);
    });
  });

  describe('Security Best Practices', () => {
    it('should warn about test/development keys in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.STRIPE_SECRET_KEY = 'sk_test_should_not_use_in_production';

      const result = performSecurityChecks();

      // Should warn about test keys in production
      expect(result.issues.some((issue: string) =>
        issue.toLowerCase().includes('test')
      )).toBe(true);
    });

    it('should accept production keys in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.STRIPE_SECRET_KEY = 'sk_live_valid_production_key';

      const result = performSecurityChecks();

      // Should not warn about production keys
      const testKeyWarnings = result.issues.filter((issue: string) =>
        issue.toLowerCase().includes('test') &&
        issue.toLowerCase().includes('stripe')
      );
      expect(testKeyWarnings).toHaveLength(0);
    });
  });
});

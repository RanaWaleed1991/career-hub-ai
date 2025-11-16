/**
 * Unit Tests for Sanitization Utilities
 *
 * Tests for Sprint 6.4 sanitization functions that prevent XSS attacks
 */

import { describe, it, expect } from '@jest/globals';
import {
  sanitizeHtml,
  sanitizeRichText,
  sanitizePlainText,
  sanitizeUrl,
  maskData,
  maskEmail,
  maskPhone,
  detectSqlInjection,
  detectXss,
  sanitizeDescription,
} from '../../src/utils/sanitization.js';

describe('Sanitization Utilities', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("XSS")</script> World';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('should remove iframe tags', () => {
      const input = 'Content <iframe src="malicious.com"></iframe> More';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<iframe>');
      expect(result).not.toContain('</iframe>');
      expect(result).toContain('Content');
      expect(result).toContain('More');
    });

    it('should remove event handlers', () => {
      const input = '<div onclick="malicious()">Click me</div>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('onclick=');
      expect(result).not.toContain('malicious');
    });

    it('should remove javascript: protocol', () => {
      const input = '<a href="javascript:alert(1)">Click</a>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('javascript:');
    });

    it('should remove data: protocol', () => {
      const input = '<img src="data:text/html,<script>alert(1)</script>">';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('data:text/html');
    });

    it('should preserve safe content', () => {
      const input = 'This is safe text with numbers 123';
      const result = sanitizeHtml(input);

      expect(result).toBe('This is safe text with numbers 123');
    });

    it('should handle empty strings', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('should handle null/undefined', () => {
      expect(sanitizeHtml(null as any)).toBe('');
      expect(sanitizeHtml(undefined as any)).toBe('');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const result = sanitizeHtml(input);

      expect(result).toBe('Hello World');
    });
  });

  describe('sanitizeRichText', () => {
    it('should allow safe HTML tags', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      const result = sanitizeRichText(input);

      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
      expect(result).toContain('</p>');
    });

    it('should remove dangerous tags', () => {
      const input = '<p>Safe</p><script>alert("XSS")</script>';
      const result = sanitizeRichText(input);

      expect(result).toContain('<p>Safe</p>');
      expect(result).not.toContain('<script>');
    });

    it('should allow lists', () => {
      const input = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = sanitizeRichText(input);

      expect(result).toContain('<ul>');
      expect(result).toContain('<li>');
    });

    it('should allow headings', () => {
      const input = '<h1>Title</h1><h2>Subtitle</h2>';
      const result = sanitizeRichText(input);

      expect(result).toContain('<h1>');
      expect(result).toContain('<h2>');
    });

    it('should allow emphasis tags', () => {
      const input = '<em>Italic</em> and <i>also italic</i>';
      const result = sanitizeRichText(input);

      expect(result).toContain('<em>');
      expect(result).toContain('<i>');
    });
  });

  describe('sanitizePlainText', () => {
    it('should remove all HTML tags', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      const result = sanitizePlainText(input);

      expect(result).toBe('Hello World');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should decode HTML entities', () => {
      const input = 'Hello &amp; Goodbye &lt;test&gt;';
      const result = sanitizePlainText(input);

      expect(result).toContain('&');
      expect(result).toContain('<test>');
    });

    it('should trim whitespace', () => {
      const input = '  <p>  Text  </p>  ';
      const result = sanitizePlainText(input);

      expect(result).toBe('Text');
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow http URLs', () => {
      const url = 'http://example.com';
      const result = sanitizeUrl(url);

      expect(result).toBe(url);
    });

    it('should allow https URLs', () => {
      const url = 'https://example.com';
      const result = sanitizeUrl(url);

      expect(result).toBe(url);
    });

    it('should block javascript: protocol', () => {
      const url = 'javascript:alert(1)';
      const result = sanitizeUrl(url);

      expect(result).toBe('');
    });

    it('should block data: protocol', () => {
      const url = 'data:text/html,<script>alert(1)</script>';
      const result = sanitizeUrl(url);

      expect(result).toBe('');
    });

    it('should block vbscript: protocol', () => {
      const url = 'vbscript:msgbox(1)';
      const result = sanitizeUrl(url);

      expect(result).toBe('');
    });

    it('should block file: protocol', () => {
      const url = 'file:///etc/passwd';
      const result = sanitizeUrl(url);

      expect(result).toBe('');
    });

    it('should allow relative URLs', () => {
      const url = '/path/to/page';
      const result = sanitizeUrl(url);

      expect(result).toBe(url);
    });

    it('should handle empty strings', () => {
      expect(sanitizeUrl('')).toBe('');
    });

    it('should trim whitespace', () => {
      const url = '  https://example.com  ';
      const result = sanitizeUrl(url);

      expect(result).toBe('https://example.com');
    });
  });

  describe('maskData', () => {
    it('should mask data showing last 4 characters', () => {
      const result = maskData('1234567890');

      expect(result).toBe('******7890');
    });

    it('should mask with custom visible chars', () => {
      const result = maskData('1234567890', 2);

      expect(result).toBe('********90');
    });

    it('should handle short strings', () => {
      const result = maskData('123');

      expect(result).toBe('***');
    });

    it('should handle empty strings', () => {
      const result = maskData('');

      expect(result).toBe('***');
    });
  });

  describe('maskEmail', () => {
    it('should mask email showing first char and domain', () => {
      const result = maskEmail('john.doe@example.com');

      expect(result).toMatch(/^j\*+@example\.com$/);
    });

    it('should handle short emails', () => {
      const result = maskEmail('a@b.com');

      expect(result).toBe('a@b.com');
    });

    it('should handle invalid emails', () => {
      const result = maskEmail('notanemail');

      expect(result).toBe('***@***.com');
    });

    it('should handle empty strings', () => {
      const result = maskEmail('');

      expect(result).toBe('***@***.com');
    });
  });

  describe('maskPhone', () => {
    it('should mask phone showing last 4 digits', () => {
      const result = maskPhone('+1234567890');

      expect(result).toBe('*******7890');
    });

    it('should handle short numbers', () => {
      const result = maskPhone('123');

      expect(result).toBe('***-***-****');
    });

    it('should handle empty strings', () => {
      const result = maskPhone('');

      expect(result).toBe('***-***-****');
    });
  });

  describe('detectSqlInjection', () => {
    it('should detect UNION SELECT attack', () => {
      const input = "' UNION SELECT * FROM users--";
      const result = detectSqlInjection(input);

      expect(result).toBe(true);
    });

    it('should detect DROP TABLE attack', () => {
      const input = "'; DROP TABLE users;--";
      const result = detectSqlInjection(input);

      expect(result).toBe(true);
    });

    it('should detect OR 1=1 attack', () => {
      const input = "admin' OR 1=1--";
      const result = detectSqlInjection(input);

      expect(result).toBe(true);
    });

    it('should detect SQL comments', () => {
      const input = "test'--";
      const result = detectSqlInjection(input);

      expect(result).toBe(true);
    });

    it('should not flag normal text', () => {
      const input = 'This is normal text';
      const result = detectSqlInjection(input);

      expect(result).toBe(false);
    });

    it('should handle empty strings', () => {
      const result = detectSqlInjection('');

      expect(result).toBe(false);
    });
  });

  describe('detectXss', () => {
    it('should detect script tags', () => {
      const input = '<script>alert("XSS")</script>';
      const result = detectXss(input);

      expect(result).toBe(true);
    });

    it('should detect iframe tags', () => {
      const input = '<iframe src="malicious.com"></iframe>';
      const result = detectXss(input);

      expect(result).toBe(true);
    });

    it('should detect javascript: protocol', () => {
      const input = 'javascript:alert(1)';
      const result = detectXss(input);

      expect(result).toBe(true);
    });

    it('should detect event handlers', () => {
      const input = '<div onclick="malicious()">Test</div>';
      const result = detectXss(input);

      expect(result).toBe(true);
    });

    it('should not flag normal HTML', () => {
      const input = '<p>Normal paragraph</p>';
      const result = detectXss(input);

      expect(result).toBe(false);
    });

    it('should handle empty strings', () => {
      const result = detectXss('');

      expect(result).toBe(false);
    });
  });

  describe('sanitizeDescription', () => {
    it('should combine sanitization and detection', () => {
      const input = '<p>Good content</p><script>alert("bad")</script>';
      const result = sanitizeDescription(input);

      expect(result).toContain('<p>Good content</p>');
      expect(result).not.toContain('<script>');
    });

    it('should preserve safe formatting', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      const result = sanitizeDescription(input);

      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
    });

    it('should handle complex mixed content', () => {
      const input = `
        <h1>Title</h1>
        <p>Description with <em>emphasis</em></p>
        <script>alert('XSS')</script>
        <ul><li>Item 1</li></ul>
      `;
      const result = sanitizeDescription(input);

      expect(result).toContain('<h1>');
      expect(result).toContain('<p>');
      expect(result).toContain('<em>');
      expect(result).toContain('<ul>');
      expect(result).not.toContain('<script>');
    });
  });
});

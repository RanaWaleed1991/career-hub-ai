import { Request, Response, NextFunction } from 'express';
import { validationResult, FieldValidationError } from 'express-validator';

/**
 * Middleware to handle validation errors from express-validator
 *
 * Usage:
 * router.post('/endpoint', validationSchema, validate, handler);
 */
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format errors for better readability
    const formattedErrors = errors.array().map((error) => {
      const fieldError = error as FieldValidationError;
      return {
        field: fieldError.path || 'unknown',
        message: error.msg,
        value: fieldError.value,
      };
    });

    console.warn('⚠️  Validation failed:', {
      path: req.path,
      method: req.method,
      errors: formattedErrors,
    });

    res.status(400).json({
      error: 'Validation failed',
      details: formattedErrors,
    });
    return;
  }

  next();
}

/**
 * Sanitize string to prevent XSS
 * Removes potentially dangerous characters and patterns
 */
export function sanitizeHtml(text: string): string {
  if (!text) return '';

  return (
    text
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove iframe tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      // Remove event handlers like onclick=, onload=, etc.
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      // Remove javascript: protocol
      .replace(/javascript:/gi, '')
      // Remove data: protocol (can contain base64 encoded scripts)
      .replace(/data:text\/html/gi, '')
      .trim()
  );
}

/**
 * Sanitize HTML but allow safe formatting tags
 * Use this for rich text content like job descriptions, course descriptions
 */
export function sanitizeRichText(content: string): string {
  if (!content) return '';

  // First remove dangerous content
  let sanitized = sanitizeHtml(content);

  // Then remove all HTML tags except safe ones
  // Allowed: p, br, b, i, u, strong, em, a, ul, ol, li, h1-h6
  sanitized = sanitized.replace(
    /<(?!\/?(?:p|br|b|i|u|strong|em|a|ul|ol|li|h[1-6])\b)[^>]+>/gi,
    ''
  );

  return sanitized;
}

/**
 * Validate and sanitize ID parameter
 * Returns null if ID is invalid
 */
export function sanitizeId(id: any): number | null {
  const parsed = parseInt(id, 10);

  if (isNaN(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

/**
 * Sanitize URL to prevent XSS and protocol injection
 * Only allows http and https protocols
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  const trimmed = url.trim();

  // Block dangerous protocols
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    console.warn('⚠️  Blocked dangerous URL protocol:', trimmed);
    return '';
  }

  // Only allow http and https
  if (!/^https?:\/\//i.test(trimmed)) {
    console.warn('⚠️  Blocked non-http(s) URL:', trimmed);
    return '';
  }

  return trimmed;
}

/**
 * Sanitize filename to prevent path traversal attacks
 * Removes path separators and dangerous characters
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';

  return (
    filename
      // Remove path separators
      .replace(/[/\\]/g, '')
      // Remove parent directory references
      .replace(/\.\./g, '')
      // Keep only safe characters
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      // Limit length
      .substring(0, 255)
  );
}

/**
 * Escape special characters for safe SQL (as an extra layer of defense)
 * NOTE: Supabase client handles this automatically, but this provides extra protection
 */
export function escapeSql(value: string): string {
  if (!value) return '';

  return value
    .replace(/'/g, "''") // Escape single quotes
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comments
    .replace(/\*\//g, '');
}

/**
 * Check if a string contains potential SQL injection patterns
 * Logs warnings but doesn't block (Supabase handles the actual protection)
 */
export function detectSqlInjection(value: string): boolean {
  if (!value) return false;

  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    /'(\s)*(OR|AND)(\s)*'/gi,
    /--/g,
    /\/\*/g,
    /\*\//g,
    /;(\s)*(DROP|DELETE|INSERT|UPDATE)/gi,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(value)) {
      console.warn('⚠️  Suspicious SQL pattern detected:', {
        pattern: pattern.toString(),
        value: value.substring(0, 100),
      });
      return true;
    }
  }

  return false;
}

/**
 * Check if a string contains potential XSS patterns
 */
export function detectXss(value: string): boolean {
  if (!value) return false;

  const xssPatterns = [
    /<script/gi,
    /<iframe/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+onerror/gi,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(value)) {
      console.warn('⚠️  Potential XSS detected:', {
        pattern: pattern.toString(),
        value: value.substring(0, 100),
      });
      return true;
    }
  }

  return false;
}

/**
 * Comprehensive input sanitization for user-generated content
 * Detects and logs attacks, sanitizes input
 */
export function sanitizeUserInput(input: string, allowHtml: boolean = false): string {
  if (!input) return '';

  // Detect and log potential attacks
  detectSqlInjection(input);
  detectXss(input);

  // Sanitize based on content type
  return allowHtml ? sanitizeRichText(input) : sanitizeHtml(input);
}

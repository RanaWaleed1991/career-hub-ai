/**
 * Sanitization Utilities
 *
 * Provides functions to sanitize user input and prevent XSS attacks
 * by removing malicious HTML/JavaScript before storing in database.
 */

/**
 * Sanitize HTML content by removing dangerous tags and attributes
 * Allows safe formatting tags while blocking scripts, iframes, and event handlers
 *
 * @param content - Raw HTML content from user input
 * @returns Sanitized content safe for storage and display
 */
export function sanitizeHtml(content: string): string {
  if (!content) return '';

  return content
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove object and embed tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    // Remove event handlers (onclick, onload, onerror, etc.)
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: protocol (can be used for XSS)
    .replace(/data:text\/html/gi, '')
    // Trim whitespace
    .trim();
}

/**
 * Sanitize rich text content - allows safe HTML tags for formatting
 * while removing dangerous elements
 *
 * Allowed tags: p, br, b, i, u, strong, em, a, ul, ol, li, h1-h6
 *
 * @param content - Rich text content from user input
 * @returns Sanitized rich text
 */
export function sanitizeRichText(content: string): string {
  if (!content) return '';

  // First remove dangerous content
  let sanitized = sanitizeHtml(content);

  // Remove all tags except safe ones
  // This regex keeps only: p, br, b, i, u, strong, em, a, ul, ol, li, h1-h6
  sanitized = sanitized.replace(
    /<(?!\/?(?:p|br|b|i|u|strong|em|a|ul|ol|li|h[1-6])\b)[^>]+>/gi,
    ''
  );

  return sanitized;
}

/**
 * Sanitize plain text by removing all HTML tags
 * Use for fields that should be plain text only (names, titles, etc.)
 *
 * @param text - Plain text input
 * @returns Text with all HTML removed
 */
export function sanitizePlainText(text: string): string {
  if (!text) return '';

  return text
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&lt;/g, '<')   // Decode HTML entities
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Sanitize URL to prevent javascript: and data: protocol XSS
 *
 * @param url - URL to sanitize
 * @returns Safe URL or empty string if dangerous
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  const trimmedUrl = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    trimmedUrl.startsWith('javascript:') ||
    trimmedUrl.startsWith('data:') ||
    trimmedUrl.startsWith('vbscript:') ||
    trimmedUrl.startsWith('file:')
  ) {
    console.warn('⚠️ Blocked dangerous URL protocol:', url);
    return '';
  }

  // Only allow http and https
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    // Relative URLs are okay
    if (trimmedUrl.startsWith('/')) {
      return url.trim();
    }
    console.warn('⚠️ Blocked non-HTTP(S) URL:', url);
    return '';
  }

  return url.trim();
}

/**
 * Mask sensitive data for logging (show only last N characters)
 *
 * @param data - Sensitive data to mask
 * @param visibleChars - Number of characters to show at the end
 * @returns Masked string
 */
export function maskData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) return '***';

  const masked = '*'.repeat(data.length - visibleChars);
  return masked + data.slice(-visibleChars);
}

/**
 * Mask email address for logging (show first char and domain)
 *
 * @param email - Email to mask
 * @returns Masked email
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***.com';

  const [localPart, domain] = email.split('@');
  const maskedLocal = localPart.charAt(0) + '*'.repeat(Math.max(0, localPart.length - 1));

  return `${maskedLocal}@${domain}`;
}

/**
 * Mask phone number (show last 4 digits)
 *
 * @param phone - Phone number to mask
 * @returns Masked phone number
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return '***-***-****';

  return '*'.repeat(phone.length - 4) + phone.slice(-4);
}

/**
 * Detect potential SQL injection patterns
 * Logs warning if detected but doesn't block (Supabase uses parameterized queries)
 *
 * @param input - Input to check
 * @returns True if suspicious patterns detected
 */
export function detectSqlInjection(input: string): boolean {
  if (!input) return false;

  const sqlPatterns = [
    /(\bunion\b.*\bselect\b)/i,
    /(\bselect\b.*\bfrom\b)/i,
    /(\binsert\b.*\binto\b)/i,
    /(\bdelete\b.*\bfrom\b)/i,
    /(\bdrop\b.*\btable\b)/i,
    /(\bexec\b.*\()/i,
    /(\bor\b.*\b1\s*=\s*1)/i,
    /(;.*--)/,
    /(\/\*.*\*\/)/,
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      console.warn('⚠️ Potential SQL injection detected:', input.substring(0, 50));
      return true;
    }
  }

  return false;
}

/**
 * Detect potential XSS patterns
 *
 * @param input - Input to check
 * @returns True if suspicious patterns detected
 */
export function detectXss(input: string): boolean {
  if (!input) return false;

  const xssPatterns = [
    /<script/i,
    /<iframe/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /<object/i,
    /<embed/i,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      console.warn('⚠️ Potential XSS detected:', input.substring(0, 50));
      return true;
    }
  }

  return false;
}

/**
 * Comprehensive sanitization for job/course descriptions
 * Use this before storing user-generated content in database
 *
 * @param description - Description content
 * @returns Sanitized description
 */
export function sanitizeDescription(description: string): string {
  if (!description) return '';

  // Detect attacks and log warnings
  detectSqlInjection(description);
  detectXss(description);

  // Sanitize the content
  return sanitizeRichText(description);
}

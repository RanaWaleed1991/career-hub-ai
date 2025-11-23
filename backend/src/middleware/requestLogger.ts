import { Request, Response, NextFunction } from 'express';
import { sanitizeErrorMessage } from '../utils/securityChecks.js';

/**
 * Request logging middleware
 * Logs all requests with timestamp, method, path, status, and response time
 * Emphasizes security-relevant requests (failed auth, rate limits, errors)
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Capture original end function
  const originalEnd = res.end;

  // Override end function to log after response is sent
  res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Get request info
    const method = req.method;
    const path = req.path || req.url;
    const statusCode = res.statusCode;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    // Determine log level based on status code
    const isSecurityRelevant =
      statusCode === 401 || // Unauthorized
      statusCode === 403 || // Forbidden
      statusCode === 429 || // Rate limited
      statusCode >= 500; // Server errors

    // Build log message
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${method} ${path} - ${statusCode} - ${responseTime}ms - IP: ${ip}`;

    // Log based on status
    if (isSecurityRelevant) {
      // Security-relevant requests get warning/error logging
      if (statusCode >= 500) {
        console.error(`🚨 ${logMessage}`);
      } else if (statusCode === 429) {
        console.warn(`⚠️  RATE LIMIT: ${logMessage}`);
      } else if (statusCode === 401 || statusCode === 403) {
        console.warn(`🔒 AUTH FAILED: ${logMessage}`);
      }
    } else if (statusCode >= 400) {
      // Client errors (4xx other than 401, 403, 429)
      console.warn(`⚠️  ${logMessage}`);
    } else {
      // Successful requests (2xx, 3xx) - only log in development or for sensitive paths
      const isSensitivePath =
        path.includes('/admin') ||
        path.includes('/payment') ||
        path.includes('/auth') ||
        path.includes('/api/ai');

      if (isSensitivePath || process.env.NODE_ENV === 'development') {
        console.log(`✓ ${logMessage}`);
      }
    }

    // Log additional details for security-relevant requests
    if (isSecurityRelevant) {
      console.log(`  User-Agent: ${userAgent}`);

      // Log error details if available (sanitized)
      if (res.locals.error) {
        const sanitizedError = sanitizeErrorMessage(res.locals.error.toString());
        console.error(`  Error: ${sanitizedError}`);
      }
    }

    // Call original end function
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};

/**
 * Error logging middleware
 * Should be placed after all routes to catch errors
 */
export const errorLogger = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path || req.url;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  // Sanitize error message
  const errorMessage = sanitizeErrorMessage(err.message || err.toString());

  // Log error details
  console.error(`\n❌ ERROR [${timestamp}]`);
  console.error(`  Method: ${method}`);
  console.error(`  Path: ${path}`);
  console.error(`  IP: ${ip}`);
  console.error(`  Error: ${errorMessage}`);

  if (process.env.NODE_ENV === 'development' && err.stack) {
    console.error(`  Stack: ${err.stack}`);
  }

  console.error(''); // Empty line for readability

  // Store error in res.locals for requestLogger
  res.locals.error = err;

  // Pass to next error handler
  next(err);
};

/**
 * Final error handler
 * Returns JSON error response to client
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default to 500 if no status code set
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Suspicious activity detector
 * Logs patterns that might indicate attacks
 */
export const suspiciousActivityDetector = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const path = req.path || req.url;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//g, // Path traversal
    /<script>/gi, // XSS attempts
    /union.*select/gi, // SQL injection
    /exec\(/gi, // Code injection
    /eval\(/gi, // Code injection
    /__proto__/gi, // Prototype pollution
    /\.\.%2f/gi, // Encoded path traversal
  ];

  const body = JSON.stringify(req.body);
  const query = JSON.stringify(req.query);
  const params = JSON.stringify(req.params);
  const combined = `${path} ${body} ${query} ${params}`;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(combined)) {
      console.warn(`\n🚨 SUSPICIOUS ACTIVITY DETECTED`);
      console.warn(`  IP: ${ip}`);
      console.warn(`  Pattern: ${pattern}`);
      console.warn(`  Method: ${req.method}`);
      console.warn(`  Path: ${path}`);
      console.warn(`  Timestamp: ${new Date().toISOString()}\n`);

      // Log but don't block - let validation handle it
      break;
    }
  }

  next();
};

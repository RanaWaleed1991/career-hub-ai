import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * Applies to most API endpoints
 * 100 requests per 15 minutes per IP
 * Disabled in test mode to allow integration tests
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => process.env.NODE_ENV === 'test', // Skip in test mode
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the 100 requests in 15 minutes limit.',
      retryAfter: Math.ceil(req.rateLimit.resetTime! / 1000),
    });
  },
});

/**
 * AI endpoint rate limiter
 * Applies to AI-powered endpoints (resume analysis, cover letter generation)
 * 500 requests per hour per IP (allows premium users unlimited usage while preventing extreme abuse)
 * Disabled in test mode to allow integration tests
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 500, // Increased from 20 to allow unlimited premium usage
  message: 'Too many AI requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test', // Skip in test mode
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many AI requests',
      message: 'You have exceeded the 500 AI requests per hour limit.',
      retryAfter: Math.ceil(req.rateLimit.resetTime! / 1000),
    });
  },
});

/**
 * Authentication rate limiter
 * Applies to login, registration, password reset
 * 5 attempts per 15 minutes per IP (prevent brute force)
 * Disabled in test mode to allow integration tests
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth attempts per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => process.env.NODE_ENV === 'test', // Skip in test mode
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'You have exceeded the 5 login attempts in 15 minutes limit.',
      retryAfter: Math.ceil(req.rateLimit.resetTime! / 1000),
    });
  },
});

/**
 * Payment endpoint rate limiter
 * Applies to Stripe payment endpoints
 * 10 attempts per hour per IP (prevent payment abuse)
 * Disabled in test mode to allow integration tests
 */
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 payment requests per hour
  message: 'Too many payment requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test', // Skip in test mode
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many payment requests',
      message: 'You have exceeded the 10 payment requests per hour limit.',
      retryAfter: Math.ceil(req.rateLimit.resetTime! / 1000),
    });
  },
});

/**
 * Strict rate limiter for sensitive operations
 * Can be applied to admin endpoints or other critical operations
 * 30 requests per hour per IP
 * Disabled in test mode to allow integration tests
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 requests per hour
  message: 'Too many requests to sensitive endpoint, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test', // Skip in test mode
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'You have exceeded the rate limit for this endpoint.',
      retryAfter: Math.ceil(req.rateLimit.resetTime! / 1000),
    });
  },
});

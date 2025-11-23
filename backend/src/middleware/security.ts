import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

/**
 * Helmet security middleware configuration
 * Sets various HTTP headers to secure the application
 */
export const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for React
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'], // Allow images from HTTPS sources
      connectSrc: ["'self'", process.env.SUPABASE_URL || ''], // Allow Supabase connections
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },

  // Strict-Transport-Security: enforce HTTPS
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // X-Frame-Options: prevent clickjacking
  frameguard: {
    action: 'deny',
  },

  // X-Content-Type-Options: prevent MIME sniffing
  noSniff: true,

  // X-XSS-Protection: enable XSS filter
  xssFilter: true,

  // Referrer-Policy: control referrer information
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // X-DNS-Prefetch-Control: control DNS prefetching
  dnsPrefetchControl: {
    allow: false,
  },

  // X-Download-Options: prevent IE from executing downloads
  ieNoOpen: true,

  // X-Permitted-Cross-Domain-Policies: control cross-domain policies
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },
});

/**
 * Request size limit middleware
 * Prevents large payload attacks
 */
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = req.get('content-length');
  const maxSize = 10 * 1024 * 1024; // 10MB limit

  if (contentLength && parseInt(contentLength, 10) > maxSize) {
    return res.status(413).json({
      error: 'Payload too large',
      message: 'Request body exceeds 10MB limit',
    });
  }

  next();
};

/**
 * CORS configuration with allowed origins whitelist
 */
export const getCorsOptions = () => {
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173', // Development fallback
    'http://localhost:3000', // Alternative dev port
  ];

  return {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true, // Allow cookies and authorization headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
    maxAge: 86400, // 24 hours
  };
};

/**
 * JSON parsing error handler
 * Catches malformed JSON and returns proper error
 */
export const jsonErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains malformed JSON',
    });
  }
  next(err);
};

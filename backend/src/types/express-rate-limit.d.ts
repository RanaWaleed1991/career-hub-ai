/**
 * Type definitions for express-rate-limit
 */

import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    rateLimit?: {
      limit: number;
      current: number;
      remaining: number;
      resetTime: Date | undefined;
    };
  }
}

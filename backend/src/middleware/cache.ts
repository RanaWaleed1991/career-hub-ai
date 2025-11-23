/**
 * API Response Caching Middleware
 *
 * Caches GET requests to reduce database load and improve response times.
 * Uses in-memory caching with node-cache.
 *
 * Features:
 * - Only caches GET requests
 * - Configurable TTL (Time To Live)
 * - Automatic cache invalidation
 * - Cache statistics tracking
 */

import NodeCache from 'node-cache';
import { Request, Response, NextFunction } from 'express';

// Create cache instances with different TTL for different data types
const jobsCache = new NodeCache({
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // Better performance, but be careful with mutations
});

const coursesCache = new NodeCache({
  stdTTL: 600, // 10 minutes
  checkperiod: 120
});

const adminCache = new NodeCache({
  stdTTL: 60, // 1 minute for admin metrics
  checkperiod: 30
});

/**
 * Generate cache key from request
 */
function generateCacheKey(req: Request): string {
  // Include query params in cache key for different results
  const queryString = JSON.stringify(req.query);
  return `${req.originalUrl}?${queryString}`;
}

/**
 * Create cache middleware with custom cache instance
 */
export function createCacheMiddleware(cache: NodeCache) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = generateCacheKey(req);
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      // Cache hit - return cached response
      console.log(`[Cache HIT] ${req.originalUrl}`);
      return res.json(cachedResponse);
    }

    // Cache miss - intercept response to cache it
    console.log(`[Cache MISS] ${req.originalUrl}`);

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache the response
    res.json = function(body: any) {
      // Cache the response
      cache.set(key, body);

      // Call original json method
      return originalJson(body);
    };

    next();
  };
}

/**
 * Cache middleware for jobs endpoints
 */
export const cacheJobs = createCacheMiddleware(jobsCache);

/**
 * Cache middleware for courses endpoints
 */
export const cacheCourses = createCacheMiddleware(coursesCache);

/**
 * Cache middleware for admin metrics
 */
export const cacheAdmin = createCacheMiddleware(adminCache);

/**
 * Clear all caches (useful for testing or manual invalidation)
 */
export function clearAllCaches() {
  jobsCache.flushAll();
  coursesCache.flushAll();
  adminCache.flushAll();
  console.log('[Cache] All caches cleared');
}

/**
 * Clear specific cache
 */
export function clearCache(cacheType: 'jobs' | 'courses' | 'admin') {
  const cacheMap = {
    jobs: jobsCache,
    courses: coursesCache,
    admin: adminCache
  };

  cacheMap[cacheType].flushAll();
  console.log(`[Cache] ${cacheType} cache cleared`);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    jobs: {
      keys: jobsCache.keys().length,
      hits: jobsCache.getStats().hits,
      misses: jobsCache.getStats().misses,
      ttl: 300
    },
    courses: {
      keys: coursesCache.keys().length,
      hits: coursesCache.getStats().hits,
      misses: coursesCache.getStats().misses,
      ttl: 600
    },
    admin: {
      keys: adminCache.keys().length,
      hits: adminCache.getStats().hits,
      misses: adminCache.getStats().misses,
      ttl: 60
    }
  };
}

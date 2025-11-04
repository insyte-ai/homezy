import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { rateLimitRedis } from '../config/redis';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * General API rate limiter
 */
const apiLimiter = new RateLimiterRedis({
  storeClient: rateLimitRedis,
  keyPrefix: 'rl:api',
  points: env.RATE_LIMIT_MAX_REQUESTS, // Number of requests
  duration: Math.floor(env.RATE_LIMIT_WINDOW_MS / 1000), // Per duration in seconds
  blockDuration: 60, // Block for 1 minute if exceeded
});

/**
 * Strict rate limiter for authentication endpoints
 */
const authLimiter = new RateLimiterRedis({
  storeClient: rateLimitRedis,
  keyPrefix: 'rl:auth',
  points: 5, // 5 attempts
  duration: 900, // Per 15 minutes
  blockDuration: 900, // Block for 15 minutes
});

/**
 * AI chat rate limiter
 */
const aiLimiter = new RateLimiterRedis({
  storeClient: rateLimitRedis,
  keyPrefix: 'rl:ai',
  points: 20, // 20 messages
  duration: 60, // Per minute
  blockDuration: 60, // Block for 1 minute
});

/**
 * File upload rate limiter
 */
const uploadLimiter = new RateLimiterRedis({
  storeClient: rateLimitRedis,
  keyPrefix: 'rl:upload',
  points: 10, // 10 uploads
  duration: 3600, // Per hour
  blockDuration: 3600, // Block for 1 hour
});

/**
 * Get client identifier (IP or user ID)
 */
const getClientKey = (req: Request): string => {
  // Use user ID if authenticated, otherwise use IP
  if (req.userId) {
    return `user:${req.userId}`;
  }
  return `ip:${req.ip || req.connection.remoteAddress || 'unknown'}`;
};

/**
 * Rate limiter middleware factory
 */
const createRateLimitMiddleware = (limiter: RateLimiterRedis, name: string = 'API') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = getClientKey(req);

    try {
      const rateLimitResult: RateLimiterRes = await limiter.consume(key);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', limiter.points);
      res.setHeader('X-RateLimit-Remaining', rateLimitResult.remainingPoints);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimitResult.msBeforeNext).toISOString());

      next();
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Rate limit middleware error for ${name}:`, error);
        // On Redis error, allow the request through
        next();
        return;
      }

      // Rate limit exceeded
      const rateLimitResult = error as RateLimiterRes;
      const retryAfter = Math.ceil(rateLimitResult.msBeforeNext / 1000);

      res.setHeader('X-RateLimit-Limit', limiter.points);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimitResult.msBeforeNext).toISOString());
      res.setHeader('Retry-After', retryAfter);

      logger.warn(`Rate limit exceeded for ${name}`, {
        key,
        retryAfter,
      });

      res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded for ${name}. Please try again later.`,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter,
      });
    }
  };
};

/**
 * Export rate limit middleware functions
 */
export const rateLimitApi = createRateLimitMiddleware(apiLimiter, 'API');
export const rateLimitAuth = createRateLimitMiddleware(authLimiter, 'Authentication');
export const rateLimitAi = createRateLimitMiddleware(aiLimiter, 'AI Chat');
export const rateLimitUpload = createRateLimitMiddleware(uploadLimiter, 'File Upload');

export default {
  rateLimitApi,
  rateLimitAuth,
  rateLimitAi,
  rateLimitUpload,
};

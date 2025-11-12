import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * Redis client configuration
 * Supports both REDIS_URL (Railway/production) and individual config (local dev)
 */
const getRedisConfig = () => {
  // If REDIS_URL is provided (Railway), use it
  if (env.REDIS_URL) {
    return {
      url: env.REDIS_URL,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    };
  }

  // Otherwise use individual config (local development)
  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  };
};

const redisConfig = getRedisConfig();

/**
 * Main Redis client for general caching
 */
export const redisClient = new Redis(redisConfig);

/**
 * Separate Redis client for session storage
 */
export const sessionRedis = new Redis({
  ...redisConfig,
  db: 1, // Use different database for sessions
});

/**
 * Separate Redis client for rate limiting
 */
export const rateLimitRedis = new Redis({
  ...redisConfig,
  db: 2, // Use different database for rate limiting
});

/**
 * Separate Redis client for BullMQ job queues
 */
export const queueRedis = new Redis({
  ...redisConfig,
  db: 3, // Use different database for queues
});

// Redis connection event handlers
redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('error', (error) => {
  logger.error('Redis client error:', error);
});

redisClient.on('close', () => {
  logger.warn('Redis client connection closed');
});

redisClient.on('reconnecting', () => {
  logger.info('Redis client reconnecting...');
});

// Session Redis event handlers
sessionRedis.on('connect', () => {
  logger.info('Session Redis connected');
});

sessionRedis.on('error', (error) => {
  logger.error('Session Redis error:', error);
});

// Rate limit Redis event handlers
rateLimitRedis.on('connect', () => {
  logger.info('Rate limit Redis connected');
});

rateLimitRedis.on('error', (error) => {
  logger.error('Rate limit Redis error:', error);
});

// Queue Redis event handlers
queueRedis.on('connect', () => {
  logger.info('Queue Redis connected');
});

queueRedis.on('error', (error) => {
  logger.error('Queue Redis error:', error);
});

/**
 * Graceful shutdown for all Redis connections
 */
export const disconnectRedis = async (): Promise<void> => {
  try {
    await Promise.all([
      redisClient.quit(),
      sessionRedis.quit(),
      rateLimitRedis.quit(),
      queueRedis.quit(),
    ]);
    logger.info('All Redis connections closed');
  } catch (error) {
    logger.error('Error closing Redis connections:', error);
    throw error;
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await disconnectRedis();
  process.exit(0);
});

/**
 * Cache helper functions
 */
export const cache = {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set value in cache with optional TTL (in seconds)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redisClient.setex(key, ttl, serialized);
      } else {
        await redisClient.set(key, serialized);
      }
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  },

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  },

  /**
   * Delete all keys matching a pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      logger.error(`Cache delete pattern error for pattern ${pattern}:`, error);
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Set expiry on existing key
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await redisClient.expire(key, ttl);
    } catch (error) {
      logger.error(`Cache expire error for key ${key}:`, error);
    }
  },
};

export default redisClient;

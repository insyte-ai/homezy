import mongoose from 'mongoose';
import { env, isTest } from './env';
import { logger } from '../utils/logger';

/**
 * MongoDB connection configuration
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const uri = isTest ? env.MONGODB_TEST_URI || env.MONGODB_URI : env.MONGODB_URI;

    logger.info('Attempting MongoDB connection...', { uri: uri.replace(/\/\/.*@/, '//<credentials>@') });

    mongoose.set('strictQuery', false);

    await mongoose.connect(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });

    logger.info('MongoDB connected successfully', {
      host: mongoose.connection.host,
      db: mongoose.connection.name,
    });

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB (useful for testing)
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

/**
 * Clear all collections in the database (useful for testing)
 */
export const clearDatabase = async (): Promise<void> => {
  if (!isTest) {
    throw new Error('clearDatabase can only be used in test environment');
  }

  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    logger.info('All collections cleared');
  } catch (error) {
    logger.error('Error clearing database:', error);
    throw error;
  }
};

export default mongoose;

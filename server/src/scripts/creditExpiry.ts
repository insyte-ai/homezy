import mongoose from 'mongoose';
import dotenv from 'dotenv';
import creditService from '../services/credit.service';
import { logger } from '../utils/logger';

dotenv.config();

/**
 * Daily cron job to expire old purchased credits (6 months old)
 * Should run daily at 02:00 UTC
 * Cron expression: 0 2 * * *
 */
async function creditExpiry() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/homezy';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB for credit expiry job');

    const result = await creditService.expireOldCredits();

    logger.info('Credit expiry job completed', {
      expiredTransactions: result.expiredTransactions,
      totalExpired: result.totalExpired,
    });

    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    logger.error('Error in credit expiry job:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  creditExpiry()
    .then((result) => {
      console.log('Credit expiry job completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Credit expiry job failed:', error);
      process.exit(1);
    });
}

export default creditExpiry;

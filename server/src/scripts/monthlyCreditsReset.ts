import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model';
import creditService from '../services/credit.service';
import { logger } from '../utils/logger';

dotenv.config();

/**
 * Monthly cron job to reset free credits for all verified professionals
 * Should run on the 1st of each month at 00:01 UTC
 * Cron expression: 1 0 1 * *
 */
async function monthlyCreditsReset() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/homezy';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB for monthly credits reset');

    // Get all verified professionals (both basic and comprehensive)
    const professionals = await User.find({
      role: 'professional',
      'professionalProfile.verificationStatus': { $in: ['basic', 'comprehensive'] },
    }).select('_id email professionalProfile.verificationStatus');

    logger.info(`Found ${professionals.length} verified professionals for credit reset`);

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ email: string; error: string }> = [];

    // Reset credits for each professional
    for (const professional of professionals) {
      try {
        await creditService.resetMonthlyCredits(professional._id.toString());
        successCount++;
        logger.info(`Reset credits for professional: ${professional.email}`);
      } catch (error: any) {
        errorCount++;
        errors.push({
          email: professional.email,
          error: error.message,
        });
        logger.error(`Failed to reset credits for professional ${professional.email}:`, error.message);
      }
    }

    logger.info('Monthly credit reset completed', {
      totalProfessionals: professionals.length,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
    });

    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');

    return {
      success: true,
      totalProfessionals: professionals.length,
      successCount,
      errorCount,
      errors,
    };
  } catch (error: any) {
    logger.error('Error in monthly credits reset:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  monthlyCreditsReset()
    .then((result) => {
      console.log('Monthly credits reset completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Monthly credits reset failed:', error);
      process.exit(1);
    });
}

export default monthlyCreditsReset;

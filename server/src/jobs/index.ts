import { startDirectLeadExpiryJob } from './directLeadExpiry.job';
import { startDirectLeadRemindersJob } from './directLeadReminders.job';
import { logger } from '../utils/logger';

/**
 * Initialize and start all scheduled jobs
 */
export const initializeJobs = () => {
  try {
    logger.info('Initializing scheduled jobs...');

    // Start direct lead expiry job (converts expired direct leads to public)
    startDirectLeadExpiryJob();

    // Start direct lead reminders job (sends 12h and 1h reminder emails)
    startDirectLeadRemindersJob();

    logger.info('All scheduled jobs initialized successfully');
  } catch (error: any) {
    logger.error('Failed to initialize scheduled jobs', {
      error: error.message,
      stack: error.stack,
    });
  }
};

export default initializeJobs;

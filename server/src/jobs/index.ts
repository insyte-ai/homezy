import { startDirectLeadExpiryJob } from './directLeadExpiry.job';
import { startDirectLeadRemindersJob } from './directLeadReminders.job';
import { startSitemapJob } from './sitemap.job';
import { startServiceReminderNotificationsJob } from './serviceReminderNotifications.job';
import { startSeasonalRemindersJob } from './seasonalReminders.job';
import { startServicePatternAnalysisJob } from './servicePatternAnalysis.job';
import { startTradeLicenseExpiryJob } from './tradeLicenseExpiry.job';
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

    // Start sitemap jobs (cache warming and search engine notifications)
    startSitemapJob();

    // Start service reminder notification job (daily at 9 AM UAE)
    startServiceReminderNotificationsJob();

    // Start seasonal reminders job (1st of each month)
    startSeasonalRemindersJob();

    // Start service pattern analysis job (weekly on Sundays)
    startServicePatternAnalysisJob();

    // Start trade license expiry notification job (daily at 9 AM UAE)
    startTradeLicenseExpiryJob();

    logger.info('All scheduled jobs initialized successfully');
  } catch (error: any) {
    logger.error('Failed to initialize scheduled jobs', {
      error: error.message,
      stack: error.stack,
    });
  }
};

export default initializeJobs;

import cron from 'node-cron';
import { User } from '../models/User.model';
import { Property } from '../models/Property.model';
import { logger } from '../utils/logger';
import * as serviceReminderService from '../services/serviceReminder.service';

/**
 * Seasonal Reminders Job
 * Runs on the 1st of each month at 8 AM UAE time (4 AM UTC) to create seasonal reminders
 *
 * Creates UAE-specific seasonal maintenance reminders:
 * - March/April: Pre-summer AC prep
 * - September: Post-summer AC service
 * - November: Water heater check before winter
 */

export const startSeasonalRemindersJob = () => {
  // Run on the 1st of each month at 8 AM UAE (4 AM UTC): '0 4 1 * *'
  cron.schedule('0 4 1 * *', async () => {
    try {
      logger.info('Running seasonal reminders job...');

      const currentMonth = new Date().getMonth() + 1; // 1-12
      const results = {
        usersProcessed: 0,
        remindersCreated: 0,
        errors: 0,
      };

      // Get all homeowners with properties
      const homeowners = await User.find({
        role: 'homeowner',
        'homeownerProfile.notificationPreferences.seasonalReminders': { $ne: false },
      }).select('_id');

      for (const homeowner of homeowners) {
        try {
          // Get primary property for this homeowner
          const primaryProperty = await Property.findOne({
            homeownerId: homeowner._id,
            isPrimary: true,
          });

          // Create seasonal reminders
          const created = await serviceReminderService.createSeasonalReminders(
            homeowner._id.toString(),
            primaryProperty?._id.toString(),
            currentMonth
          );

          results.usersProcessed++;
          results.remindersCreated += created;
        } catch (error: any) {
          results.errors++;
          logger.error('Failed to create seasonal reminders for homeowner', {
            homeownerId: homeowner._id,
            error: error.message,
          });
        }
      }

      logger.info('Seasonal reminders job completed', results);
    } catch (error: any) {
      logger.error('Error running seasonal reminders job', {
        error: error.message,
        stack: error.stack,
      });
    }
  });

  logger.info('Seasonal reminders job scheduled (runs 1st of each month at 8 AM UAE)');
};

/**
 * Manually trigger seasonal reminder creation for testing
 */
export const runSeasonalRemindersNow = async (month?: number) => {
  logger.info('Manually running seasonal reminders...');

  const currentMonth = month ?? new Date().getMonth() + 1;
  const results = {
    usersProcessed: 0,
    remindersCreated: 0,
    errors: 0,
  };

  const homeowners = await User.find({
    role: 'homeowner',
    'homeownerProfile.notificationPreferences.seasonalReminders': { $ne: false },
  }).select('_id');

  for (const homeowner of homeowners) {
    try {
      const primaryProperty = await Property.findOne({
        homeownerId: homeowner._id,
        isPrimary: true,
      });

      const created = await serviceReminderService.createSeasonalReminders(
        homeowner._id.toString(),
        primaryProperty?._id.toString(),
        currentMonth
      );

      results.usersProcessed++;
      results.remindersCreated += created;
    } catch (error: any) {
      results.errors++;
    }
  }

  return results;
};

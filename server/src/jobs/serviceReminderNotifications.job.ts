import cron from 'node-cron';
import { ServiceReminder } from '../models/ServiceReminder.model';
import { User } from '../models/User.model';
import { Property } from '../models/Property.model';
import { emailService } from '../services/email.service';
import { logger } from '../utils/logger';
import * as serviceReminderService from '../services/serviceReminder.service';

/**
 * Service Reminder Notifications Job
 * Runs daily at 9 AM UAE time (UTC+4, so 5 AM UTC) to send reminder emails
 *
 * Sends reminders at configured lead times:
 * - Default: 30 days, 7 days, 1 day before due date
 */

export const startServiceReminderNotificationsJob = () => {
  // Run daily at 9 AM UAE (5 AM UTC): '0 5 * * *'
  cron.schedule('0 5 * * *', async () => {
    try {
      logger.info('Running service reminder notifications job...');

      const results = {
        checked: 0,
        sent: 0,
        errors: 0,
      };

      // Check reminders for each lead time (30, 7, 1 days)
      for (const daysBeforeDue of [30, 7, 1]) {
        const reminders = await serviceReminderService.getRemindersNeedingNotification(daysBeforeDue);
        results.checked += reminders.length;

        for (const reminder of reminders) {
          try {
            // Get homeowner details
            const homeowner = await User.findById(reminder.homeownerId);
            if (!homeowner || !homeowner.email) {
              continue;
            }

            // Check notification preferences
            const notifPrefs = homeowner.homeownerProfile?.notificationPreferences;
            if (notifPrefs?.email?.serviceReminders === false) {
              continue;
            }

            // Get property name if applicable
            let propertyName = 'your property';
            if (reminder.propertyId) {
              const property = await Property.findById(reminder.propertyId);
              if (property) {
                propertyName = property.name;
              }
            }

            // Send email notification
            await emailService.sendServiceReminderEmail(
              homeowner.email,
              {
                firstName: homeowner.firstName,
                reminderTitle: reminder.title,
                category: reminder.category,
                propertyName,
                dueDate: reminder.nextDueDate,
                daysUntilDue: daysBeforeDue,
                reminderId: reminder._id.toString(),
              }
            );

            // Record that notification was sent
            await serviceReminderService.recordReminderSent(
              reminder._id.toString(),
              'email',
              daysBeforeDue
            );

            results.sent++;

            logger.info('Sent service reminder notification', {
              reminderId: reminder._id,
              homeownerId: homeowner._id,
              daysBeforeDue,
            });
          } catch (error: any) {
            results.errors++;
            logger.error('Failed to send service reminder notification', {
              reminderId: reminder._id,
              error: error.message,
            });
          }
        }
      }

      logger.info('Service reminder notifications job completed', results);
    } catch (error: any) {
      logger.error('Error running service reminder notifications job', {
        error: error.message,
        stack: error.stack,
      });
    }
  });

  logger.info('Service reminder notifications job scheduled (runs daily at 9 AM UAE)');
};

/**
 * Manually trigger reminder check for testing
 */
export const runServiceReminderNotificationsNow = async () => {
  logger.info('Manually running service reminder notifications...');

  const results = {
    checked: 0,
    sent: 0,
    errors: 0,
  };

  for (const daysBeforeDue of [30, 7, 1]) {
    const reminders = await serviceReminderService.getRemindersNeedingNotification(daysBeforeDue);
    results.checked += reminders.length;

    for (const reminder of reminders) {
      try {
        const homeowner = await User.findById(reminder.homeownerId);
        if (!homeowner || !homeowner.email) continue;

        let propertyName = 'your property';
        if (reminder.propertyId) {
          const property = await Property.findById(reminder.propertyId);
          if (property) propertyName = property.name;
        }

        await emailService.sendServiceReminderEmail(
          homeowner.email,
          {
            firstName: homeowner.firstName,
            reminderTitle: reminder.title,
            category: reminder.category,
            propertyName,
            dueDate: reminder.nextDueDate,
            daysUntilDue: daysBeforeDue,
            reminderId: reminder._id.toString(),
          }
        );

        await serviceReminderService.recordReminderSent(
          reminder._id.toString(),
          'email',
          daysBeforeDue
        );

        results.sent++;
      } catch (error: any) {
        results.errors++;
      }
    }
  }

  return results;
};

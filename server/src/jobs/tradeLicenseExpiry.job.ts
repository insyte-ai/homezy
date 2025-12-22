import cron from 'node-cron';
import { User } from '../models/User.model';
import { emailService } from '../services/email.service';
import { notificationService } from '../services/notification.service';
import { logger } from '../utils/logger';

/**
 * Trade License Expiry Notifications Job
 * Runs daily at 9 AM UAE time (UTC+4, so 5 AM UTC)
 *
 * Sends notifications:
 * - 7 days before expiry (one-time)
 * - Daily after expiry (until license is renewed)
 */

const DAYS_BEFORE_EXPIRY_WARNING = 7;

/**
 * Get professionals whose trade license expires in exactly N days
 */
async function getProsExpiringInDays(days: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + days);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  return User.find({
    role: 'pro',
    'proProfile.tradeLicenseExpiry': {
      $gte: targetDate,
      $lt: nextDay,
    },
    // Only send if 7-day notification hasn't been sent yet
    $or: [
      { 'proProfile.tradeLicenseExpiryNotification7DaysSent': { $exists: false } },
      { 'proProfile.tradeLicenseExpiryNotification7DaysSent': null },
    ],
  }).lean();
}

/**
 * Get professionals with expired trade licenses
 */
async function getProsWithExpiredLicenses() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find pros with expired licenses where daily notification hasn't been sent today
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return User.find({
    role: 'pro',
    'proProfile.tradeLicenseExpiry': { $lt: today },
    // Only send if daily notification hasn't been sent today
    $or: [
      { 'proProfile.tradeLicenseExpiryNotificationDailySent': { $exists: false } },
      { 'proProfile.tradeLicenseExpiryNotificationDailySent': null },
      { 'proProfile.tradeLicenseExpiryNotificationDailySent': { $lt: today } },
    ],
  }).lean();
}

/**
 * Get all admin users
 */
async function getAdmins() {
  return User.find({ role: 'admin' }).select('_id email firstName').lean();
}

/**
 * Calculate days between two dates
 */
function getDaysDifference(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

/**
 * Process professionals with expiring licenses (7 days before)
 */
async function processExpiringLicenses() {
  const results = { processed: 0, notified: 0, errors: 0 };

  try {
    const expiringPros = await getProsExpiringInDays(DAYS_BEFORE_EXPIRY_WARNING);
    results.processed = expiringPros.length;

    if (expiringPros.length === 0) {
      logger.debug('No professionals with licenses expiring in 7 days');
      return results;
    }

    const admins = await getAdmins();

    for (const pro of expiringPros) {
      try {
        const expiryDate = pro.proProfile?.tradeLicenseExpiry;
        if (!expiryDate) continue;

        const proName = `${pro.firstName || ''} ${pro.lastName || ''}`.trim() || 'Professional';
        const businessName = pro.proProfile?.businessName || 'Your Business';

        // Send email to professional
        await emailService.sendTradeLicenseExpiryWarning(pro.email, {
          professionalName: proName,
          businessName,
          expiryDate: new Date(expiryDate),
          daysUntilExpiry: DAYS_BEFORE_EXPIRY_WARNING,
        });

        // Send in-app notification to professional
        await notificationService.notifyProTradeLicenseExpiring(
          pro._id.toString(),
          businessName,
          new Date(expiryDate),
          DAYS_BEFORE_EXPIRY_WARNING
        );

        // Notify admins
        await notificationService.notifyAdminsTradeLicenseExpiry(
          pro._id.toString(),
          proName,
          businessName,
          new Date(expiryDate),
          'expiring',
          DAYS_BEFORE_EXPIRY_WARNING
        );

        // Send email to each admin
        for (const admin of admins) {
          try {
            await emailService.sendAdminTradeLicenseAlert(admin.email, {
              adminName: admin.firstName || 'Admin',
              professionalName: proName,
              businessName,
              professionalId: pro._id.toString(),
              expiryDate: new Date(expiryDate),
              status: 'expiring',
              daysRemaining: DAYS_BEFORE_EXPIRY_WARNING,
            });
          } catch (adminEmailError: any) {
            logger.error('Failed to send admin trade license alert email', {
              adminId: admin._id,
              proId: pro._id,
              error: adminEmailError.message,
            });
          }
        }

        // Mark 7-day notification as sent
        await User.updateOne(
          { _id: pro._id },
          { $set: { 'proProfile.tradeLicenseExpiryNotification7DaysSent': new Date() } }
        );

        results.notified++;

        logger.info('Sent trade license expiry warning', {
          proId: pro._id,
          expiryDate,
          daysUntilExpiry: DAYS_BEFORE_EXPIRY_WARNING,
        });
      } catch (error: any) {
        results.errors++;
        logger.error('Failed to process expiring license notification', {
          proId: pro._id,
          error: error.message,
        });
      }
    }
  } catch (error: any) {
    logger.error('Error processing expiring licenses', {
      error: error.message,
      stack: error.stack,
    });
  }

  return results;
}

/**
 * Process professionals with expired licenses (daily reminders)
 */
async function processExpiredLicenses() {
  const results = { processed: 0, notified: 0, errors: 0 };

  try {
    const expiredPros = await getProsWithExpiredLicenses();
    results.processed = expiredPros.length;

    if (expiredPros.length === 0) {
      logger.debug('No professionals with expired licenses needing notification');
      return results;
    }

    const admins = await getAdmins();
    const today = new Date();

    for (const pro of expiredPros) {
      try {
        const expiryDate = pro.proProfile?.tradeLicenseExpiry;
        if (!expiryDate) continue;

        const proName = `${pro.firstName || ''} ${pro.lastName || ''}`.trim() || 'Professional';
        const businessName = pro.proProfile?.businessName || 'Your Business';
        const daysSinceExpiry = getDaysDifference(today, new Date(expiryDate));

        // Send email to professional
        await emailService.sendTradeLicenseExpiredReminder(pro.email, {
          professionalName: proName,
          businessName,
          expiryDate: new Date(expiryDate),
          daysSinceExpiry,
        });

        // Send in-app notification to professional
        await notificationService.notifyProTradeLicenseExpired(
          pro._id.toString(),
          businessName,
          new Date(expiryDate),
          daysSinceExpiry
        );

        // Notify admins (only on day 1, 7, 14, 30 to avoid spam)
        if ([1, 7, 14, 30].includes(daysSinceExpiry) || daysSinceExpiry % 30 === 0) {
          await notificationService.notifyAdminsTradeLicenseExpiry(
            pro._id.toString(),
            proName,
            businessName,
            new Date(expiryDate),
            'expired',
            undefined,
            daysSinceExpiry
          );

          // Send email to each admin
          for (const admin of admins) {
            try {
              await emailService.sendAdminTradeLicenseAlert(admin.email, {
                adminName: admin.firstName || 'Admin',
                professionalName: proName,
                businessName,
                professionalId: pro._id.toString(),
                expiryDate: new Date(expiryDate),
                status: 'expired',
                daysSinceExpiry,
              });
            } catch (adminEmailError: any) {
              logger.error('Failed to send admin trade license expired email', {
                adminId: admin._id,
                proId: pro._id,
                error: adminEmailError.message,
              });
            }
          }
        }

        // Mark daily notification as sent
        await User.updateOne(
          { _id: pro._id },
          { $set: { 'proProfile.tradeLicenseExpiryNotificationDailySent': new Date() } }
        );

        results.notified++;

        logger.info('Sent trade license expired reminder', {
          proId: pro._id,
          expiryDate,
          daysSinceExpiry,
        });
      } catch (error: any) {
        results.errors++;
        logger.error('Failed to process expired license notification', {
          proId: pro._id,
          error: error.message,
        });
      }
    }
  } catch (error: any) {
    logger.error('Error processing expired licenses', {
      error: error.message,
      stack: error.stack,
    });
  }

  return results;
}

/**
 * Start the trade license expiry job
 */
export const startTradeLicenseExpiryJob = () => {
  // Run daily at 9 AM UAE (5 AM UTC): '0 5 * * *'
  cron.schedule('0 5 * * *', async () => {
    try {
      logger.info('Running trade license expiry notifications job...');

      // Process licenses expiring in 7 days
      const expiringResults = await processExpiringLicenses();

      // Process already expired licenses
      const expiredResults = await processExpiredLicenses();

      logger.info('Trade license expiry notifications job completed', {
        expiring: expiringResults,
        expired: expiredResults,
      });
    } catch (error: any) {
      logger.error('Error running trade license expiry job', {
        error: error.message,
        stack: error.stack,
      });
    }
  });

  logger.info('Trade license expiry job scheduled (runs daily at 9 AM UAE)');
};

/**
 * Manually trigger the job for testing
 */
export const runTradeLicenseExpiryJobNow = async () => {
  logger.info('Manually running trade license expiry notifications...');

  const expiringResults = await processExpiringLicenses();
  const expiredResults = await processExpiredLicenses();

  return {
    expiring: expiringResults,
    expired: expiredResults,
  };
};

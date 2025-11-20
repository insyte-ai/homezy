import cron from 'node-cron';
import { Lead } from '../models/Lead.model';
import { User } from '../models/User.model';
import { emailService } from '../services/email.service';
import { logger } from '../utils/logger';

/**
 * Direct Lead Reminders Job
 * Runs every 10 minutes to send reminder emails to professionals about pending direct leads
 *
 * Sends two reminders:
 * - 12 hours before expiry (reminder1)
 * - 1 hour before expiry (reminder2)
 */

export const startDirectLeadRemindersJob = () => {
  // Run every 10 minutes: '*/10 * * * *'
  cron.schedule('*/10 * * * *', async () => {
    try {
      logger.info('Running direct lead reminders job...');

      const now = new Date();

      // Find pending direct leads that need reminders
      const leadsNeedingReminders = await Lead.find({
        leadType: 'direct',
        directLeadStatus: 'pending',
        directLeadExpiresAt: { $gt: now }, // Not yet expired
      });

      if (leadsNeedingReminders.length === 0) {
        logger.info('No direct leads need reminders');
        return;
      }

      let reminder1Sent = 0;
      let reminder2Sent = 0;

      for (const lead of leadsNeedingReminders) {
        const expiresAt = lead.directLeadExpiresAt!;
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);

        try {
          // Send reminder 1 (12 hours before expiry)
          if (!lead.reminder1Sent && hoursUntilExpiry <= 12) {
            const professional = await User.findById(lead.targetProfessionalId);
            if (professional) {
              await emailService.sendDirectLeadReminder1(
                professional.email,
                {
                  professionalName: `${professional.firstName} ${professional.lastName}`,
                  leadTitle: lead.title,
                  leadCategory: lead.category,
                  leadId: lead._id.toString(),
                  expiresAt,
                  hoursRemaining: Math.ceil(hoursUntilExpiry),
                }
              );

              lead.reminder1Sent = true;
              await lead.save();
              reminder1Sent++;

              logger.info('Sent 12-hour reminder for direct lead', {
                leadId: lead._id,
                professionalId: professional._id,
              });
            }
          }

          // Send reminder 2 (1 hour before expiry)
          if (!lead.reminder2Sent && hoursUntilExpiry <= 1) {
            const professional = await User.findById(lead.targetProfessionalId);
            if (professional) {
              await emailService.sendDirectLeadReminder2(
                professional.email,
                {
                  professionalName: `${professional.firstName} ${professional.lastName}`,
                  leadTitle: lead.title,
                  leadCategory: lead.category,
                  leadId: lead._id.toString(),
                  expiresAt,
                  minutesRemaining: Math.ceil((timeUntilExpiry / (1000 * 60))),
                }
              );

              lead.reminder2Sent = true;
              await lead.save();
              reminder2Sent++;

              logger.info('Sent 1-hour reminder for direct lead', {
                leadId: lead._id,
                professionalId: professional._id,
              });
            }
          }
        } catch (error: any) {
          logger.error('Failed to send reminder for direct lead', {
            leadId: lead._id,
            error: error.message,
          });
        }
      }

      if (reminder1Sent > 0 || reminder2Sent > 0) {
        logger.info('Direct lead reminders job completed', {
          reminder1Sent,
          reminder2Sent,
        });
      }
    } catch (error: any) {
      logger.error('Error running direct lead reminders job', {
        error: error.message,
        stack: error.stack,
      });
    }
  });

  logger.info('Direct lead reminders job scheduled (runs every 10 minutes)');
};

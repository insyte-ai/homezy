import cron from 'node-cron';
import { Lead } from '../models/Lead.model';
import { convertDirectToPublic } from '../services/directLead.service';
import { logger } from '../utils/logger';

/**
 * Direct Lead Expiry Job
 * Runs every 10 minutes to check for expired direct leads and convert them to public
 *
 * Direct leads expire after 24 hours if not accepted by the target professional
 */

export const startDirectLeadExpiryJob = () => {
  // Run every 10 minutes: '*/10 * * * *'
  cron.schedule('*/10 * * * *', async () => {
    try {
      logger.info('Running direct lead expiry job...');

      // Find all pending direct leads that have expired
      const expiredLeads = await Lead.find({
        leadType: 'direct',
        directLeadStatus: 'pending',
        directLeadExpiresAt: { $lte: new Date() },
      });

      if (expiredLeads.length === 0) {
        logger.info('No expired direct leads found');
        return;
      }

      logger.info(`Found ${expiredLeads.length} expired direct leads to convert`);

      // Convert each expired lead to public
      const results = await Promise.allSettled(
        expiredLeads.map(async (lead) => {
          try {
            await convertDirectToPublic(lead._id.toString());
            logger.info('Converted expired direct lead to public', {
              leadId: lead._id,
              targetProfessionalId: lead.targetProfessionalId,
            });
            return { success: true, leadId: lead._id };
          } catch (error: any) {
            logger.error('Failed to convert expired direct lead', {
              leadId: lead._id,
              error: error.message,
            });
            return { success: false, leadId: lead._id, error: error.message };
          }
        })
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      logger.info('Direct lead expiry job completed', {
        total: expiredLeads.length,
        successful,
        failed,
      });
    } catch (error: any) {
      logger.error('Error running direct lead expiry job', {
        error: error.message,
        stack: error.stack,
      });
    }
  });

  logger.info('Direct lead expiry job scheduled (runs every 10 minutes)');
};

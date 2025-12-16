import cron from 'node-cron';
import { User } from '../models/User.model';
import { Property } from '../models/Property.model';
import { logger } from '../utils/logger';
import * as serviceReminderService from '../services/serviceReminder.service';

/**
 * Service Pattern Analysis Job
 * Runs weekly on Sundays at 2 AM UAE time (Saturday 10 PM UTC) to analyze service history
 *
 * Analyzes homeowner service history to:
 * - Detect recurring service patterns (e.g., monthly pool cleaning)
 * - Auto-create or update reminders based on detected frequency
 * - E.g., "User has done pool cleaning monthly for 6 months → suggest monthly reminder"
 */

export const startServicePatternAnalysisJob = () => {
  // Run every Sunday at 2 AM UAE (Saturday 10 PM UTC): '0 22 * * 6'
  cron.schedule('0 22 * * 6', async () => {
    try {
      logger.info('Running service pattern analysis job...');

      const results = {
        usersProcessed: 0,
        remindersCreated: 0,
        remindersUpdated: 0,
        errors: 0,
      };

      // Get all homeowners
      const homeowners = await User.find({
        role: 'homeowner',
      }).select('_id');

      for (const homeowner of homeowners) {
        try {
          // Get primary property for this homeowner
          const primaryProperty = await Property.findOne({
            homeownerId: homeowner._id,
            isPrimary: true,
          });

          // Sync reminders from service history patterns
          const syncResult = await serviceReminderService.syncRemindersFromServiceHistory(
            homeowner._id.toString(),
            primaryProperty?._id.toString()
          );

          results.usersProcessed++;
          results.remindersCreated += syncResult.created;
          results.remindersUpdated += syncResult.updated;

          if (syncResult.created > 0 || syncResult.updated > 0) {
            logger.info('Pattern-based reminders synced for homeowner', {
              homeownerId: homeowner._id,
              created: syncResult.created,
              updated: syncResult.updated,
            });
          }
        } catch (error: any) {
          results.errors++;
          logger.error('Failed to analyze service patterns for homeowner', {
            homeownerId: homeowner._id,
            error: error.message,
          });
        }
      }

      logger.info('Service pattern analysis job completed', results);
    } catch (error: any) {
      logger.error('Error running service pattern analysis job', {
        error: error.message,
        stack: error.stack,
      });
    }
  });

  logger.info('Service pattern analysis job scheduled (runs every Sunday at 2 AM UAE)');
};

/**
 * Manually trigger pattern analysis for testing
 */
export const runServicePatternAnalysisNow = async (homeownerId?: string) => {
  logger.info('Manually running service pattern analysis...');

  const results = {
    usersProcessed: 0,
    remindersCreated: 0,
    remindersUpdated: 0,
    errors: 0,
  };

  // If specific homeowner provided, only process that one
  const query: any = { role: 'homeowner' };
  if (homeownerId) {
    query._id = homeownerId;
  }

  const homeowners = await User.find(query).select('_id');

  for (const homeowner of homeowners) {
    try {
      const primaryProperty = await Property.findOne({
        homeownerId: homeowner._id,
        isPrimary: true,
      });

      const syncResult = await serviceReminderService.syncRemindersFromServiceHistory(
        homeowner._id.toString(),
        primaryProperty?._id.toString()
      );

      results.usersProcessed++;
      results.remindersCreated += syncResult.created;
      results.remindersUpdated += syncResult.updated;
    } catch (error: any) {
      results.errors++;
    }
  }

  return results;
};

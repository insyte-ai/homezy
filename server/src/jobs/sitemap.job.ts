import cron from 'node-cron';
import axios from 'axios';
import { logger } from '../utils/logger';

const BASE_URL = process.env.BASE_URL || 'https://homezy.co';

/**
 * Sitemap cron jobs for cache warming and search engine notifications
 */

/**
 * Start all sitemap-related cron jobs
 */
export const startSitemapJob = () => {
  logger.info('Starting sitemap cron jobs...');

  // Ping main sitemap every 6 hours to trigger cache regeneration
  cron.schedule('0 */6 * * *', async () => {
    logger.info('Pinging sitemap for regeneration...');
    try {
      // Hit sitemap endpoint to warm cache (served by Next.js client)
      await axios.get(`${BASE_URL}/sitemap.xml`, { timeout: 30000 });
      logger.info('Sitemap cache warmed successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('Sitemap cache warming failed:', { message: error.message });
      } else {
        logger.error('Sitemap cache warming failed:', { error });
      }
    }
  });

  // Ping Google Search Console to notify of sitemap updates (every 12 hours)
  cron.schedule('0 */12 * * *', async () => {
    logger.info('Notifying Google of sitemap update...');
    try {
      const sitemapUrl = encodeURIComponent(`${BASE_URL}/sitemap.xml`);
      await axios.get(`https://www.google.com/ping?sitemap=${sitemapUrl}`, {
        timeout: 10000
      });
      logger.info('Google notified successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('Google notification failed:', { message: error.message });
      } else {
        logger.error('Google notification failed:', { error });
      }
    }
  });

  // Ping Bing Search Console (every 12 hours, offset by 1 hour from Google)
  cron.schedule('0 1,13 * * *', async () => {
    logger.info('Notifying Bing of sitemap update...');
    try {
      const sitemapUrl = encodeURIComponent(`${BASE_URL}/sitemap.xml`);
      await axios.get(`https://www.bing.com/ping?sitemap=${sitemapUrl}`, {
        timeout: 10000
      });
      logger.info('Bing notified successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('Bing notification failed:', { message: error.message });
      } else {
        logger.error('Bing notification failed:', { error });
      }
    }
  });

  logger.info('Sitemap cron jobs initialized:');
  logger.info('  - Sitemap cache warming: every 6 hours');
  logger.info('  - Google notification: every 12 hours');
  logger.info('  - Bing notification: every 12 hours (offset)');
};

export default startSitemapJob;

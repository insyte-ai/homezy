import path from 'path';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { logger } from '../utils/logger';
import { seedAdmins } from './adminSeeder';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface SeederResult {
  name: string;
  created: number;
  skipped: number;
  error?: string;
}

const runAllSeeders = async (): Promise<void> => {
  const results: SeederResult[] = [];
  let hasErrors = false;

  try {
    logger.info('🌱 Starting Homezy database seeding...\n');

    // Connect to database
    await connectDatabase();

    // Seeder 1: Admin Users
    try {
      logger.info('━'.repeat(60));
      logger.info('STEP 1: Seeding Admin Users');
      logger.info('━'.repeat(60));
      const adminResult = await seedAdmins();
      results.push({ name: 'Admin Users', ...adminResult });
    } catch (error: any) {
      logger.error('❌ Admin seeder failed:', error.message);
      results.push({ name: 'Admin Users', created: 0, skipped: 0, error: error.message });
      hasErrors = true;
    }

    // Add more seeders here as they are created
    // Example:
    // try {
    //   logger.info('\n' + '━'.repeat(60));
    //   logger.info('STEP 2: Seeding Service Categories');
    //   logger.info('━'.repeat(60));
    //   const categoryResult = await seedCategories();
    //   results.push({ name: 'Service Categories', ...categoryResult });
    // } catch (error: any) {
    //   logger.error('❌ Category seeder failed:', error.message);
    //   results.push({ name: 'Service Categories', created: 0, skipped: 0, error: error.message });
    //   hasErrors = true;
    // }

    // Display summary
    logger.info('\n\n' + '='.repeat(60));
    logger.info('📊 SEEDING SUMMARY');
    logger.info('='.repeat(60));

    results.forEach((result) => {
      const status = result.error ? '❌' : '✅';
      logger.info(`${status} ${result.name}:`);
      if (result.error) {
        logger.info(`   Error: ${result.error}`);
      } else {
        logger.info(`   Created: ${result.created}`);
        logger.info(`   Skipped: ${result.skipped}`);
      }
    });

    logger.info('='.repeat(60));

    if (hasErrors) {
      logger.warn('\n⚠️  Some seeders failed. Check the logs above for details.');
    } else {
      logger.info('\n🎉 All seeders completed successfully!');
    }

    // Disconnect from database
    await disconnectDatabase();

    // Exit with appropriate code
    process.exit(hasErrors ? 1 : 0);
  } catch (error: any) {
    logger.error('❌ Fatal error during seeding:', error);
    await disconnectDatabase();
    process.exit(1);
  }
};

// Run the seeders
runAllSeeders();

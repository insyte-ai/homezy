/**
 * Script to manually run the trade license expiry job
 * Usage: npx ts-node scripts/runTradeLicenseExpiryJob.ts
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { runTradeLicenseExpiryJobNow } from '../src/jobs/tradeLicenseExpiry.job';

// Load environment variables
config();

async function main() {
  try {
    console.log('Connecting to MongoDB...');

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/homezy';
    await mongoose.connect(mongoUri);

    console.log('Connected to MongoDB');
    console.log('Running trade license expiry job...\n');

    const results = await runTradeLicenseExpiryJobNow();

    console.log('\n=== Job Results ===');
    console.log('Expiring licenses (7 days warning):');
    console.log(`  - Processed: ${results.expiring.processed}`);
    console.log(`  - Notified: ${results.expiring.notified}`);
    console.log(`  - Errors: ${results.expiring.errors}`);

    console.log('\nExpired licenses (daily reminders):');
    console.log(`  - Processed: ${results.expired.processed}`);
    console.log(`  - Notified: ${results.expired.notified}`);
    console.log(`  - Errors: ${results.expired.errors}`);

    console.log('\nJob completed successfully!');
  } catch (error) {
    console.error('Error running job:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

main();

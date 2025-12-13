import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import ServiceGroup from '../models/Service.model';
import logger from '../utils/logger';
import { serviceStructure } from '@homezy/shared';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function seedServices() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/homezy';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');

    // Clear existing services
    await ServiceGroup.deleteMany({});
    logger.info('Cleared existing services');

    // Insert service structure
    await ServiceGroup.insertMany(serviceStructure);
    logger.info(`✅ Successfully seeded ${serviceStructure.length} service groups`);

    // Log summary
    let totalCategories = 0;
    let totalSubservices = 0;
    let totalServiceTypes = 0;

    serviceStructure.forEach(group => {
      totalCategories += group.categories.length;
      group.categories.forEach(category => {
        totalSubservices += category.subservices.length;
        category.subservices.forEach(subservice => {
          totalServiceTypes += subservice.serviceTypes?.length || 0;
        });
      });
    });

    logger.info('Summary:');
    logger.info(`  - Service Groups: ${serviceStructure.length}`);
    logger.info(`  - Categories: ${totalCategories}`);
    logger.info(`  - Subservices: ${totalSubservices}`);
    logger.info(`  - Service Types: ${totalServiceTypes}`);

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding services:', error);
    process.exit(1);
  }
}

// Run the seed function
seedServices();

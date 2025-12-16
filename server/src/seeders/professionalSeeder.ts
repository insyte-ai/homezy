import { User } from '../models/User.model';
import { logger } from '../utils/logger';

interface ProfessionalData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  businessName: string;
  tagline: string;
  bio: string;
  categories: string[];
  serviceAreas: Array<{
    emirate: string;
    neighborhoods: string[];
    willingToTravelOutside: boolean;
  }>;
  yearsInBusiness: number;
  teamSize: number;
  languages: string[];
  businessType: 'sole-establishment' | 'llc' | 'general-partnership' | 'limited-partnership' | 'civil-company' | 'foreign-branch' | 'free-zone';
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  minimumProjectSize?: number;
  rating: number;
  reviewCount: number;
  projectsCompleted: number;
}

const professionals: ProfessionalData[] = [
  {
    email: 'ahmed.plumbing@example.com',
    password: 'Pro@2025',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    phone: '+971501111111',
    businessName: 'Ahmed Plumbing Services',
    tagline: 'Expert plumbing solutions for your home and business',
    bio: 'With over 10 years of experience, we provide comprehensive plumbing services across Dubai. From emergency repairs to complete bathroom renovations, our licensed team delivers quality workmanship on every project.',
    categories: ['plumbing', 'bathroom remodeling'],
    serviceAreas: [
      {
        emirate: 'dubai',
        neighborhoods: ['Dubai Marina', 'JBR', 'Downtown Dubai', 'Business Bay'],
        willingToTravelOutside: true,
      },
    ],
    yearsInBusiness: 10,
    teamSize: 5,
    languages: ['English', 'Arabic'],
    businessType: 'llc',
    hourlyRateMin: 150,
    hourlyRateMax: 250,
    minimumProjectSize: 500,
    rating: 4.8,
    reviewCount: 47,
    projectsCompleted: 230,
  },
  {
    email: 'mohamed.electric@example.com',
    password: 'Pro@2025',
    firstName: 'Mohamed',
    lastName: 'Ali',
    phone: '+971502222222',
    businessName: 'Elite Electrical Solutions',
    tagline: 'Certified electricians for all your electrical needs',
    bio: 'Licensed electrical contractors serving Dubai and Sharjah. We specialize in residential and commercial electrical installations, repairs, and smart home integrations. Available 24/7 for emergency services.',
    categories: ['electrical', 'smart home & security'],
    serviceAreas: [
      {
        emirate: 'dubai',
        neighborhoods: ['Jumeirah', 'Palm Jumeirah', 'Arabian Ranches'],
        willingToTravelOutside: true,
      },
      {
        emirate: 'sharjah',
        neighborhoods: ['Al Nahda', 'Al Majaz', 'Al Khan'],
        willingToTravelOutside: false,
      },
    ],
    yearsInBusiness: 8,
    teamSize: 8,
    languages: ['English', 'Arabic', 'Urdu'],
    businessType: 'llc',
    hourlyRateMin: 180,
    hourlyRateMax: 300,
    minimumProjectSize: 800,
    rating: 4.9,
    reviewCount: 62,
    projectsCompleted: 315,
  },
  {
    email: 'john.hvac@example.com',
    password: 'Pro@2025',
    firstName: 'John',
    lastName: 'Smith',
    phone: '+971503333333',
    businessName: 'Cool Breeze AC Services',
    tagline: 'Keeping Dubai cool since 2010',
    bio: 'Specialized AC installation, maintenance, and repair services across UAE. Factory-trained technicians, genuine spare parts, and competitive pricing. Maintenance contracts available for residential and commercial properties.',
    categories: ['hvac'],
    serviceAreas: [
      {
        emirate: 'dubai',
        neighborhoods: ['All areas'],
        willingToTravelOutside: true,
      },
      {
        emirate: 'abu dhabi',
        neighborhoods: ['Al Reem Island', 'Yas Island', 'Saadiyat'],
        willingToTravelOutside: true,
      },
    ],
    yearsInBusiness: 14,
    teamSize: 12,
    languages: ['English', 'Arabic'],
    businessType: 'llc',
    hourlyRateMin: 200,
    hourlyRateMax: 350,
    minimumProjectSize: 1000,
    rating: 4.7,
    reviewCount: 89,
    projectsCompleted: 520,
  },
  {
    email: 'sara.interior@example.com',
    password: 'Pro@2025',
    firstName: 'Sara',
    lastName: 'Johnson',
    phone: '+971504444444',
    businessName: 'Modern Living Interiors',
    tagline: 'Transforming spaces into dream homes',
    bio: 'Award-winning interior design studio specializing in contemporary and modern designs. We handle everything from concept to completion, including furniture selection, custom millwork, and project management.',
    categories: ['interior design', 'kitchen remodeling', 'carpentry'],
    serviceAreas: [
      {
        emirate: 'dubai',
        neighborhoods: ['Emirates Hills', 'Dubai Hills', 'Mohammed Bin Rashid City'],
        willingToTravelOutside: true,
      },
    ],
    yearsInBusiness: 6,
    teamSize: 4,
    languages: ['English', 'Arabic', 'French'],
    businessType: 'llc',
    hourlyRateMin: 250,
    hourlyRateMax: 500,
    minimumProjectSize: 5000,
    rating: 4.9,
    reviewCount: 34,
    projectsCompleted: 87,
  },
  {
    email: 'khalid.painting@example.com',
    password: 'Pro@2025',
    firstName: 'Khalid',
    lastName: 'Ibrahim',
    phone: '+971505555555',
    businessName: 'Perfect Finish Painting',
    tagline: 'Professional painting services with guaranteed satisfaction',
    bio: 'Expert painters providing interior and exterior painting services. We use premium quality paints and modern techniques. Free color consultation and detailed quotations provided before starting any project.',
    categories: ['painting & wallpaper'],
    serviceAreas: [
      {
        emirate: 'dubai',
        neighborhoods: ['All areas'],
        willingToTravelOutside: false,
      },
      {
        emirate: 'sharjah',
        neighborhoods: ['All areas'],
        willingToTravelOutside: false,
      },
    ],
    yearsInBusiness: 7,
    teamSize: 10,
    languages: ['English', 'Arabic', 'Hindi'],
    businessType: 'sole-establishment',
    hourlyRateMin: 120,
    hourlyRateMax: 200,
    minimumProjectSize: 800,
    rating: 4.6,
    reviewCount: 71,
    projectsCompleted: 420,
  },
  {
    email: 'omar.general@example.com',
    password: 'Pro@2025',
    firstName: 'Omar',
    lastName: 'Abdullah',
    phone: '+971506666666',
    businessName: 'Complete Home Solutions',
    tagline: 'Your one-stop shop for all home improvement needs',
    bio: 'General contracting company offering full-service home improvement and renovation. From small repairs to complete home makeovers, we manage every aspect of your project with professional excellence.',
    categories: ['general contracting', 'kitchen remodeling', 'bathroom remodeling', 'flooring'],
    serviceAreas: [
      {
        emirate: 'dubai',
        neighborhoods: ['All areas'],
        willingToTravelOutside: true,
      },
      {
        emirate: 'abu dhabi',
        neighborhoods: ['All areas'],
        willingToTravelOutside: true,
      },
      {
        emirate: 'sharjah',
        neighborhoods: ['All areas'],
        willingToTravelOutside: false,
      },
    ],
    yearsInBusiness: 12,
    teamSize: 20,
    languages: ['English', 'Arabic'],
    businessType: 'llc',
    hourlyRateMin: 180,
    hourlyRateMax: 350,
    minimumProjectSize: 2000,
    rating: 4.8,
    reviewCount: 103,
    projectsCompleted: 645,
  },
  {
    email: 'ali.landscaping@example.com',
    password: 'Pro@2025',
    firstName: 'Ali',
    lastName: 'Mohammed',
    phone: '+971507777777',
    businessName: 'Green Paradise Landscaping',
    tagline: 'Creating beautiful outdoor spaces',
    bio: 'Professional landscaping and garden maintenance services. We design and build stunning gardens, install irrigation systems, and provide regular maintenance services. Specialized in sustainable landscaping for UAE climate.',
    categories: ['landscaping & garden'],
    serviceAreas: [
      {
        emirate: 'dubai',
        neighborhoods: ['Arabian Ranches', 'The Springs', 'The Lakes', 'Jumeirah'],
        willingToTravelOutside: true,
      },
    ],
    yearsInBusiness: 9,
    teamSize: 15,
    languages: ['English', 'Arabic', 'Urdu'],
    businessType: 'llc',
    hourlyRateMin: 150,
    hourlyRateMax: 250,
    minimumProjectSize: 1500,
    rating: 4.7,
    reviewCount: 56,
    projectsCompleted: 280,
  },
  {
    email: 'fatima.handyman@example.com',
    password: 'Pro@2025',
    firstName: 'Fatima',
    lastName: 'Al-Mansoori',
    phone: '+971508888888',
    businessName: 'Quick Fix Handyman Services',
    tagline: 'Fast, reliable handyman services at your doorstep',
    bio: 'Professional handyman services for all your home repair and maintenance needs. From furniture assembly to minor plumbing and electrical work, we handle it all. Same-day service available.',
    categories: ['handyman services'],
    serviceAreas: [
      {
        emirate: 'dubai',
        neighborhoods: ['All areas'],
        willingToTravelOutside: true,
      },
    ],
    yearsInBusiness: 5,
    teamSize: 6,
    languages: ['English', 'Arabic'],
    businessType: 'sole-establishment',
    hourlyRateMin: 100,
    hourlyRateMax: 180,
    minimumProjectSize: 200,
    rating: 4.8,
    reviewCount: 128,
    projectsCompleted: 890,
  },
];

export const seedProfessionals = async (): Promise<{
  created: number;
  skipped: number;
}> => {
  try {
    logger.info('🌱 Starting professional seeder...');

    // Check if professionals already exist
    const existingPros = await User.find({ role: 'pro', 'proProfile.verificationStatus': 'approved' });

    if (existingPros.length > 0 && process.env.SKIP_EXISTING_PROS !== 'false') {
      logger.info(`✅ ${existingPros.length} professional(s) already exist. Skipping seeding.`);
      logger.info('💡 Set SKIP_EXISTING_PROS=false to recreate professional users');
      return { created: 0, skipped: existingPros.length };
    }

    // If SKIP_EXISTING_PROS is false, delete existing seeded pros
    if (existingPros.length > 0 && process.env.SKIP_EXISTING_PROS === 'false') {
      logger.info('🗑️  Deleting existing professional users...');
      // Only delete the seeded pros (by email pattern)
      const seededEmails = professionals.map(p => p.email);
      await User.deleteMany({ role: 'pro', email: { $in: seededEmails } });
      logger.info(`✅ Deleted ${seededEmails.length} existing professional(s)`);
    }

    // Create professional users
    const createdPros = [];
    for (const proData of professionals) {
      const professional = new User({
        email: proData.email,
        password: proData.password,
        firstName: proData.firstName,
        lastName: proData.lastName,
        phone: proData.phone,
        role: 'pro',
        isEmailVerified: true,
        isPhoneVerified: true,
        proOnboardingCompleted: true,
        hasSetPassword: true,
        isGuestAccount: false,
        proProfile: {
          businessName: proData.businessName,
          slug: proData.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          tagline: proData.tagline,
          bio: proData.bio,
          categories: proData.categories,
          serviceAreas: proData.serviceAreas,
          yearsInBusiness: proData.yearsInBusiness,
          teamSize: proData.teamSize,
          languages: proData.languages,
          verificationStatus: 'approved',
          hourlyRateMin: proData.hourlyRateMin,
          hourlyRateMax: proData.hourlyRateMax,
          minimumProjectSize: proData.minimumProjectSize,
          rating: proData.rating,
          reviewCount: proData.reviewCount,
          projectsCompleted: proData.projectsCompleted,
          responseTimeHours: Math.floor(Math.random() * 12) + 1, // 1-12 hours
          quoteAcceptanceRate: Math.floor(Math.random() * 20) + 70, // 70-90%
          businessType: proData.businessType,
        },
      });

      const savedPro = await professional.save();
      createdPros.push(savedPro);
      logger.info(`✅ Created professional: ${savedPro.proProfile?.businessName} (${savedPro.email})`);
    }

    logger.info('\n📋 Professional Credentials Summary:');
    logger.info('━'.repeat(50));
    logger.info('All professionals have the same password: Pro@2025');
    logger.info('━'.repeat(50));
    createdPros.forEach((pro) => {
      logger.info(`Business: ${pro.proProfile?.businessName}`);
      logger.info(`Email: ${pro.email}`);
      logger.info(`Categories: ${pro.proProfile?.categories.join(', ')}`);
      logger.info('━'.repeat(50));
    });
    logger.warn('⚠️  Remember to change default passwords in production!');

    return { created: createdPros.length, skipped: 0 };
  } catch (error: any) {
    logger.error('❌ Error seeding professionals:', error);
    throw error;
  }
};

// Allow running this seeder standalone
if (require.main === module) {
  const path = require('path');
  const dotenv = require('dotenv');

  // Load environment variables
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });

  const { connectDatabase, disconnectDatabase } = require('../config/database');

  (async () => {
    try {
      await connectDatabase();
      const result = await seedProfessionals();
      logger.info(`\n✅ Professional seeder completed: ${result.created} created, ${result.skipped} skipped`);
      await disconnectDatabase();
      process.exit(0);
    } catch (error) {
      logger.error('❌ Professional seeder failed:', error);
      process.exit(1);
    }
  })();
}

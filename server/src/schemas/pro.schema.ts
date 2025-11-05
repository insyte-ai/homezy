import { z } from 'zod';

/**
 * Pro Profile Validation Schemas
 * Used for updating pro profiles, verification, portfolio, etc.
 */

// Service Area Schema
export const serviceAreaSchema = z.object({
  emirate: z.string().min(1, 'Emirate is required'),
  neighborhoods: z.array(z.string()).optional().default([]),
  serviceRadius: z.number().min(0).optional(),
  willingToTravelOutside: z.boolean().optional().default(false),
  extraTravelCost: z.number().min(0).optional(),
});

// Portfolio Item Schema
export const portfolioItemSchema = z.object({
  id: z.string().optional(), // Generated on server if not provided
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  category: z.string().min(1, 'Category is required'),
  images: z.array(z.string().url()).min(1, 'At least one image is required').max(10),
  beforeImages: z.array(z.string().url()).optional().default([]),
  afterImages: z.array(z.string().url()).optional().default([]),
  completionDate: z.coerce.date(),
  isFeatured: z.boolean().optional().default(false),
});

// Weekly Schedule Schema
const dayScheduleSchema = z.object({
  isAvailable: z.boolean().default(false),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:mm format
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
});

export const weeklyScheduleSchema = z.object({
  monday: dayScheduleSchema.optional(),
  tuesday: dayScheduleSchema.optional(),
  wednesday: dayScheduleSchema.optional(),
  thursday: dayScheduleSchema.optional(),
  friday: dayScheduleSchema.optional(),
  saturday: dayScheduleSchema.optional(),
  sunday: dayScheduleSchema.optional(),
});

// Availability Schema
export const availabilitySchema = z.object({
  schedule: weeklyScheduleSchema,
  unavailableDates: z.array(z.coerce.date()).optional().default([]),
  maxAppointmentsPerDay: z.number().min(1).max(20).optional().default(5),
  bufferTimeMinutes: z.number().min(0).max(120).optional().default(30),
});

// Pro Profile Update Schema
export const updateProProfileSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(100).optional(),
  tagline: z.string().max(150).optional(),
  bio: z.string().max(500).optional(),
  categories: z.array(z.string()).min(1, 'At least one service category is required').max(10).optional(),
  serviceAreas: z.array(serviceAreaSchema).min(1, 'At least one service area is required').max(7).optional(),
  yearsInBusiness: z.number().min(0).max(100).optional(),
  teamSize: z.number().min(1).max(1000).optional(),
  languages: z.array(z.string()).optional(),

  // Pricing
  hourlyRateMin: z.number().min(0).optional(),
  hourlyRateMax: z.number().min(0).optional(),
  minimumProjectSize: z.number().min(0).optional(),

  // Settings
  availability: availabilitySchema.optional(),
  businessType: z.enum(['sole-proprietor', 'llc', 'corporation']).optional(),
}).refine(
  (data) => {
    // Ensure max rate is greater than min rate if both are provided
    if (data.hourlyRateMin !== undefined && data.hourlyRateMax !== undefined) {
      return data.hourlyRateMax >= data.hourlyRateMin;
    }
    return true;
  },
  {
    message: 'Maximum hourly rate must be greater than or equal to minimum rate',
    path: ['hourlyRateMax'],
  }
);

// Verification Document Upload Schema
export const uploadVerificationDocumentSchema = z.object({
  type: z.enum(['license', 'insurance', 'id', 'portfolio', 'reference']),
  url: z.string().url('Invalid document URL'),
});

// Add Portfolio Item Schema
export const addPortfolioItemSchema = portfolioItemSchema.omit({ id: true });

// Update Portfolio Item Schema
export const updatePortfolioItemSchema = portfolioItemSchema.partial().required({ id: true });

// Update Featured Projects Schema
export const updateFeaturedProjectsSchema = z.object({
  featuredProjects: z.array(z.string()).max(6, 'Maximum 6 featured projects allowed'),
});

// Service Categories (from PRD - 22 categories)
export const SERVICE_CATEGORIES = [
  'plumbing',
  'electrical',
  'hvac',
  'general-contracting',
  'roofing',
  'painting-wallpaper',
  'flooring',
  'kitchen-remodeling',
  'bathroom-remodeling',
  'carpentry',
  'masonry-tiling',
  'landscaping-garden',
  'windows-doors',
  'interior-design',
  'architecture',
  'waterproofing-insulation',
  'smart-home-security',
  'pest-control',
  'cleaning-services',
  'pool-spa',
  'appliance-repair',
  'handyman-services',
] as const;

// UAE Emirates
export const UAE_EMIRATES = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
] as const;

// Export type inference
export type UpdateProProfile = z.infer<typeof updateProProfileSchema>;
export type UploadVerificationDocument = z.infer<typeof uploadVerificationDocumentSchema>;
export type AddPortfolioItem = z.infer<typeof addPortfolioItemSchema>;
export type UpdatePortfolioItem = z.infer<typeof updatePortfolioItemSchema>;
export type UpdateFeaturedProjects = z.infer<typeof updateFeaturedProjectsSchema>;

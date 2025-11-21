import { z } from 'zod';
import { BUDGET_BRACKETS, URGENCY_LEVELS, EMIRATES } from '@homezy/shared';

/**
 * Enums for lead validation
 */
const budgetBracketIds = BUDGET_BRACKETS.map(b => b.id);
const urgencyLevelIds = URGENCY_LEVELS.map(u => u.id);
const emirateIds = EMIRATES.map(e => e.id);

export const budgetBracketEnum = z.enum(budgetBracketIds as [string, ...string[]]);
export const urgencyEnum = z.enum(urgencyLevelIds as [string, ...string[]]);
export const emirateEnum = z.enum(emirateIds as [string, ...string[]]);
// Category validation is done against database in controller
export const categorySchema = z.string().min(1, 'Category is required');
export const leadStatusEnum = z.enum(['open', 'full', 'quoted', 'accepted', 'expired', 'cancelled']);

/**
 * Location schema
 */
const locationSchema = z.object({
  emirate: emirateEnum,
  neighborhood: z.string().optional(),
  fullAddress: z.string().optional(),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
});

/**
 * Attachment schema
 */
const attachmentSchema = z.object({
  id: z.string(),
  type: z.enum(['image', 'document']),
  url: z.string().url('Attachment URL must be valid'),
  thumbnail: z.string().url().optional(),
  filename: z.string().min(1, 'Filename is required'),
  size: z.number().positive('File size must be positive'),
  uploadedAt: z.date().optional(),
});

/**
 * Lead preferences schema
 */
const leadPreferencesSchema = z.object({
  requiredVerification: z.enum(['any', 'basic', 'comprehensive']).default('any'),
  minRating: z.number().min(1).max(5).optional(),
  maxResponseTime: z.number().positive().optional(), // in hours
  preferredStartDate: z.string().datetime().optional().or(z.date().optional()),
  additionalRequirements: z.string().max(1000).optional(),
});

/**
 * Service answers schema (from JSON questionnaire)
 */
const serviceAnswersSchema = z.object({
  serviceId: z.string(),
  answers: z.record(z.union([
    z.string(),
    z.array(z.string()),
    z.number()
  ])),
  answeredAt: z.string().datetime().or(z.date()),
  updatedAt: z.string().datetime().optional().or(z.date().optional()),
});

/**
 * Create lead schema
 */
export const createLeadSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be at most 100 characters')
    .trim(),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  category: categorySchema,
  location: locationSchema,
  budgetBracket: budgetBracketEnum,
  urgency: urgencyEnum,
  timeline: z.string().max(500).optional(),
  photos: z.array(z.string().url()).max(10, 'Maximum 10 photos allowed').optional(),
  attachments: z.array(attachmentSchema).max(10, 'Maximum 10 attachments allowed').default([]),
  serviceAnswers: serviceAnswersSchema.optional(),
  preferences: leadPreferencesSchema.default({}),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

/**
 * Update lead schema
 */
export const updateLeadSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be at most 100 characters')
    .trim()
    .optional(),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
  category: categorySchema.optional(),
  location: locationSchema.optional(),
  budgetBracket: budgetBracketEnum.optional(),
  urgency: urgencyEnum.optional(),
  timeline: z.string().max(500).optional(),
  attachments: z.array(attachmentSchema).max(10, 'Maximum 10 attachments allowed').optional(),
  preferences: leadPreferencesSchema.optional(),
});

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

/**
 * Get leads (marketplace) query schema
 */
export const getLeadsSchema = z.object({
  // Filters
  category: categorySchema.optional(),
  emirate: emirateEnum.optional(),
  budgetBracket: budgetBracketEnum.optional(),
  urgency: urgencyEnum.optional(),
  status: leadStatusEnum.optional(),
  hasSlots: z.string()
    .optional()
    .transform((val) => val === 'true')
    .pipe(z.boolean().optional()), // Filter for leads with available claim slots

  // Search
  search: z.string().max(200).optional(), // Search in title and description

  // Sorting
  sortBy: z.enum(['newest', 'budget-high', 'budget-low', 'urgency', 'ending-soon']).default('newest'),

  // Pagination
  limit: z.string()
    .optional()
    .transform((val) => val ? parseInt(val) : 20)
    .pipe(z.number().min(1).max(100)),
  offset: z.string()
    .optional()
    .transform((val) => val ? parseInt(val) : 0)
    .pipe(z.number().min(0)),
});

export type GetLeadsInput = z.infer<typeof getLeadsSchema>;

/**
 * Claim lead schema
 */
export const claimLeadSchema = z.object({
  // No body needed - professional ID comes from auth, lead ID from params
  // This is just for documentation
});

export type ClaimLeadInput = z.infer<typeof claimLeadSchema>;

/**
 * Get my leads schema (homeowner view)
 */
export const getMyLeadsSchema = z.object({
  status: leadStatusEnum.optional(),
  limit: z.string()
    .optional()
    .transform((val) => val ? parseInt(val) : 20)
    .pipe(z.number().min(1).max(100)),
  offset: z.string()
    .optional()
    .transform((val) => val ? parseInt(val) : 0)
    .pipe(z.number().min(0)),
});

export type GetMyLeadsInput = z.infer<typeof getMyLeadsSchema>;

/**
 * Get my claimed leads schema (professional view)
 */
export const getMyClaimedLeadsSchema = z.object({
  quoteSubmitted: z.string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined)
    .pipe(z.boolean().optional()),
  limit: z.string()
    .optional()
    .transform((val) => val ? parseInt(val) : 20)
    .pipe(z.number().min(1).max(100)),
  offset: z.string()
    .optional()
    .transform((val) => val ? parseInt(val) : 0)
    .pipe(z.number().min(0)),
});

export type GetMyClaimedLeadsInput = z.infer<typeof getMyClaimedLeadsSchema>;

/**
 * Cancel lead schema
 */
export const cancelLeadSchema = z.object({
  reason: z.string()
    .min(10, 'Please provide a reason (at least 10 characters)')
    .max(500, 'Reason must be at most 500 characters'),
});

export type CancelLeadInput = z.infer<typeof cancelLeadSchema>;

/**
 * Create direct lead schema
 * Same as createLeadSchema but requires professionalId
 */
export const createDirectLeadSchema = z.object({
  professionalId: z.string().min(1, 'Professional ID is required'),
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be at most 100 characters')
    .trim(),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  category: categorySchema,
  location: locationSchema,
  budgetBracket: budgetBracketEnum,
  urgency: urgencyEnum,
  timeline: z.string().max(500).optional(),
  photos: z.array(z.string().url()).max(10, 'Maximum 10 photos allowed').optional(),
  attachments: z.array(attachmentSchema).max(10, 'Maximum 10 attachments allowed').default([]),
  serviceAnswers: serviceAnswersSchema.optional(),
  preferences: leadPreferencesSchema.default({}),
});

export type CreateDirectLeadInput = z.infer<typeof createDirectLeadSchema>;

/**
 * Get my direct leads schema (professional view)
 */
export const getMyDirectLeadsSchema = z.object({
  status: z.enum(['pending', 'accepted', 'declined', 'converted']).optional(),
});

export type GetMyDirectLeadsInput = z.infer<typeof getMyDirectLeadsSchema>;

/**
 * Decline direct lead schema
 */
export const declineDirectLeadSchema = z.object({
  reason: z.string()
    .max(500, 'Reason must be at most 500 characters')
    .optional(),
});

export type DeclineDirectLeadInput = z.infer<typeof declineDirectLeadSchema>;

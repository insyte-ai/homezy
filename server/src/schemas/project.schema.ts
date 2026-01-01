import { z } from 'zod';
import { ROOM_CATEGORIES, PHOTO_TYPES, ADMIN_PHOTO_STATUSES } from '@homezy/shared';

/**
 * Pro Project Validation Schemas
 * Used for managing pro portfolio projects and photos
 */

// ============================================================================
// Photo Schemas
// ============================================================================

export const projectPhotoSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  thumbnailUrl: z.string().url().optional(),
  photoType: z.enum(PHOTO_TYPES).default('main'),
  caption: z.string().max(500, 'Caption must be 500 characters or less').optional(),
  roomCategories: z
    .array(z.enum(ROOM_CATEGORIES))
    .min(1, 'At least one room category is required')
    .max(5, 'Maximum 5 room categories allowed'),
  isPublishedToIdeas: z.boolean().default(true),
});

export const addProjectPhotosSchema = z.object({
  photos: z
    .array(projectPhotoSchema)
    .min(1, 'At least one photo is required')
    .max(20, 'Maximum 20 photos can be added at once'),
});

export const updateProjectPhotoSchema = z.object({
  photoType: z.enum(PHOTO_TYPES).optional(),
  caption: z.string().max(500).optional(),
  roomCategories: z
    .array(z.enum(ROOM_CATEGORIES))
    .min(1)
    .max(5)
    .optional(),
  displayOrder: z.number().min(0).optional(),
  isPublishedToIdeas: z.boolean().optional(),
});

// ============================================================================
// Project Schemas
// ============================================================================

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'Project name must be at least 3 characters')
    .max(200, 'Project name must be 200 characters or less'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be 2000 characters or less'),
  serviceCategory: z.string().min(1, 'Service category is required'),
  completionDate: z.coerce.date(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  serviceCategory: z.string().min(1).optional(),
  completionDate: z.coerce.date().optional(),
});

// ============================================================================
// Query Schemas
// ============================================================================

export const listProjectsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
  serviceCategory: z.string().optional(),
});

// ============================================================================
// Admin Schemas
// ============================================================================

export const adminUpdatePhotoStatusSchema = z.object({
  adminStatus: z.enum(ADMIN_PHOTO_STATUSES),
  removalReason: z.string().max(500).optional(),
});

export const adminListPhotosQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
  professionalId: z.string().optional(),
  roomCategory: z.enum(ROOM_CATEGORIES).optional(),
  adminStatus: z.enum(ADMIN_PHOTO_STATUSES).optional(),
  publishedToIdeas: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : undefined,
    z.boolean().optional()
  ),
  sort: z.enum(['newest', 'popular', 'mostSaved']).default('newest'),
});

// ============================================================================
// Type Exports
// ============================================================================

export type ProjectPhotoInput = z.infer<typeof projectPhotoSchema>;
export type AddProjectPhotosInput = z.infer<typeof addProjectPhotosSchema>;
export type UpdateProjectPhotoInput = z.infer<typeof updateProjectPhotoSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
export type AdminUpdatePhotoStatus = z.infer<typeof adminUpdatePhotoStatusSchema>;
export type AdminListPhotosQuery = z.infer<typeof adminListPhotosQuerySchema>;

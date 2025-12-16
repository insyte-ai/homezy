// @ts-nocheck - Temporary: disable type checking for initial implementation
import { z } from 'zod';
import {
  createResourceSchemaBase as sharedCreateResourceSchemaBase,
  updateResourceSchema as sharedUpdateResourceSchema,
  RESOURCE_TYPES,
} from '@homezy/shared';

// ============================================================================
// Body Schemas
// ============================================================================

// For creating - project ID comes from params, not body
export const createProjectResourceSchema = sharedCreateResourceSchemaBase.omit({ homeProjectId: true });
export const updateProjectResourceSchema = sharedUpdateResourceSchema;

export const moveResourceBodySchema = z.object({
  targetProjectId: z.string().min(1, 'Target project ID is required'),
});

export const copyResourceBodySchema = z.object({
  targetProjectId: z.string().min(1, 'Target project ID is required'),
});

// ============================================================================
// Param Schemas
// ============================================================================

export const projectIdParamSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
});

export const resourceIdParamSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  resourceId: z.string().min(1, 'Resource ID is required'),
});

// Aliases for backward compatibility
export const getProjectResourceByIdSchema = resourceIdParamSchema;
export const deleteProjectResourceSchema = resourceIdParamSchema;
export const toggleFavoriteSchema = resourceIdParamSchema;
export const moveResourceSchema = resourceIdParamSchema;
export const copyResourceSchema = resourceIdParamSchema;

// ============================================================================
// Query Schemas
// ============================================================================

export const listProjectResourcesSchema = z.object({
  type: z.enum([...RESOURCE_TYPES] as [string, ...string[]]).optional(),
  isFavorite: z.coerce.boolean().optional(),
  tags: z.string().optional(), // comma-separated
  search: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

// Type exports
export type CreateProjectResourceInput = z.infer<typeof createProjectResourceSchema>;
export type UpdateProjectResourceInput = z.infer<typeof updateProjectResourceSchema>;
export type ListProjectResourcesInput = z.infer<typeof listProjectResourcesSchema>;
export type MoveResourceBodyInput = z.infer<typeof moveResourceBodySchema>;
export type CopyResourceBodyInput = z.infer<typeof copyResourceBodySchema>;

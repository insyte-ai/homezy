// @ts-nocheck - Temporary: disable type checking for initial implementation
import { z } from 'zod';
import {
  createServiceHistorySchema as sharedCreateServiceHistorySchema,
  updateServiceHistorySchema as sharedUpdateServiceHistorySchema,
  HOME_SERVICE_CATEGORIES,
  HOME_SERVICE_TYPES,
} from '@homezy/shared';

// ============================================================================
// Body Schemas
// ============================================================================

export const createServiceHistorySchema = sharedCreateServiceHistorySchema;
export const updateServiceHistorySchema = sharedUpdateServiceHistorySchema;

// ============================================================================
// Param Schemas
// ============================================================================

export const serviceHistoryIdParamSchema = z.object({
  id: z.string().min(1, 'Service history ID is required'),
});

// Aliases for backward compatibility
export const getServiceHistoryByIdSchema = serviceHistoryIdParamSchema;
export const deleteServiceHistorySchema = serviceHistoryIdParamSchema;

// ============================================================================
// Query Schemas
// ============================================================================

export const listServiceHistorySchema = z.object({
  propertyId: z.string().optional(),
  category: z.enum([...HOME_SERVICE_CATEGORIES] as [string, ...string[]]).optional(),
  serviceType: z.enum([...HOME_SERVICE_TYPES] as [string, ...string[]]).optional(),
  providerType: z.enum(['homezy', 'external']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

export const getServiceTimelineSchema = z.object({
  propertyId: z.string().optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export const getServicesByCategorySchema = z.object({
  propertyId: z.string().optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

// Type exports
export type CreateServiceHistoryInput = z.infer<typeof createServiceHistorySchema>;
export type UpdateServiceHistoryInput = z.infer<typeof updateServiceHistorySchema>;
export type ListServiceHistoryInput = z.infer<typeof listServiceHistorySchema>;
export type GetServiceTimelineInput = z.infer<typeof getServiceTimelineSchema>;
export type GetServicesByCategoryInput = z.infer<typeof getServicesByCategorySchema>;

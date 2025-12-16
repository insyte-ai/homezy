// @ts-nocheck - Temporary: disable type checking for initial implementation
import { z } from 'zod';
import {
  createPropertySchema as sharedCreatePropertySchema,
  updatePropertySchema as sharedUpdatePropertySchema,
  roomSchema as sharedRoomSchema,
  updateRoomSchema as sharedUpdateRoomSchema,
} from '@homezy/shared';

/**
 * Schema for creating a property
 */
export const createPropertySchema = sharedCreatePropertySchema;

/**
 * Schema for updating a property
 */
export const updatePropertySchema = sharedUpdatePropertySchema;

/**
 * Schema for property ID param
 */
export const propertyIdParamSchema = z.object({
  id: z.string().min(1, 'Property ID is required'),
});

/**
 * Aliases for backward compatibility
 */
export const getPropertyByIdSchema = propertyIdParamSchema;
export const deletePropertySchema = propertyIdParamSchema;
export const setPrimaryPropertySchema = propertyIdParamSchema;

/**
 * Schema for listing properties query
 */
export const listPropertiesSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

/**
 * Schema for adding a room (body only - params validated separately)
 */
export const addRoomSchema = sharedRoomSchema;

/**
 * Schema for updating a room (body only - params validated separately)
 */
export const updateRoomSchema = sharedUpdateRoomSchema;

/**
 * Schema for room ID params
 */
export const roomIdParamSchema = z.object({
  id: z.string().min(1, 'Property ID is required'),
  roomId: z.string().min(1, 'Room ID is required'),
});

/**
 * Alias for delete room params
 */
export const deleteRoomSchema = roomIdParamSchema;

// Type exports
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type GetPropertyByIdInput = z.infer<typeof getPropertyByIdSchema>;
export type ListPropertiesInput = z.infer<typeof listPropertiesSchema>;
export type AddRoomInput = z.infer<typeof addRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type DeleteRoomInput = z.infer<typeof deleteRoomSchema>;

// @ts-nocheck - Temporary: disable type checking for initial implementation
import { z } from 'zod';
import {
  createServiceReminderSchema as sharedCreateReminderSchema,
  updateServiceReminderSchema as sharedUpdateReminderSchema,
  HOME_SERVICE_CATEGORIES,
} from '@homezy/shared';

// ============================================================================
// Body Schemas
// ============================================================================

export const createServiceReminderSchema = sharedCreateReminderSchema;
export const updateServiceReminderSchema = sharedUpdateReminderSchema;

export const snoozeReminderBodySchema = z.object({
  days: z.number().int().positive().max(90),
});

export const completeReminderBodySchema = z.object({
  serviceDate: z.coerce.date().optional(),
});

export const convertToQuoteBodySchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
});

// ============================================================================
// Param Schemas
// ============================================================================

export const reminderIdParamSchema = z.object({
  id: z.string().min(1, 'Reminder ID is required'),
});

// Aliases for backward compatibility
export const getServiceReminderByIdSchema = reminderIdParamSchema;
export const deleteServiceReminderSchema = reminderIdParamSchema;
export const snoozeReminderSchema = reminderIdParamSchema;
export const pauseReminderSchema = reminderIdParamSchema;
export const completeReminderSchema = reminderIdParamSchema;
export const convertToQuoteSchema = reminderIdParamSchema;

// ============================================================================
// Query Schemas
// ============================================================================

export const listServiceRemindersSchema = z.object({
  propertyId: z.string().optional(),
  category: z.enum([...HOME_SERVICE_CATEGORIES] as [string, ...string[]]).optional(),
  status: z.enum(['active', 'snoozed', 'paused', 'converted-to-quote']).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

export const getUpcomingRemindersSchema = z.object({
  propertyId: z.string().optional(),
  daysAhead: z.coerce.number().int().positive().max(365).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// Type exports
export type CreateServiceReminderInput = z.infer<typeof createServiceReminderSchema>;
export type UpdateServiceReminderInput = z.infer<typeof updateServiceReminderSchema>;
export type ListServiceRemindersInput = z.infer<typeof listServiceRemindersSchema>;
export type GetUpcomingRemindersInput = z.infer<typeof getUpcomingRemindersSchema>;
export type SnoozeReminderInput = z.infer<typeof snoozeReminderBodySchema>;
export type CompleteReminderInput = z.infer<typeof completeReminderBodySchema>;
export type ConvertToQuoteInput = z.infer<typeof convertToQuoteBodySchema>;

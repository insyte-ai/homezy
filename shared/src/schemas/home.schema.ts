import { z } from 'zod';
import {
  OWNERSHIP_TYPES,
  PROPERTY_TYPES,
  ROOM_TYPES,
  HOME_SERVICE_CATEGORIES,
  HOME_SERVICE_TYPES,
  PROVIDER_TYPES,
  REMINDER_TRIGGER_TYPES,
  REMINDER_FREQUENCIES,
  REMINDER_STATUSES,
  EXPENSE_CATEGORIES,
} from '../types/home.types';

/**
 * Validation schemas for Home Management operations
 * Property, ServiceHistory, ServiceReminder, Expense
 */

// ============================================================================
// Property Schemas
// ============================================================================

export const roomSchema = z.object({
  id: z.string().optional(), // Generated on server if not provided
  name: z.string().min(1, 'Room name is required').max(100),
  type: z.enum(ROOM_TYPES),
  floor: z.number().int().min(-5).max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const createPropertySchema = z.object({
  name: z.string().min(1, 'Property name is required').max(100),
  emirate: z.string().min(1, 'Emirate is required'),
  neighborhood: z.string().max(100).optional(),
  fullAddress: z.string().max(500).optional(),
  ownershipType: z.enum(OWNERSHIP_TYPES),
  propertyType: z.enum(PROPERTY_TYPES),
  bedrooms: z.number().int().min(0).max(50).optional(),
  bathrooms: z.number().int().min(0).max(50).optional(),
  sizeSqFt: z.number().positive().max(1000000).optional(),
  yearBuilt: z.number().int().min(1900).max(new Date().getFullYear() + 5).optional(),
  rooms: z.array(roomSchema).optional().default([]),
  isPrimary: z.boolean().optional().default(false),
});

export const updatePropertySchema = createPropertySchema.partial();

export const addRoomSchema = roomSchema;

export const updateRoomSchema = roomSchema.partial().extend({
  id: z.string().optional(),
});

// ============================================================================
// Service History Schemas
// ============================================================================

export const serviceDocumentSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['invoice', 'receipt', 'report', 'warranty', 'other']),
  url: z.string().url('Invalid document URL'),
  filename: z.string().min(1).max(255),
  uploadedAt: z.coerce.date().optional(),
});

export const createServiceHistorySchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  homeProjectId: z.string().optional(),
  projectId: z.string().optional(), // Homezy marketplace project
  quoteId: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(HOME_SERVICE_CATEGORIES),
  serviceType: z.enum(HOME_SERVICE_TYPES),
  providerType: z.enum(PROVIDER_TYPES),
  providerName: z.string().max(200).optional(),
  professionalId: z.string().optional(),
  cost: z.number().nonnegative().optional(),
  completedAt: z.coerce.date(),
  documents: z.array(serviceDocumentSchema).optional().default([]),
  photos: z.array(z.string().url()).optional().default([]),
  rating: z.number().min(1).max(5).optional(),
});

export const updateServiceHistorySchema = createServiceHistorySchema.partial().omit({
  propertyId: true, // Can't change property
});

// ============================================================================
// Service Reminder Schemas
// ============================================================================

export const createServiceReminderSchema = z.object({
  propertyId: z.string().optional(), // Can be global or per-property
  category: z.enum(HOME_SERVICE_CATEGORIES),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  triggerType: z.enum(REMINDER_TRIGGER_TYPES),
  frequency: z.enum(REMINDER_FREQUENCIES),
  customIntervalDays: z.number().int().positive().max(3650).optional(), // Max 10 years
  lastServiceDate: z.coerce.date().optional(),
  nextDueDate: z.coerce.date(),
  reminderLeadDays: z.array(z.number().int().positive().max(365)).optional().default([30, 7, 1]),
});

export const updateServiceReminderSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  frequency: z.enum(REMINDER_FREQUENCIES).optional(),
  customIntervalDays: z.number().int().positive().max(3650).optional(),
  nextDueDate: z.coerce.date().optional(),
  reminderLeadDays: z.array(z.number().int().positive().max(365)).optional(),
});

export const snoozeReminderSchema = z.object({
  snoozeUntil: z.coerce.date(),
});

export const convertReminderToQuoteSchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
});

// ============================================================================
// Expense Schemas
// ============================================================================

export const expenseDocumentSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['receipt', 'invoice', 'contract', 'other']),
  url: z.string().url('Invalid document URL'),
  filename: z.string().min(1).max(255),
  uploadedAt: z.coerce.date().optional(),
});

export const createExpenseSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  projectId: z.string().optional(), // Linked Homezy marketplace project
  homeProjectId: z.string().optional(), // Linked HomeProject
  serviceHistoryId: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.number().positive('Amount must be positive'),
  date: z.coerce.date(),
  vendorType: z.enum(PROVIDER_TYPES),
  vendorName: z.string().max(200).optional(),
  professionalId: z.string().optional(),
  receiptUrl: z.string().url().optional(),
  documents: z.array(expenseDocumentSchema).optional().default([]),
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
});

export const updateExpenseSchema = createExpenseSchema.partial().omit({
  propertyId: true, // Can't change property
});

// ============================================================================
// Query Schemas
// ============================================================================

export const serviceHistoryQuerySchema = z.object({
  propertyId: z.string().optional(),
  category: z.enum(HOME_SERVICE_CATEGORIES).optional(),
  serviceType: z.enum(HOME_SERVICE_TYPES).optional(),
  providerType: z.enum(PROVIDER_TYPES).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

export const expenseQuerySchema = z.object({
  propertyId: z.string().optional(),
  category: z.enum(EXPENSE_CATEGORIES).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minAmount: z.coerce.number().nonnegative().optional(),
  maxAmount: z.coerce.number().nonnegative().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

export const reminderQuerySchema = z.object({
  propertyId: z.string().optional(),
  category: z.enum(HOME_SERVICE_CATEGORIES).optional(),
  status: z.enum(REMINDER_STATUSES).optional(),
  dueBefore: z.coerce.date().optional(),
  dueAfter: z.coerce.date().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

// ============================================================================
// Type Exports
// ============================================================================

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type RoomInput = z.infer<typeof roomSchema>;

export type CreateServiceHistoryInput = z.infer<typeof createServiceHistorySchema>;
export type UpdateServiceHistoryInput = z.infer<typeof updateServiceHistorySchema>;
export type ServiceDocumentInput = z.infer<typeof serviceDocumentSchema>;

export type CreateServiceReminderInput = z.infer<typeof createServiceReminderSchema>;
export type UpdateServiceReminderInput = z.infer<typeof updateServiceReminderSchema>;
export type SnoozeReminderInput = z.infer<typeof snoozeReminderSchema>;

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseDocumentInput = z.infer<typeof expenseDocumentSchema>;

export type ServiceHistoryQueryInput = z.infer<typeof serviceHistoryQuerySchema>;
export type ExpenseQueryInput = z.infer<typeof expenseQuerySchema>;
export type ReminderQueryInput = z.infer<typeof reminderQuerySchema>;

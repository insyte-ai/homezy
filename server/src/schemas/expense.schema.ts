// @ts-nocheck - Temporary: disable type checking for initial implementation
import { z } from 'zod';
import {
  createExpenseSchema as sharedCreateExpenseSchema,
  updateExpenseSchema as sharedUpdateExpenseSchema,
  EXPENSE_CATEGORIES,
} from '@homezy/shared';

/**
 * Schema for creating an expense
 */
export const createExpenseSchema = sharedCreateExpenseSchema;

/**
 * Schema for updating an expense
 */
export const updateExpenseSchema = sharedUpdateExpenseSchema;

/**
 * Schema for expense ID param
 */
export const expenseIdParamSchema = z.object({
  id: z.string().min(1, 'Expense ID is required'),
});

// Aliases for backward compatibility
export const getExpenseByIdSchema = expenseIdParamSchema;
export const deleteExpenseSchema = expenseIdParamSchema;

/**
 * Schema for listing expenses query
 */
export const listExpensesSchema = z.object({
  propertyId: z.string().optional(),
  projectId: z.string().optional(),
  category: z.enum([...EXPENSE_CATEGORIES] as [string, ...string[]]).optional(),
  vendorType: z.enum(['homezy', 'external']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minAmount: z.coerce.number().nonnegative().optional(),
  maxAmount: z.coerce.number().nonnegative().optional(),
  tags: z.string().optional(), // comma-separated
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

/**
 * Schema for getting expense summary query
 */
export const getExpenseSummarySchema = z.object({
  propertyId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

/**
 * Schema for getting expenses by category query
 */
export const getExpensesByCategorySchema = z.object({
  propertyId: z.string().optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

/**
 * Schema for getting expenses by month query
 */
export const getExpensesByMonthSchema = z.object({
  propertyId: z.string().optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

/**
 * Schema for getting expense trends query
 */
export const getExpenseTrendsSchema = z.object({
  propertyId: z.string().optional(),
  months: z.coerce.number().int().min(1).max(12).optional(),
});

// Type exports
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type GetExpenseByIdInput = z.infer<typeof getExpenseByIdSchema>;
export type ListExpensesInput = z.infer<typeof listExpensesSchema>;
export type GetExpenseSummaryInput = z.infer<typeof getExpenseSummarySchema>;
export type GetExpensesByCategoryInput = z.infer<typeof getExpensesByCategorySchema>;
export type GetExpensesByMonthInput = z.infer<typeof getExpensesByMonthSchema>;
export type GetExpenseTrendsInput = z.infer<typeof getExpenseTrendsSchema>;

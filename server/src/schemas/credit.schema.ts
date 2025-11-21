import { z } from 'zod';

/**
 * Package IDs for credit purchases
 */
export const packageIdEnum = z.enum(['starter', 'professional', 'business', 'enterprise']);

/**
 * Create checkout session schema
 */
export const createCheckoutSessionSchema = z.object({
  packageId: packageIdEnum,
  successUrl: z.string().url('Success URL must be a valid URL'),
  cancelUrl: z.string().url('Cancel URL must be a valid URL'),
});

export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;

/**
 * Get transactions schema (query params)
 */
export const getTransactionsSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined))
    .refine((val) => !val || (val > 0 && val <= 100), 'Limit must be between 1 and 100'),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined))
    .refine((val) => !val || val >= 0, 'Offset must be non-negative'),
  type: z.enum(['purchase', 'spend', 'refund', 'bonus']).optional(),
});

export type GetTransactionsInput = z.infer<typeof getTransactionsSchema>;

/**
 * Stripe webhook schema
 */
export const stripeWebhookSchema = z.object({
  // Webhook payload will be validated by Stripe library
  // This is just for documentation
});

export type StripeWebhookInput = z.infer<typeof stripeWebhookSchema>;

/**
 * Calculate credit cost schema (for testing/preview)
 */
export const calculateCreditCostSchema = z.object({
  budgetBracket: z.enum(['under-5k', '5k-20k', '20k-50k', '50k-100k', 'over-100k']),
  urgency: z.enum(['flexible', 'within-month', 'within-week', 'emergency']),
  verificationStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
});

export type CalculateCreditCostInput = z.infer<typeof calculateCreditCostSchema>;

/**
 * Admin: Add credits manually schema
 */
export const addCreditsManuallySchema = z.object({
  professionalId: z.string().min(1, 'Professional ID is required'),
  amount: z.number().int().positive('Amount must be a positive integer'),
  creditType: z.enum(['free', 'paid']),
  description: z.string().min(1, 'Description is required').max(200),
  expiresInMonths: z.number().int().positive().optional(), // Optional expiry in months
});

export type AddCreditsManuallyInput = z.infer<typeof addCreditsManuallySchema>;

/**
 * Admin: Refund credits schema
 */
export const refundCreditsSchema = z.object({
  professionalId: z.string().min(1, 'Professional ID is required'),
  amount: z.number().int().positive('Amount must be a positive integer'),
  reason: z.string().min(1, 'Reason is required').max(500),
  metadata: z
    .object({
      leadId: z.string().optional(),
      originalTransactionId: z.string().optional(),
    })
    .optional(),
});

export type RefundCreditsInput = z.infer<typeof refundCreditsSchema>;

export default {
  createCheckoutSessionSchema,
  getTransactionsSchema,
  stripeWebhookSchema,
  calculateCreditCostSchema,
  addCreditsManuallySchema,
  refundCreditsSchema,
};

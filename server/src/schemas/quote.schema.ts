import { z } from 'zod';

/**
 * Quote item schema
 */
const quoteItemSchema = z.object({
  id: z.string().optional(), // Optional - will be generated if not provided
  description: z.string()
    .min(3, 'Item description must be at least 3 characters')
    .max(200, 'Item description must be at most 200 characters'),
  category: z.enum(['labor', 'materials', 'permits', 'equipment', 'other']),
  quantity: z.number()
    .min(0, 'Quantity cannot be negative')
    .finite('Quantity must be a finite number'),
  unitPrice: z.number()
    .min(0, 'Unit price cannot be negative')
    .finite('Unit price must be a finite number'),
  total: z.number()
    .min(0, 'Total cannot be negative')
    .finite('Total must be a finite number'),
  notes: z.string().max(500).optional(),
});

/**
 * Attachment schema (same as lead)
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
 * Submit quote schema
 */
export const submitQuoteSchema = z.object({
  // Timeline
  estimatedStartDate: z.string().datetime()
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val),
  estimatedCompletionDate: z.string().datetime()
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val),
  estimatedDurationDays: z.number()
    .int('Duration must be a whole number of days')
    .min(1, 'Duration must be at least 1 day')
    .max(365, 'Duration cannot exceed 365 days'),

  // Budget
  items: z.array(quoteItemSchema)
    .min(1, 'Quote must have at least one item')
    .max(50, 'Quote cannot have more than 50 items'),
  subtotal: z.number()
    .min(0, 'Subtotal cannot be negative')
    .finite('Subtotal must be a finite number'),
  vat: z.number()
    .min(0, 'VAT cannot be negative')
    .finite('VAT must be a finite number'),
  total: z.number()
    .min(0, 'Total cannot be negative')
    .finite('Total must be a finite number'),

  // Details
  approach: z.string()
    .min(50, 'Approach description must be at least 50 characters')
    .max(3000, 'Approach description must be at most 3000 characters'),
  warranty: z.string().max(500).optional(),
  attachments: z.array(attachmentSchema).max(10, 'Maximum 10 attachments allowed').default([]),
  questions: z.string().max(1000).optional(),
}).refine(
  (data) => {
    // Validate that estimatedCompletionDate is after estimatedStartDate
    return data.estimatedCompletionDate > data.estimatedStartDate;
  },
  {
    message: 'Completion date must be after start date',
    path: ['estimatedCompletionDate'],
  }
).refine(
  (data) => {
    // Validate that total = subtotal + VAT (with 0.01 tolerance for rounding)
    const expectedTotal = data.subtotal + data.vat;
    return Math.abs(data.total - expectedTotal) < 0.01;
  },
  {
    message: 'Total must equal subtotal + VAT',
    path: ['total'],
  }
).refine(
  (data) => {
    // Validate that subtotal matches sum of all item totals
    const itemsTotal = data.items.reduce((sum, item) => sum + item.total, 0);
    return Math.abs(data.subtotal - itemsTotal) < 0.01;
  },
  {
    message: 'Subtotal must equal sum of all item totals',
    path: ['subtotal'],
  }
);

export type SubmitQuoteInput = z.infer<typeof submitQuoteSchema>;

/**
 * Update quote schema (before submission)
 * Cannot use .partial() on schema with refinements, so we define it separately
 */
export const updateQuoteSchema = z.object({
  // Timeline
  estimatedStartDate: z.string().datetime()
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val)
    .optional(),
  estimatedCompletionDate: z.string().datetime()
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val)
    .optional(),
  estimatedDurationDays: z.number()
    .int('Duration must be a whole number of days')
    .min(1, 'Duration must be at least 1 day')
    .max(365, 'Duration cannot exceed 365 days')
    .optional(),

  // Budget
  items: z.array(quoteItemSchema)
    .min(1, 'Quote must have at least one item')
    .max(50, 'Quote cannot have more than 50 items')
    .optional(),
  subtotal: z.number()
    .min(0, 'Subtotal cannot be negative')
    .finite('Subtotal must be a finite number')
    .optional(),
  vat: z.number()
    .min(0, 'VAT cannot be negative')
    .finite('VAT must be a finite number')
    .optional(),
  total: z.number()
    .min(0, 'Total cannot be negative')
    .finite('Total must be a finite number')
    .optional(),

  // Details
  approach: z.string()
    .min(50, 'Approach description must be at least 50 characters')
    .max(3000, 'Approach description must be at most 3000 characters')
    .optional(),
  warranty: z.string().max(500).optional(),
  attachments: z.array(attachmentSchema).max(10, 'Maximum 10 attachments allowed').optional(),
  questions: z.string().max(1000).optional(),
});

export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;

/**
 * Accept quote schema
 */
export const acceptQuoteSchema = z.object({
  // Optionally homeowner can add notes when accepting
  notes: z.string().max(500).optional(),
});

export type AcceptQuoteInput = z.infer<typeof acceptQuoteSchema>;

/**
 * Decline quote schema
 */
export const declineQuoteSchema = z.object({
  reason: z.string()
    .min(10, 'Please provide a reason (at least 10 characters)')
    .max(500, 'Reason must be at most 500 characters')
    .optional(),
});

export type DeclineQuoteInput = z.infer<typeof declineQuoteSchema>;

/**
 * Get quotes for a lead schema (query params)
 */
export const getQuotesForLeadSchema = z.object({
  status: z.enum(['pending', 'accepted', 'declined']).optional(),
  sortBy: z.enum(['newest', 'price-low', 'price-high', 'rating']).default('newest'),
});

export type GetQuotesForLeadInput = z.infer<typeof getQuotesForLeadSchema>;

/**
 * Get my quotes schema (professional view)
 */
export const getMyQuotesSchema = z.object({
  status: z.enum(['pending', 'accepted', 'declined']).optional(),
  limit: z.string()
    .optional()
    .transform((val) => val ? parseInt(val) : 20)
    .pipe(z.number().min(1).max(100)),
  offset: z.string()
    .optional()
    .transform((val) => val ? parseInt(val) : 0)
    .pipe(z.number().min(0)),
});

export type GetMyQuotesInput = z.infer<typeof getMyQuotesSchema>;

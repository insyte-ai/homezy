import { z } from 'zod';

/**
 * Shared validation schemas for chat operations
 */

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  content: z.string().min(1, 'Message content is required').max(2000, 'Message too long (max 2000 characters)'),
});

export const createConversationSchema = z.object({
  title: z.string().optional(),
});

export const budgetEstimateInputSchema = z.object({
  projectType: z.enum([
    'kitchen_remodel',
    'bathroom_remodel',
    'painting',
    'flooring',
    'hvac',
    'plumbing',
    'electrical',
    'roofing',
    'landscaping',
    'general_renovation',
    'carpentry',
    'tiling',
    'waterproofing',
  ]),
  scopeDescription: z.string().min(10, 'Please provide more details about your project (minimum 10 characters)'),
  materialsQuality: z.enum(['economy', 'standard', 'premium']),
  emirate: z
    .enum(['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah', 'UAQ'])
    .optional(),
  projectSize: z.enum(['small', 'medium', 'large']).optional(),
});

export const timelineEstimateInputSchema = z.object({
  projectType: z.string().min(1, 'Project type is required'),
  scopeDescription: z.string().min(10, 'Please provide more details about your project'),
  urgency: z.enum(['emergency', 'urgent', 'normal', 'flexible']).optional(),
  seasonalConsiderations: z.boolean().optional(),
  requiresPermits: z.boolean().optional(),
});

export const knowledgeSearchSchema = z.object({
  query: z.string().min(3, 'Search query must be at least 3 characters'),
  category: z.enum(['regulations', 'best_practices', 'materials', 'maintenance', 'general']).optional(),
});

// Type exports
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type BudgetEstimateInput = z.infer<typeof budgetEstimateInputSchema>;
export type TimelineEstimateInput = z.infer<typeof timelineEstimateInputSchema>;
export type KnowledgeSearchInput = z.infer<typeof knowledgeSearchSchema>;

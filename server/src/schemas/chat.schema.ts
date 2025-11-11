import { z } from 'zod';

/**
 * Validation schemas for chat operations
 */

export const sendMessageSchema = z.object({
  body: z.object({
    conversationId: z.string().min(1, 'Conversation ID is required'),
    content: z.string().min(1, 'Message content is required').max(2000, 'Message too long (max 2000 characters)'),
  }),
});

export const createConversationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
  }).optional().default({}),
});

export const getConversationSchema = z.object({
  params: z.object({
    conversationId: z.string().min(1, 'Conversation ID is required'),
  }),
});

export const archiveConversationSchema = z.object({
  params: z.object({
    conversationId: z.string().min(1, 'Conversation ID is required'),
  }),
});

// Type exports for TypeScript
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type GetConversationInput = z.infer<typeof getConversationSchema>;
export type ArchiveConversationInput = z.infer<typeof archiveConversationSchema>;

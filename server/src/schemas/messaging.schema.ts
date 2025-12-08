import { z } from 'zod';

/**
 * Validation schemas for user-to-user messaging
 */

/**
 * Schema for sending a message (body)
 */
export const sendUserMessageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
  content: z.string().min(1, 'Message content is required').max(5000, 'Message too long'),
  attachments: z
    .array(
      z.object({
        type: z.enum(['image', 'document', 'pdf']),
        url: z.string().url('Invalid URL'),
        filename: z.string(),
        size: z.number().max(10 * 1024 * 1024, 'File too large (max 10MB)'),
        publicId: z.string().optional(),
      })
    )
    .optional(),
  relatedLead: z.string().optional(),
});

/**
 * Schema for getting conversations (query params)
 */
export const getConversationsSchema = z.object({
  status: z.enum(['active', 'archived', 'all']).optional().default('active'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('20'),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional().default('0'),
});

/**
 * Schema for conversation ID in params
 */
export const conversationIdParamsSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
});

/**
 * Schema for message ID in params
 */
export const messageIdParamsSchema = z.object({
  messageId: z.string().min(1, 'Message ID is required'),
});

/**
 * Schema for getting messages query params
 */
export const getMessagesQuerySchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('50'),
  before: z.string().optional(), // Message ID for pagination
});

/**
 * Schema for editing a message (body)
 */
export const editMessageBodySchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000, 'Message too long'),
});

// Legacy exports for backwards compatibility (if any controllers use the old types)
export const getMessagesSchema = z.object({
  params: conversationIdParamsSchema,
  query: getMessagesQuerySchema,
});

export const markAsReadSchema = z.object({
  params: conversationIdParamsSchema,
});

export const editMessageSchema = z.object({
  params: messageIdParamsSchema,
  body: editMessageBodySchema,
});

export const deleteMessageSchema = z.object({
  params: messageIdParamsSchema,
});

export const archiveConversationSchema = z.object({
  params: conversationIdParamsSchema,
});

/**
 * Schema for getting unread count (no params needed, just validates that request is valid)
 */
export const getUnreadCountSchema = z.object({}).optional();

export type SendUserMessageInput = z.infer<typeof sendUserMessageSchema>;
export type GetConversationsInput = z.infer<typeof getConversationsSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
export type EditMessageInput = z.infer<typeof editMessageSchema>;
export type DeleteMessageInput = z.infer<typeof deleteMessageSchema>;
export type ArchiveConversationInput = z.infer<typeof archiveConversationSchema>;

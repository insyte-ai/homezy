import { z } from 'zod';

/**
 * Validation schemas for user-to-user messaging
 */

/**
 * Schema for sending a message
 */
export const sendUserMessageSchema = z.object({
  body: z.object({
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
  }),
});

/**
 * Schema for getting conversations
 */
export const getConversationsSchema = z.object({
  query: z.object({
    status: z.enum(['active', 'archived', 'all']).optional().default('active'),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('20'),
    offset: z.string().transform(Number).pipe(z.number().min(0)).optional().default('0'),
  }),
});

/**
 * Schema for getting messages in a conversation
 */
export const getMessagesSchema = z.object({
  params: z.object({
    conversationId: z.string().min(1, 'Conversation ID is required'),
  }),
  query: z.object({
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('50'),
    before: z.string().optional(), // Message ID for pagination
  }),
});

/**
 * Schema for marking messages as read
 */
export const markAsReadSchema = z.object({
  params: z.object({
    conversationId: z.string().min(1, 'Conversation ID is required'),
  }),
});

/**
 * Schema for editing a message
 */
export const editMessageSchema = z.object({
  params: z.object({
    messageId: z.string().min(1, 'Message ID is required'),
  }),
  body: z.object({
    content: z.string().min(1, 'Content is required').max(5000, 'Message too long'),
  }),
});

/**
 * Schema for deleting a message
 */
export const deleteMessageSchema = z.object({
  params: z.object({
    messageId: z.string().min(1, 'Message ID is required'),
  }),
});

/**
 * Schema for archiving a conversation
 */
export const archiveConversationSchema = z.object({
  params: z.object({
    conversationId: z.string().min(1, 'Conversation ID is required'),
  }),
});

/**
 * Schema for getting unread count
 */
export const getUnreadCountSchema = z.object({
  query: z.object({}).optional(),
});

export type SendUserMessageInput = z.infer<typeof sendUserMessageSchema>;
export type GetConversationsInput = z.infer<typeof getConversationsSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
export type EditMessageInput = z.infer<typeof editMessageSchema>;
export type DeleteMessageInput = z.infer<typeof deleteMessageSchema>;
export type ArchiveConversationInput = z.infer<typeof archiveConversationSchema>;

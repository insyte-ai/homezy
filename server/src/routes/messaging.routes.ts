import { Router } from 'express';
import * as messagingController from '../controllers/messaging.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler.middleware';
import {
  sendUserMessageSchema,
  getConversationsSchema,
  getMessagesSchema,
  markAsReadSchema,
  editMessageSchema,
  deleteMessageSchema,
  archiveConversationSchema,
} from '../schemas/messaging.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/messages/send
 * @desc    Send a message to another user
 * @access  Private
 */
router.post(
  '/send',
  validate(sendUserMessageSchema),
  asyncHandler(messagingController.sendMessage)
);

/**
 * @route   GET /api/v1/messages/conversations
 * @desc    Get user's conversations
 * @access  Private
 */
router.get(
  '/conversations',
  validate(getConversationsSchema, 'query'),
  asyncHandler(messagingController.getConversations)
);

/**
 * @route   GET /api/v1/messages/conversations/:conversationId/messages
 * @desc    Get messages in a conversation
 * @access  Private
 */
router.get(
  '/conversations/:conversationId/messages',
  validate(getMessagesSchema),
  asyncHandler(messagingController.getMessages)
);

/**
 * @route   PATCH /api/v1/messages/conversations/:conversationId/read
 * @desc    Mark conversation messages as read
 * @access  Private
 */
router.patch(
  '/conversations/:conversationId/read',
  validate(markAsReadSchema),
  asyncHandler(messagingController.markAsRead)
);

/**
 * @route   PATCH /api/v1/messages/:messageId
 * @desc    Edit a message
 * @access  Private
 */
router.patch(
  '/:messageId',
  validate(editMessageSchema),
  asyncHandler(messagingController.editMessage)
);

/**
 * @route   DELETE /api/v1/messages/:messageId
 * @desc    Delete a message
 * @access  Private
 */
router.delete(
  '/:messageId',
  validate(deleteMessageSchema),
  asyncHandler(messagingController.deleteMessage)
);

/**
 * @route   PATCH /api/v1/messages/conversations/:conversationId/archive
 * @desc    Archive a conversation
 * @access  Private
 */
router.patch(
  '/conversations/:conversationId/archive',
  validate(archiveConversationSchema),
  asyncHandler(messagingController.archiveConversation)
);

/**
 * @route   GET /api/v1/messages/unread-count
 * @desc    Get total unread message count
 * @access  Private
 */
router.get(
  '/unread-count',
  asyncHandler(messagingController.getUnreadCount)
);

export default router;

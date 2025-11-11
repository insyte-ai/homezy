import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  sendMessageSchema,
  createConversationSchema,
  getConversationSchema,
  archiveConversationSchema,
} from '../schemas/chat.schema';

const router = Router();
const chatController = new ChatController();

/**
 * Chat Routes
 *
 * These are REST endpoints for conversation management.
 * Actual AI streaming happens via Socket.io (see sockets/chat.socket.ts)
 */

// Public routes (accessible to guests and authenticated users)
router.post(
  '/conversations',
  optionalAuth, // Allows both guests and authenticated users
  validate(createConversationSchema),
  chatController.createConversation
);

router.get(
  '/conversations/:conversationId',
  optionalAuth,
  validate(getConversationSchema),
  chatController.getConversation
);

router.post(
  '/conversations/:conversationId/messages',
  optionalAuth,
  validate(sendMessageSchema),
  chatController.sendMessage
);

// Authenticated routes
router.get('/conversations', authenticate, chatController.getConversations);

router.delete(
  '/conversations/:conversationId',
  authenticate,
  validate(archiveConversationSchema),
  chatController.archiveConversation
);

export default router;

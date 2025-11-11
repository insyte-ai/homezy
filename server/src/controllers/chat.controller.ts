import { Request, Response } from 'express';
import { Conversation } from '../models/Conversation.model';
import { ChatMessage } from '../models/ChatMessage.model';
import { AppError } from '../middleware/errorHandler.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';

/**
 * Chat Controller
 *
 * Handles REST API endpoints for chat/conversation management
 * Actual AI streaming happens via Socket.io (see chat.socket.ts)
 */

export class ChatController {
  /**
   * Create new conversation
   * Accessible to both authenticated users and guests
   */
  createConversation = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    let guestId = req.cookies?.guestId;

    // Generate guest ID if not exists
    if (!userId && !guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Set guest cookie
      res.cookie('guestId', guestId, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    // Find or create conversation
    const conversation = await Conversation.findOrCreate(userId, guestId);

    logger.info('Conversation created/retrieved', {
      conversationId: conversation.conversationId,
      userId,
      guestId,
    });

    res.status(200).json({
      success: true,
      data: conversation,
    });
  });

  /**
   * Get user's conversations (authenticated only)
   */
  getConversations = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const conversations = await Conversation.find({ userId })
      .sort({ 'metadata.lastMessageAt': -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: conversations,
    });
  });

  /**
   * Get single conversation with messages
   * Accessible to owner (authenticated or guest)
   */
  getConversation = asyncHandler(async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const userId = req.user?.id;
    const guestId = req.cookies?.guestId;

    // Find conversation
    const conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'NOT_FOUND');
    }

    // Verify ownership
    const isOwner =
      (userId && conversation.userId?.toString() === userId) ||
      (guestId && conversation.guestId === guestId);

    if (!isOwner) {
      throw new AppError('Access denied to this conversation', 403, 'FORBIDDEN');
    }

    // Get messages
    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(100); // Last 100 messages

    logger.info('Conversation retrieved', {
      conversationId,
      messageCount: messages.length,
    });

    res.status(200).json({
      success: true,
      data: {
        conversation,
        messages,
      },
    });
  });

  /**
   * Send message (REST endpoint - actual streaming happens via Socket.io)
   * This endpoint validates and triggers the Socket.io handler
   */
  sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const { conversationId, content } = req.body;
    const userId = req.user?.id;
    const guestId = req.cookies?.guestId;

    // Validate content
    if (!content || content.trim().length === 0) {
      throw new AppError('Message content is required', 400, 'VALIDATION_ERROR');
    }

    // Find conversation
    const conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'NOT_FOUND');
    }

    // Verify ownership
    const isOwner =
      (userId && conversation.userId?.toString() === userId) ||
      (guestId && conversation.guestId === guestId);

    if (!isOwner) {
      throw new AppError('Access denied to this conversation', 403, 'FORBIDDEN');
    }

    // Check guest limits
    if (!userId && conversation.messageCount >= 5) {
      throw new AppError(
        'Guest message limit reached. Please sign up to continue chatting.',
        403,
        'GUEST_LIMIT_REACHED'
      );
    }

    // Increment message count
    await conversation.incrementMessageCount();

    logger.info('Message send request received', {
      conversationId,
      userId: userId || 'guest',
      messageLength: content.length,
    });

    // Respond immediately - actual processing happens via Socket.io
    res.status(200).json({
      success: true,
      message: 'Message received. Connect via Socket.io to receive AI response.',
      conversationId,
    });
  });

  /**
   * Archive conversation (authenticated only)
   */
  archiveConversation = asyncHandler(async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const conversation = await Conversation.findOne({ conversationId, userId });

    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'NOT_FOUND');
    }

    conversation.status = 'archived';
    await conversation.save();

    logger.info('Conversation archived', { conversationId, userId });

    res.status(200).json({
      success: true,
      message: 'Conversation archived successfully',
    });
  });
}

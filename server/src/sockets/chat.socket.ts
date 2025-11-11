import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { env } from '../config/env';
import { AIService } from '../services/ai/ai.service';
import { Conversation } from '../models/Conversation.model';
import { logger } from '../utils/logger';

/**
 * Chat Socket Handlers
 *
 * Manages real-time chat communication via Socket.io
 * Handles AI streaming responses with function calling
 */

export const setupChatSockets = (io: Server) => {
  const aiService = new AIService();

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    const guestId = socket.handshake.auth.guestId;

    // Try to authenticate with JWT token
    if (token) {
      try {
        const decoded = verify(token, env.JWT_ACCESS_SECRET) as any;
        socket.data.userId = decoded.userId;
        logger.info('Socket authenticated', { socketId: socket.id, userId: decoded.userId });
      } catch (error) {
        logger.warn('Socket auth token invalid, treating as guest', { socketId: socket.id });
        // Don't reject - just treat as guest
      }
    }

    // Store guest ID
    if (guestId) {
      socket.data.guestId = guestId;
      logger.info('Socket connected as guest', { socketId: socket.id, guestId });
    }

    if (!socket.data.userId && !guestId) {
      logger.warn('Socket connected without user ID or guest ID', { socketId: socket.id });
    }

    next();
  });

  // Handle connections
  io.on('connection', (socket: Socket) => {
    logger.info('Client connected to chat', {
      socketId: socket.id,
      userId: socket.data.userId || 'guest',
    });

    /**
     * Join conversation room
     * Allows for future multi-user features
     */
    socket.on('chat:join_conversation', async (data) => {
      try {
        const { conversationId } = data;

        if (!conversationId) {
          socket.emit('chat:error', { error: 'Conversation ID is required' });
          return;
        }

        socket.join(conversationId);
        logger.info(`Socket joined conversation`, {
          socketId: socket.id,
          conversationId,
        });
      } catch (error: any) {
        logger.error('Error joining conversation', { error: error.message });
        socket.emit('chat:error', { error: 'Failed to join conversation' });
      }
    });

    /**
     * Send message - triggers AI streaming response
     * This is the main chat handler
     */
    socket.on('chat:send_message', async (data) => {
      try {
        const { conversationId, content } = data;
        const userId = socket.data.userId;
        const guestId = socket.data.guestId;

        // Validation
        if (!conversationId) {
          socket.emit('chat:error', {
            error: 'Conversation ID is required',
            code: 'VALIDATION_ERROR',
          });
          return;
        }

        if (!content || content.trim().length === 0) {
          socket.emit('chat:error', {
            error: 'Message content is required',
            code: 'VALIDATION_ERROR',
          });
          return;
        }

        if (content.length > 2000) {
          socket.emit('chat:error', {
            error: 'Message too long (max 2000 characters)',
            code: 'VALIDATION_ERROR',
          });
          return;
        }

        // Find conversation
        const conversation = await Conversation.findOne({ conversationId });

        if (!conversation) {
          socket.emit('chat:error', {
            error: 'Conversation not found',
            code: 'NOT_FOUND',
          });
          return;
        }

        // Verify ownership
        const isOwner =
          (userId && conversation.userId?.toString() === userId) ||
          (guestId && conversation.guestId === guestId);

        if (!isOwner) {
          socket.emit('chat:error', {
            error: 'Access denied to this conversation',
            code: 'FORBIDDEN',
          });
          return;
        }

        // Check guest limits
        if (!userId && conversation.messageCount >= 5) {
          socket.emit('chat:error', {
            error: 'Guest message limit reached. Please sign up to continue.',
            code: 'GUEST_LIMIT_REACHED',
          });
          return;
        }

        logger.info('Processing chat message', {
          conversationId,
          userId: userId || 'guest',
          contentLength: content.length,
        });

        // Start AI streaming (this handles everything: tool calls, streaming, saving)
        await aiService.streamChatWithSocket(conversationId, content, userId, socket);

        logger.info('Chat message processing complete', { conversationId });
      } catch (error: any) {
        logger.error('Chat message error', {
          error: error.message,
          stack: error.stack,
        });

        socket.emit('chat:error', {
          error: error.message || 'An error occurred while processing your message',
          code: 'PROCESSING_ERROR',
        });
      }
    });

    /**
     * Leave conversation room
     */
    socket.on('chat:leave_conversation', async (data) => {
      try {
        const { conversationId } = data;

        if (conversationId) {
          socket.leave(conversationId);
          logger.info(`Socket left conversation`, {
            socketId: socket.id,
            conversationId,
          });
        }
      } catch (error: any) {
        logger.error('Error leaving conversation', { error: error.message });
      }
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', (reason) => {
      logger.info('Client disconnected from chat', {
        socketId: socket.id,
        reason,
        userId: socket.data.userId || 'guest',
      });
    });

    /**
     * Handle connection errors
     */
    socket.on('error', (error) => {
      logger.error('Socket error', {
        socketId: socket.id,
        error: error.message,
      });
    });
  });

  logger.info('Chat sockets initialized');
};

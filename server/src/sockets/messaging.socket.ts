import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User.model';
import { logger } from '../utils/logger';
import { isConversationParticipant, getUserRole } from '../utils/messaging.utils';

/**
 * Messaging Socket Handlers
 *
 * Handles real-time messaging features:
 * - Conversation room management (join/leave)
 * - Typing indicators
 * - Presence (online/offline status)
 *
 * Note: Message sending is handled by HTTP API which broadcasts via socket.
 * This keeps message persistence reliable while still enabling real-time delivery.
 */

interface AuthenticatedSocket extends Socket {
  data: {
    userId?: string;
    userRole?: 'homeowner' | 'pro' | 'admin';
  };
}

export const setupMessagingSockets = (io: Server) => {
  const messagingNamespace = io.of('/messaging');

  // Authentication middleware
  messagingNamespace.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      logger.warn('Socket connection attempt without token', { socketId: socket.id });
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verify(token, env.JWT_ACCESS_SECRET) as any;
      socket.data.userId = decoded.userId;

      const user = await User.findById(decoded.userId);
      if (user) {
        socket.data.userRole = user.role as 'homeowner' | 'pro' | 'admin';
      }

      logger.info('Messaging socket authenticated', {
        socketId: socket.id,
        userId: decoded.userId,
        role: socket.data.userRole,
      });
      next();
    } catch (error) {
      logger.error('Socket authentication failed', { error, socketId: socket.id });
      next(new Error('Invalid authentication token'));
    }
  });

  // Connection handler
  messagingNamespace.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.data.userId;
    logger.info('Client connected to messaging', { socketId: socket.id, userId });

    // Join user's personal room for receiving notifications
    socket.join(`user:${userId}`);

    /**
     * Join a conversation room to receive real-time messages
     */
    socket.on('conversation:join', async (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;
        const { conversation, isParticipant } = await isConversationParticipant(conversationId, userId!);

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        if (!isParticipant) {
          socket.emit('error', { message: 'Not a participant in this conversation' });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        socket.emit('conversation:joined', { conversationId });
        logger.info('Socket joined conversation', { socketId: socket.id, conversationId });
      } catch (error: any) {
        logger.error('Error joining conversation', { error: error.message });
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    /**
     * Leave a conversation room
     */
    socket.on('conversation:leave', (data: { conversationId: string }) => {
      const { conversationId } = data;
      socket.leave(`conversation:${conversationId}`);
      logger.debug('Socket left conversation', { socketId: socket.id, conversationId });
    });

    /**
     * Typing indicator - user started typing
     */
    socket.on('typing:start', (data: { conversationId: string; recipientId: string }) => {
      const { conversationId, recipientId } = data;
      messagingNamespace.to(`user:${recipientId}`).emit('typing:user_typing', {
        conversationId,
        userId,
      });
      logger.debug('User started typing', { userId, conversationId });
    });

    /**
     * Typing indicator - user stopped typing
     */
    socket.on('typing:stop', (data: { conversationId: string; recipientId: string }) => {
      const { conversationId, recipientId } = data;
      messagingNamespace.to(`user:${recipientId}`).emit('typing:user_stopped', {
        conversationId,
        userId,
      });
      logger.debug('User stopped typing', { userId, conversationId });
    });

    /**
     * User presence - set online status
     */
    socket.on('presence:online', () => {
      // TODO: Consider scoping this to only conversation participants
      socket.broadcast.emit('presence:user_online', { userId });
      logger.debug('User online', { userId });
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      logger.info('Client disconnected from messaging', { socketId: socket.id, userId });
      socket.broadcast.emit('presence:user_offline', { userId });
    });
  });

  logger.info('Messaging sockets initialized');
};

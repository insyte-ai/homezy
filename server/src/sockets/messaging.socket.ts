import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { env } from '../config/env';
import { UserConversation } from '../models/UserConversation.model';
import { UserMessage } from '../models/UserMessage.model';
import { User } from '../models/User.model';
import { logger } from '../utils/logger';

/**
 * Messaging Socket Handlers
 *
 * Handles real-time user-to-user messaging between homeowners and professionals
 */

interface AuthenticatedSocket extends Socket {
  data: {
    userId?: string;
    userRole?: 'homeowner' | 'pro' | 'admin';
  };
}

export const setupMessagingSockets = (io: Server) => {
  // Create a namespace for messaging
  const messagingNamespace = io.of('/messaging');

  // Middleware to authenticate socket connections
  messagingNamespace.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      logger.warn('Socket connection attempt without token', { socketId: socket.id });
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verify(token, env.JWT_ACCESS_SECRET) as any;
      socket.data.userId = decoded.userId;

      // Get user role
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

  // Handle connections
  messagingNamespace.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.data.userId;
    logger.info('Client connected to messaging', { socketId: socket.id, userId });

    // Join user's personal room for receiving messages
    socket.join(`user:${userId}`);

    /**
     * Join a specific conversation room
     */
    socket.on('conversation:join', async (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;

        // Verify user is a participant
        const conversation = await UserConversation.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        const isParticipant =
          conversation.participants.homeownerId.toString() === userId ||
          conversation.participants.professionalId.toString() === userId;

        if (!isParticipant) {
          socket.emit('error', { message: 'Not a participant in this conversation' });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        logger.info('Socket joined conversation', { socketId: socket.id, conversationId });

        socket.emit('conversation:joined', { conversationId });
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
      logger.info('Socket left conversation', { socketId: socket.id, conversationId });
    });

    /**
     * Send a message (real-time)
     */
    socket.on('message:send', async (data: {
      conversationId: string;
      recipientId: string;
      content: string;
      attachments?: any[];
    }) => {
      try {
        const { conversationId, recipientId, content, attachments } = data;

        // Verify conversation
        const conversation = await UserConversation.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Verify user is a participant
        const isParticipant =
          conversation.participants.homeownerId.toString() === userId ||
          conversation.participants.professionalId.toString() === userId;

        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        // Create message
        const message = await UserMessage.create({
          conversationId,
          senderId: userId,
          recipientId,
          content,
          attachments: attachments || [],
        });

        // Update conversation
        await conversation.updateLastMessage(content, userId!);

        // Get recipient role
        const recipient = await User.findById(recipientId);
        const recipientRole = recipient?.role === 'homeowner' ? 'homeowner' : 'professional';
        await conversation.incrementUnread(recipientRole);

        // Populate message
        const populatedMessage = await UserMessage.findById(message._id)
          .populate('senderId', 'firstName lastName email role profilePhoto businessName')
          .populate('recipientId', 'firstName lastName email role profilePhoto businessName');

        // Emit to conversation room (all participants)
        messagingNamespace
          .to(`conversation:${conversationId}`)
          .emit('message:new', populatedMessage);

        // Emit to recipient's personal room for notification
        messagingNamespace
          .to(`user:${recipientId}`)
          .emit('message:notification', {
            conversationId,
            message: populatedMessage,
          });

        logger.info('Message sent via socket', {
          messageId: message._id,
          conversationId,
          senderId: userId,
        });
      } catch (error: any) {
        logger.error('Error sending message', { error: error.message });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Typing indicator - user started typing
     */
    socket.on('typing:start', (data: { conversationId: string; recipientId: string }) => {
      const { conversationId, recipientId } = data;

      // Emit to recipient only
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

      // Emit to recipient only
      messagingNamespace.to(`user:${recipientId}`).emit('typing:user_stopped', {
        conversationId,
        userId,
      });

      logger.debug('User stopped typing', { userId, conversationId });
    });

    /**
     * Mark messages as read (real-time)
     */
    socket.on('messages:mark_read', async (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;

        // Verify conversation
        const conversation = await UserConversation.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        const isParticipant =
          conversation.participants.homeownerId.toString() === userId ||
          conversation.participants.professionalId.toString() === userId;

        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        // Mark messages as read
        await UserMessage.updateMany(
          {
            conversationId,
            recipientId: userId,
            isRead: false,
          },
          {
            $set: {
              isRead: true,
              readAt: new Date(),
            },
          }
        );

        // Update conversation unread count
        const user = await User.findById(userId);
        const userRole = user?.role === 'homeowner' ? 'homeowner' : 'professional';
        await conversation.markAsRead(userRole);

        // Get the other participant ID
        const otherParticipantId =
          conversation.participants.homeownerId.toString() === userId
            ? conversation.participants.professionalId.toString()
            : conversation.participants.homeownerId.toString();

        // Emit read receipt to other participant
        messagingNamespace.to(`user:${otherParticipantId}`).emit('messages:read', {
          conversationId,
          readBy: userId,
          readAt: new Date(),
        });

        logger.info('Messages marked as read via socket', { userId, conversationId });
      } catch (error: any) {
        logger.error('Error marking messages as read', { error: error.message });
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    /**
     * User presence - set online status
     */
    socket.on('presence:online', () => {
      socket.broadcast.emit('presence:user_online', { userId });
      logger.debug('User online', { userId });
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      logger.info('Client disconnected from messaging', { socketId: socket.id, userId });

      // Broadcast offline status
      socket.broadcast.emit('presence:user_offline', { userId });
    });
  });

  logger.info('Messaging sockets initialized');
};

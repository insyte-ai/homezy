import { UserConversation } from '../models/UserConversation.model';
import { UserMessage } from '../models/UserMessage.model';
import { User } from '../models/User.model';
import { ForbiddenError, NotFoundError } from '../middleware/errorHandler.middleware';

/**
 * Messaging Utilities
 * Shared functions for messaging operations across HTTP and Socket handlers
 */

export type UserRole = 'homeowner' | 'professional';

/**
 * Get user role for messaging context
 * Maps 'pro' role to 'professional' for consistency
 */
export const getUserRole = (user: { role: string }): UserRole => {
  return user.role === 'homeowner' ? 'homeowner' : 'professional';
};

/**
 * Verify that a user is a participant in a conversation
 * @throws NotFoundError if conversation doesn't exist
 * @throws ForbiddenError if user is not a participant
 */
export const verifyConversationParticipant = async (
  conversationId: string,
  userId: string
): Promise<{ conversation: any; isParticipant: boolean }> => {
  const conversation = await UserConversation.findById(conversationId);

  if (!conversation) {
    throw new NotFoundError('Conversation not found');
  }

  const isParticipant =
    conversation.participants.homeownerId.toString() === userId ||
    conversation.participants.professionalId.toString() === userId;

  if (!isParticipant) {
    throw new ForbiddenError('You are not a participant in this conversation');
  }

  return { conversation, isParticipant };
};

/**
 * Check if user is a participant (without throwing)
 * Useful for socket handlers that need to emit errors differently
 */
export const isConversationParticipant = async (
  conversationId: string,
  userId: string
): Promise<{ conversation: any | null; isParticipant: boolean }> => {
  const conversation = await UserConversation.findById(conversationId);

  if (!conversation) {
    return { conversation: null, isParticipant: false };
  }

  const isParticipant =
    conversation.participants.homeownerId.toString() === userId ||
    conversation.participants.professionalId.toString() === userId;

  return { conversation, isParticipant };
};

/**
 * Get a populated message by ID with sender and recipient info
 */
export const getPopulatedMessage = async (messageId: string) => {
  const message = await UserMessage.findById(messageId)
    .populate('senderId', 'firstName lastName email role profilePhoto businessName')
    .populate('recipientId', 'firstName lastName email role profilePhoto businessName');

  return message?.toJSON();
};

/**
 * Get user by ID with role information
 */
export const getUserById = async (userId: string) => {
  return User.findById(userId);
};

/**
 * Broadcast message to recipient only
 * Used by HTTP controller after saving a message
 *
 * Note: We only emit to the recipient, not the sender. The sender already
 * has the message from the API response - sending it again via socket
 * would cause duplicate messages in their UI.
 */
export const broadcastMessage = (
  io: any,
  conversationId: string,
  recipientId: string,
  message: any
) => {
  const messagingNamespace = io.of('/messaging');

  // Send new message to recipient's user room (for real-time delivery)
  messagingNamespace
    .to(`user:${recipientId}`)
    .emit('message:new', { message });

  // Also send notification event (for badge updates when not in conversation)
  messagingNamespace
    .to(`user:${recipientId}`)
    .emit('message:notification', {
      conversationId,
      message,
    });
};

/**
 * Broadcast read receipt to socket rooms
 */
export const broadcastReadReceipt = (
  io: any,
  conversationId: string,
  otherParticipantId: string,
  readBy: string
) => {
  const messagingNamespace = io.of('/messaging');

  // Notify the sender that their messages were read
  messagingNamespace.to(`user:${otherParticipantId}`).emit('messages:read', {
    conversationId,
    readBy,
    readAt: new Date(),
  });

  // Notify the reader to update their unread badge
  messagingNamespace.to(`user:${readBy}`).emit('unread:updated', {
    conversationId,
  });
};

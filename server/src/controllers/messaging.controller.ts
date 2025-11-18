import { Request, Response } from 'express';
import { UserConversation } from '../models/UserConversation.model';
import { UserMessage } from '../models/UserMessage.model';
import { User } from '../models/User.model';
import { logger } from '../utils/logger';
import { BadRequestError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.middleware';

/**
 * @desc    Send a message
 * @route   POST /api/v1/messages/send
 * @access  Private
 */
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  const senderId = req.user?.id;
  const { recipientId, content, attachments, relatedLead } = req.body;

  logger.info('Sending message', { senderId, recipientId });

  // Validate recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new NotFoundError('Recipient not found');
  }

  // Determine roles
  const sender = await User.findById(senderId);
  if (!sender) {
    throw new NotFoundError('Sender not found');
  }

  // Ensure one is homeowner and one is professional
  if (sender.role === recipient.role) {
    throw new BadRequestError('Messages can only be sent between homeowners and professionals');
  }

  const homeownerId = sender.role === 'homeowner' ? senderId : recipientId;
  const professionalId = sender.role === 'pro' ? senderId : recipientId;

  // Find or create conversation
  let conversation = await UserConversation.findOne({
    'participants.homeownerId': homeownerId,
    'participants.professionalId': professionalId,
  });

  if (!conversation) {
    conversation = await UserConversation.create({
      participants: {
        homeownerId,
        professionalId,
      },
      relatedLead,
      status: 'active',
    });
    logger.info('New conversation created', { conversationId: conversation._id });
  }

  // Create message
  const message = await UserMessage.create({
    conversationId: conversation._id,
    senderId,
    recipientId,
    content,
    attachments: attachments || [],
  });

  // Update conversation
  await conversation.updateLastMessage(content, senderId!);

  // Increment unread count for recipient
  const recipientRole = recipient.role === 'homeowner' ? 'homeowner' : 'professional';
  await conversation.incrementUnread(recipientRole);

  // Populate sender info
  const populatedMessage = await UserMessage.findById(message._id)
    .populate('senderId', 'firstName lastName email role profilePhoto')
    .populate('recipientId', 'firstName lastName email role profilePhoto');

  logger.info('Message sent successfully', { messageId: message._id });

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: {
      message: populatedMessage,
      conversationId: conversation._id,
    },
  });
};

/**
 * @desc    Get user's conversations
 * @route   GET /api/v1/messages/conversations
 * @access  Private
 */
export const getConversations = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { status = 'active', limit = 20, offset = 0 } = req.query;

  logger.info('Getting conversations', { userId, status });

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Build query based on user role
  const query: any = {};

  if (user.role === 'homeowner') {
    query['participants.homeownerId'] = userId;
  } else if (user.role === 'pro') {
    query['participants.professionalId'] = userId;
  }

  if (status !== 'all') {
    query.status = status;
  }

  const conversations = await UserConversation.find(query)
    .populate('participants.homeownerId', 'firstName lastName email profilePhoto')
    .populate('participants.professionalId', 'firstName lastName email profilePhoto businessName')
    .populate('relatedLead', 'title category status')
    .sort({ updatedAt: -1 })
    .limit(Number(limit))
    .skip(Number(offset));

  const total = await UserConversation.countDocuments(query);

  // Calculate total unread
  const totalUnread = conversations.reduce((sum, conv: any) => {
    const unreadCount = user.role === 'homeowner'
      ? conv.unreadCount.homeowner
      : conv.unreadCount.professional;
    return sum + unreadCount;
  }, 0);

  logger.info('Conversations retrieved', { count: conversations.length, totalUnread });

  res.status(200).json({
    success: true,
    data: {
      conversations,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + conversations.length < total,
      },
      totalUnread,
    },
  });
};

/**
 * @desc    Get messages in a conversation
 * @route   GET /api/v1/messages/conversations/:conversationId/messages
 * @access  Private
 */
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { conversationId } = req.params;
  const { limit = 50, before } = req.query;

  logger.info('Getting messages', { userId, conversationId });

  // Verify conversation exists and user is a participant
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

  // Build query
  const query: any = {
    conversationId,
    deletedFor: { $ne: userId }, // Exclude messages deleted by this user
  };

  // Pagination: messages before a certain message ID
  if (before) {
    const beforeMessage = await UserMessage.findById(before);
    if (beforeMessage) {
      query.createdAt = { $lt: beforeMessage.createdAt };
    }
  }

  const messages = await UserMessage.find(query)
    .populate('senderId', 'firstName lastName email role profilePhoto businessName')
    .populate('recipientId', 'firstName lastName email role profilePhoto')
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  const total = await UserMessage.countDocuments({
    conversationId,
    deletedFor: { $ne: userId },
  });

  logger.info('Messages retrieved', { count: messages.length });

  res.status(200).json({
    success: true,
    data: {
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        total,
        limit: Number(limit),
        hasMore: messages.length === Number(limit),
        oldestMessageId: messages.length > 0 ? messages[0].id : null,
      },
    },
  });
};

/**
 * @desc    Mark conversation messages as read
 * @route   PATCH /api/v1/messages/conversations/:conversationId/read
 * @access  Private
 */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { conversationId } = req.params;

  logger.info('Marking messages as read', { userId, conversationId });

  // Verify conversation
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

  // Get user to determine role
  const user = await User.findById(userId);
  const userRole = user?.role === 'homeowner' ? 'homeowner' : 'professional';

  // Mark all unread messages as read
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

  // Reset unread count in conversation
  await conversation.markAsRead(userRole);

  logger.info('Messages marked as read', { conversationId });

  res.status(200).json({
    success: true,
    message: 'Messages marked as read',
  });
};

/**
 * @desc    Edit a message
 * @route   PATCH /api/v1/messages/:messageId
 * @access  Private
 */
export const editMessage = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { messageId } = req.params;
  const { content } = req.body;

  logger.info('Editing message', { userId, messageId });

  const message = await UserMessage.findById(messageId);
  if (!message) {
    throw new NotFoundError('Message not found');
  }

  // Verify user is the sender
  if (message.senderId.toString() !== userId) {
    throw new ForbiddenError('You can only edit your own messages');
  }

  // Check if message is within edit window (5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (message.createdAt < fiveMinutesAgo) {
    throw new BadRequestError('Messages can only be edited within 5 minutes of sending');
  }

  await message.editContent(content);

  logger.info('Message edited', { messageId });

  res.status(200).json({
    success: true,
    message: 'Message edited successfully',
    data: {
      message,
    },
  });
};

/**
 * @desc    Delete a message (soft delete)
 * @route   DELETE /api/v1/messages/:messageId
 * @access  Private
 */
export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { messageId } = req.params;

  logger.info('Deleting message', { userId, messageId });

  const message = await UserMessage.findById(messageId);
  if (!message) {
    throw new NotFoundError('Message not found');
  }

  // Users can delete messages for themselves
  await message.deleteForUser(userId!);

  logger.info('Message deleted for user', { messageId, userId });

  res.status(200).json({
    success: true,
    message: 'Message deleted',
  });
};

/**
 * @desc    Archive a conversation
 * @route   PATCH /api/v1/messages/conversations/:conversationId/archive
 * @access  Private
 */
export const archiveConversation = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { conversationId } = req.params;

  logger.info('Archiving conversation', { userId, conversationId });

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

  conversation.status = 'archived';
  await conversation.save();

  logger.info('Conversation archived', { conversationId });

  res.status(200).json({
    success: true,
    message: 'Conversation archived',
  });
};

/**
 * @desc    Get total unread message count
 * @route   GET /api/v1/messages/unread-count
 * @access  Private
 */
export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Build query based on user role
  const query: any = { status: 'active' };

  if (user.role === 'homeowner') {
    query['participants.homeownerId'] = userId;
  } else if (user.role === 'pro') {
    query['participants.professionalId'] = userId;
  }

  const conversations = await UserConversation.find(query);

  const totalUnread = conversations.reduce((sum, conv: any) => {
    const unreadCount = user.role === 'homeowner'
      ? conv.unreadCount.homeowner
      : conv.unreadCount.professional;
    return sum + unreadCount;
  }, 0);

  res.status(200).json({
    success: true,
    data: {
      unreadCount: totalUnread,
    },
  });
};

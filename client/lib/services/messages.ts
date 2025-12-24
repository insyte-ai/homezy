import { api } from '../api';
import { io, Socket } from 'socket.io-client';

/**
 * Message Service
 *
 * Handles user-to-user messaging:
 * - HTTP API for sending messages, getting conversations, etc. (reliable persistence)
 * - Socket.io for real-time features (typing indicators, presence, room management)
 *
 * Note: Message sending uses HTTP API, which then broadcasts via socket for real-time delivery.
 * This ensures messages are always persisted while still enabling real-time updates.
 */

// Types
export interface Attachment {
  type: 'image' | 'document' | 'pdf' | 'video';
  url: string;
  filename: string;
  size: number;
  publicId?: string;
}

export interface UploadAttachmentResponse {
  success: boolean;
  data: {
    url: string;
    type: 'image' | 'document' | 'pdf' | 'video';
    filename: string;
    size: number;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profilePhoto?: string;
    businessName?: string;
  };
  recipientId: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profilePhoto?: string;
  };
  content: string;
  attachments?: Attachment[];
  isRead: boolean;
  readAt?: Date;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  participants: {
    homeownerId: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      profilePhoto?: string;
    };
    professionalId: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      profilePhoto?: string;
      businessName?: string;
    };
  };
  relatedLead?: {
    id: string;
    title: string;
    category: string;
    status: string;
  };
  lastMessage?: {
    content: string;
    senderId: string;
    sentAt: Date;
  };
  unreadCount: {
    homeowner: number;
    professional: number;
  };
  status: 'active' | 'archived' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageData {
  recipientId: string;
  content: string;
  attachments?: Attachment[];
  relatedLead?: string;
}

// ============================================================================
// HTTP API Functions
// ============================================================================

/**
 * Send a message via HTTP API
 * Server will save to DB and broadcast via socket for real-time delivery
 */
export const sendMessage = async (data: SendMessageData) => {
  const response = await api.post('/messages/send', data);
  return response.data;
};

/**
 * Get user's conversations
 */
export const getConversations = async (params?: {
  status?: 'active' | 'archived' | 'all';
  limit?: number;
  offset?: number;
}) => {
  const response = await api.get('/messages/conversations', { params });
  return response.data;
};

/**
 * Get messages in a conversation
 */
export const getMessages = async (
  conversationId: string,
  params?: {
    limit?: number;
    before?: string;
  }
) => {
  const response = await api.get(
    `/messages/conversations/${conversationId}/messages`,
    { params }
  );
  return response.data;
};

/**
 * Mark conversation messages as read
 * Server will also broadcast read receipt via socket
 */
export const markAsRead = async (conversationId: string) => {
  const response = await api.patch(
    `/messages/conversations/${conversationId}/read`
  );
  return response.data;
};

/**
 * Edit a message
 */
export const editMessage = async (messageId: string, content: string) => {
  const response = await api.patch(`/messages/${messageId}`, { content });
  return response.data;
};

/**
 * Delete a message (soft delete)
 */
export const deleteMessage = async (messageId: string) => {
  const response = await api.delete(`/messages/${messageId}`);
  return response.data;
};

/**
 * Archive a conversation
 */
export const archiveConversation = async (conversationId: string) => {
  const response = await api.patch(
    `/messages/conversations/${conversationId}/archive`
  );
  return response.data;
};

/**
 * Get total unread message count
 */
export const getUnreadCount = async () => {
  const response = await api.get('/messages/unread-count');
  return response.data;
};

/**
 * Upload a message attachment (image, video, or document)
 */
export const uploadMessageAttachment = async (file: File): Promise<UploadAttachmentResponse['data']> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<UploadAttachmentResponse>('/upload/message-attachment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

// ============================================================================
// Socket.io Connection Management
// ============================================================================

let messagingSocket: Socket | null = null;

/**
 * Connect to messaging socket namespace
 * Returns the socket instance for direct event handling
 */
export const connectMessagingSocket = (token: string): Socket => {
  // Return existing connected socket
  if (messagingSocket?.connected) {
    return messagingSocket;
  }

  // Reconnect if socket exists but disconnected
  if (messagingSocket && !messagingSocket.connected) {
    messagingSocket.connect();
    return messagingSocket;
  }

  const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

  messagingSocket = io(`${serverUrl}/messaging`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  messagingSocket.on('connect', () => {
    console.log('Messaging socket connected');
  });

  messagingSocket.on('disconnect', (reason) => {
    console.log('Messaging socket disconnected:', reason);
  });

  messagingSocket.on('connect_error', (error) => {
    console.error('Messaging socket connection error:', error.message);
  });

  return messagingSocket;
};

/**
 * Disconnect from messaging socket
 */
export const disconnectMessagingSocket = () => {
  if (messagingSocket) {
    messagingSocket.disconnect();
    messagingSocket = null;
  }
};

/**
 * Get the current messaging socket instance
 */
export const getMessagingSocket = () => messagingSocket;

// ============================================================================
// Socket.io Event Emitters
// ============================================================================

/**
 * Join a conversation room to receive real-time messages
 */
export const joinConversation = (conversationId: string) => {
  messagingSocket?.emit('conversation:join', { conversationId });
};

/**
 * Leave a conversation room
 */
export const leaveConversation = (conversationId: string) => {
  messagingSocket?.emit('conversation:leave', { conversationId });
};

/**
 * Emit typing started indicator
 */
export const startTyping = (conversationId: string, recipientId: string) => {
  messagingSocket?.emit('typing:start', { conversationId, recipientId });
};

/**
 * Emit typing stopped indicator
 */
export const stopTyping = (conversationId: string, recipientId: string) => {
  messagingSocket?.emit('typing:stop', { conversationId, recipientId });
};

/**
 * Emit online presence status
 */
export const setOnline = () => {
  messagingSocket?.emit('presence:online');
};

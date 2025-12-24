/**
 * Messaging API Service
 * Handles all messaging-related API calls
 */

import { api } from './api';

// Types
export interface MessageAttachment {
  type: 'image' | 'document' | 'pdf' | 'video';
  url: string;
  filename: string;
  size: number;
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
  senderId: string | {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profilePhoto?: string;
  };
  recipientId: string | {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profilePhoto?: string;
  };
  content: string;
  attachments: MessageAttachment[];
  isRead: boolean;
  readAt?: string;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipants {
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
}

export interface Conversation {
  id: string;
  participants: ConversationParticipants;
  relatedLead?: {
    id: string;
    title: string;
    category: string;
    status: string;
  };
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: string;
  };
  unreadCount: {
    homeowner: number;
    professional: number;
  };
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// Response types
interface ConversationsResponse {
  success: boolean;
  data: {
    conversations: Conversation[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
    totalUnread: number;
  };
}

interface MessagesResponse {
  success: boolean;
  data: {
    messages: Message[];
    pagination: {
      total: number;
      limit: number;
      hasMore: boolean;
      oldestMessageId: string | null;
    };
  };
}

interface SendMessageResponse {
  success: boolean;
  message: string;
  data: {
    message: Message;
    conversationId: string;
  };
}

interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

/**
 * Get user's conversations
 */
export const getConversations = async (params?: {
  status?: 'active' | 'archived' | 'all';
  limit?: number;
  offset?: number;
}): Promise<ConversationsResponse['data']> => {
  const response = await api.get<ConversationsResponse>('/messages/conversations', { params });
  return response.data.data;
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
): Promise<MessagesResponse['data']> => {
  const response = await api.get<MessagesResponse>(
    `/messages/conversations/${conversationId}/messages`,
    { params }
  );
  return response.data.data;
};

/**
 * Send a message
 */
export const sendMessage = async (data: {
  recipientId: string;
  content: string;
  attachments?: MessageAttachment[];
  relatedLead?: string;
}): Promise<SendMessageResponse['data']> => {
  const response = await api.post<SendMessageResponse>('/messages/send', data);
  return response.data.data;
};

/**
 * Mark conversation messages as read
 */
export const markAsRead = async (conversationId: string): Promise<void> => {
  await api.patch(`/messages/conversations/${conversationId}/read`);
};

/**
 * Get total unread message count
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get<UnreadCountResponse>('/messages/unread-count');
  return response.data.data.unreadCount;
};

/**
 * Archive a conversation
 */
export const archiveConversation = async (conversationId: string): Promise<void> => {
  await api.patch(`/messages/conversations/${conversationId}/archive`);
};

/**
 * Edit a message
 */
export const editMessage = async (messageId: string, content: string): Promise<Message> => {
  const response = await api.patch<{ success: boolean; data: { message: Message } }>(
    `/messages/${messageId}`,
    { content }
  );
  return response.data.data.message;
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId: string): Promise<void> => {
  await api.delete(`/messages/${messageId}`);
};

/**
 * Upload a message attachment (image, video, or document)
 */
export const uploadMessageAttachment = async (
  uri: string,
  filename: string,
  mimeType: string
): Promise<UploadAttachmentResponse['data']> => {
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: filename,
    type: mimeType,
  } as any);

  const response = await api.post<UploadAttachmentResponse>(
    '/upload/message-attachment',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
};

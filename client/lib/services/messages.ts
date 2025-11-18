import { api } from '../api';
import { io, Socket } from 'socket.io-client';

/**
 * Message Service
 * Handles user-to-user messaging API calls and Socket.io real-time communication
 */

// Types
export interface Attachment {
  type: 'image' | 'document' | 'pdf';
  url: string;
  filename: string;
  size: number;
  publicId?: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profilePhoto?: string;
    businessName?: string;
  };
  recipientId: {
    _id: string;
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
  _id: string;
  participants: {
    homeownerId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      profilePhoto?: string;
    };
    professionalId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      profilePhoto?: string;
      businessName?: string;
    };
  };
  relatedLead?: {
    _id: string;
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

// API functions
export const sendMessage = async (data: SendMessageData) => {
  const response = await api.post('/messages/send', data);
  return response.data;
};

export const getConversations = async (params?: {
  status?: 'active' | 'archived' | 'all';
  limit?: number;
  offset?: number;
}) => {
  const response = await api.get('/messages/conversations', { params });
  return response.data;
};

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

export const markAsRead = async (conversationId: string) => {
  const response = await api.patch(
    `/messages/conversations/${conversationId}/read`
  );
  return response.data;
};

export const editMessage = async (messageId: string, content: string) => {
  const response = await api.patch(`/messages/${messageId}`, { content });
  return response.data;
};

export const deleteMessage = async (messageId: string) => {
  const response = await api.delete(`/messages/${messageId}`);
  return response.data;
};

export const archiveConversation = async (conversationId: string) => {
  const response = await api.patch(
    `/messages/conversations/${conversationId}/archive`
  );
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/messages/unread-count');
  return response.data;
};

// Socket.io connection management
let messagingSocket: Socket | null = null;

export const connectMessagingSocket = (token: string) => {
  if (messagingSocket?.connected) {
    return messagingSocket;
  }

  const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

  messagingSocket.on('disconnect', () => {
    console.log('Messaging socket disconnected');
  });

  messagingSocket.on('error', (error) => {
    console.error('Messaging socket error:', error);
  });

  return messagingSocket;
};

export const disconnectMessagingSocket = () => {
  if (messagingSocket) {
    messagingSocket.disconnect();
    messagingSocket = null;
  }
};

export const getMessagingSocket = () => messagingSocket;

// Socket.io event helpers
export const joinConversation = (conversationId: string) => {
  messagingSocket?.emit('conversation:join', { conversationId });
};

export const leaveConversation = (conversationId: string) => {
  messagingSocket?.emit('conversation:leave', { conversationId });
};

export const sendMessageViaSocket = (data: {
  conversationId: string;
  recipientId: string;
  content: string;
  attachments?: Attachment[];
}) => {
  messagingSocket?.emit('message:send', data);
};

export const startTyping = (conversationId: string, recipientId: string) => {
  messagingSocket?.emit('typing:start', { conversationId, recipientId });
};

export const stopTyping = (conversationId: string, recipientId: string) => {
  messagingSocket?.emit('typing:stop', { conversationId, recipientId });
};

export const markMessagesReadViaSocket = (conversationId: string) => {
  messagingSocket?.emit('messages:mark_read', { conversationId });
};

export const setOnline = () => {
  messagingSocket?.emit('presence:online');
};

// Socket.io event listeners
export const onNewMessage = (callback: (message: Message) => void) => {
  messagingSocket?.on('message:new', callback);
  return () => messagingSocket?.off('message:new', callback);
};

export const onMessageNotification = (
  callback: (data: { conversationId: string; message: Message }) => void
) => {
  messagingSocket?.on('message:notification', callback);
  return () => messagingSocket?.off('message:notification', callback);
};

export const onUserTyping = (
  callback: (data: { conversationId: string; userId: string }) => void
) => {
  messagingSocket?.on('typing:user_typing', callback);
  return () => messagingSocket?.off('typing:user_typing', callback);
};

export const onUserStoppedTyping = (
  callback: (data: { conversationId: string; userId: string }) => void
) => {
  messagingSocket?.on('typing:user_stopped', callback);
  return () => messagingSocket?.off('typing:user_stopped', callback);
};

export const onMessagesRead = (
  callback: (data: {
    conversationId: string;
    readBy: string;
    readAt: Date;
  }) => void
) => {
  messagingSocket?.on('messages:read', callback);
  return () => messagingSocket?.off('messages:read', callback);
};

export const onUserOnline = (callback: (data: { userId: string }) => void) => {
  messagingSocket?.on('presence:user_online', callback);
  return () => messagingSocket?.off('presence:user_online', callback);
};

export const onUserOffline = (callback: (data: { userId: string }) => void) => {
  messagingSocket?.on('presence:user_offline', callback);
  return () => messagingSocket?.off('presence:user_offline', callback);
};

export const onConversationJoined = (
  callback: (data: { conversationId: string }) => void
) => {
  messagingSocket?.on('conversation:joined', callback);
  return () => messagingSocket?.off('conversation:joined', callback);
};

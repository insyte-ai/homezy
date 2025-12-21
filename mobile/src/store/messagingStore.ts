/**
 * Messaging store for Homezy mobile app
 * Manages conversations and messages state
 */

import { create } from 'zustand';
import {
  Conversation,
  Message,
  getConversations,
  getMessages,
  sendMessage as sendMessageApi,
  markAsRead as markAsReadApi,
  getUnreadCount,
} from '../services/messaging';
import { messagingSocket, NewMessageEvent, TypingEvent } from '../lib/socket';
import { getErrorMessage } from '../services/api';

interface MessagingState {
  // Conversations
  conversations: Conversation[];
  conversationsLoading: boolean;
  conversationsError: string | null;
  totalUnread: number;

  // Active conversation
  activeConversationId: string | null;
  messages: Message[];
  messagesLoading: boolean;
  messagesError: string | null;
  hasMoreMessages: boolean;
  oldestMessageId: string | null;

  // Typing indicators
  typingUsers: Map<string, string>; // conversationId -> userId

  // Socket connection
  isConnected: boolean;

  // Actions
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string, loadMore?: boolean) => Promise<void>;
  sendMessage: (recipientId: string, content: string, relatedLead?: string) => Promise<void>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;
  refreshUnreadCount: () => Promise<void>;

  // Socket actions
  connectSocket: () => Promise<void>;
  disconnectSocket: () => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendTypingStart: (conversationId: string, recipientId: string) => void;
  sendTypingStop: (conversationId: string, recipientId: string) => void;

  // Internal
  handleNewMessage: (data: NewMessageEvent) => void;
  handleTypingStart: (data: TypingEvent) => void;
  handleTypingStop: (data: TypingEvent) => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  // Initial state
  conversations: [],
  conversationsLoading: false,
  conversationsError: null,
  totalUnread: 0,

  activeConversationId: null,
  messages: [],
  messagesLoading: false,
  messagesError: null,
  hasMoreMessages: false,
  oldestMessageId: null,

  typingUsers: new Map(),
  isConnected: false,

  /**
   * Load conversations list
   */
  loadConversations: async () => {
    set({ conversationsLoading: true, conversationsError: null });

    try {
      const data = await getConversations({ status: 'active', limit: 50 });
      set({
        conversations: data.conversations,
        totalUnread: data.totalUnread,
        conversationsLoading: false,
      });
    } catch (error) {
      set({
        conversationsError: getErrorMessage(error),
        conversationsLoading: false,
      });
    }
  },

  /**
   * Load messages for a conversation
   */
  loadMessages: async (conversationId: string, loadMore = false) => {
    const { oldestMessageId, messages } = get();

    set({ messagesLoading: true, messagesError: null });

    try {
      const data = await getMessages(conversationId, {
        limit: 50,
        before: loadMore ? oldestMessageId || undefined : undefined,
      });

      set({
        messages: loadMore ? [...data.messages, ...messages] : data.messages,
        hasMoreMessages: data.pagination.hasMore,
        oldestMessageId: data.pagination.oldestMessageId,
        messagesLoading: false,
      });
    } catch (error) {
      set({
        messagesError: getErrorMessage(error),
        messagesLoading: false,
      });
    }
  },

  /**
   * Send a message
   */
  sendMessage: async (recipientId: string, content: string, relatedLead?: string) => {
    try {
      const result = await sendMessageApi({
        recipientId,
        content,
        relatedLead,
      });

      // Add message to local state immediately
      const { messages, conversations } = get();
      set({
        messages: [...messages, result.message],
      });

      // Update conversation's last message
      const updatedConversations = conversations.map((conv) => {
        if (conv.id === result.conversationId) {
          return {
            ...conv,
            lastMessage: {
              content,
              senderId: result.message.senderId as string,
              timestamp: result.message.createdAt,
            },
            updatedAt: result.message.createdAt,
          };
        }
        return conv;
      });

      // Sort conversations by updatedAt
      updatedConversations.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      set({ conversations: updatedConversations });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark conversation as read
   */
  markConversationAsRead: async (conversationId: string) => {
    try {
      await markAsReadApi(conversationId);

      // Update local state
      const { conversations, totalUnread } = get();
      const conversation = conversations.find((c) => c.id === conversationId);

      if (conversation) {
        // Calculate how many were unread
        const userRole = conversation.participants.homeownerId ? 'homeowner' : 'professional';
        const unreadForUser = userRole === 'homeowner'
          ? conversation.unreadCount.homeowner
          : conversation.unreadCount.professional;

        const updatedConversations = conversations.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              unreadCount: {
                ...conv.unreadCount,
                homeowner: userRole === 'homeowner' ? 0 : conv.unreadCount.homeowner,
                professional: userRole === 'professional' ? 0 : conv.unreadCount.professional,
              },
            };
          }
          return conv;
        });

        set({
          conversations: updatedConversations,
          totalUnread: Math.max(0, totalUnread - unreadForUser),
        });
      }
    } catch (error) {
      if (__DEV__) console.error('Failed to mark as read:', error);
    }
  },

  /**
   * Set active conversation
   */
  setActiveConversation: (conversationId: string | null) => {
    const { activeConversationId, leaveConversation, joinConversation } = get();

    // Leave previous conversation
    if (activeConversationId) {
      leaveConversation(activeConversationId);
    }

    // Join new conversation
    if (conversationId) {
      joinConversation(conversationId);
    }

    set({
      activeConversationId: conversationId,
      messages: [],
      hasMoreMessages: false,
      oldestMessageId: null,
    });
  },

  /**
   * Refresh unread count
   */
  refreshUnreadCount: async () => {
    try {
      const count = await getUnreadCount();
      set({ totalUnread: count });
    } catch (error) {
      if (__DEV__) console.error('Failed to refresh unread count:', error);
    }
  },

  /**
   * Connect to messaging socket
   */
  connectSocket: async () => {
    await messagingSocket.connect();

    // Set up event listeners
    messagingSocket.on('message:new', get().handleNewMessage);
    messagingSocket.on('typing:user_typing', get().handleTypingStart);
    messagingSocket.on('typing:user_stopped', get().handleTypingStop);

    set({ isConnected: messagingSocket.isConnected() });
  },

  /**
   * Disconnect from socket
   */
  disconnectSocket: () => {
    messagingSocket.off('message:new', get().handleNewMessage);
    messagingSocket.off('typing:user_typing', get().handleTypingStart);
    messagingSocket.off('typing:user_stopped', get().handleTypingStop);
    messagingSocket.disconnect();
    set({ isConnected: false });
  },

  /**
   * Join conversation room
   */
  joinConversation: (conversationId: string) => {
    messagingSocket.joinConversation(conversationId);
  },

  /**
   * Leave conversation room
   */
  leaveConversation: (conversationId: string) => {
    messagingSocket.leaveConversation(conversationId);
  },

  /**
   * Send typing start indicator
   */
  sendTypingStart: (conversationId: string, recipientId: string) => {
    messagingSocket.startTyping(conversationId, recipientId);
  },

  /**
   * Send typing stop indicator
   */
  sendTypingStop: (conversationId: string, recipientId: string) => {
    messagingSocket.stopTyping(conversationId, recipientId);
  },

  /**
   * Handle new message from socket
   */
  handleNewMessage: (data: NewMessageEvent) => {
    const { activeConversationId, messages, conversations, totalUnread } = get();
    const newMessage = data.message;

    // If we're in this conversation, add the message
    if (activeConversationId === newMessage.conversationId) {
      set({ messages: [...messages, newMessage as unknown as Message] });
    }

    // Update conversation list
    const existingConv = conversations.find((c) => c.id === newMessage.conversationId);

    if (existingConv) {
      const updatedConversations = conversations.map((conv) => {
        if (conv.id === newMessage.conversationId) {
          return {
            ...conv,
            lastMessage: {
              content: newMessage.content,
              senderId: newMessage.senderId,
              timestamp: newMessage.createdAt,
            },
            updatedAt: newMessage.createdAt,
          };
        }
        return conv;
      });

      // Sort by updatedAt
      updatedConversations.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      set({ conversations: updatedConversations });
    }

    // Increment unread if not in active conversation
    if (activeConversationId !== newMessage.conversationId) {
      set({ totalUnread: totalUnread + 1 });
    }
  },

  /**
   * Handle typing start from socket
   */
  handleTypingStart: (data: TypingEvent) => {
    const { typingUsers } = get();
    const newTypingUsers = new Map(typingUsers);
    newTypingUsers.set(data.conversationId, data.userId);
    set({ typingUsers: newTypingUsers });
  },

  /**
   * Handle typing stop from socket
   */
  handleTypingStop: (data: TypingEvent) => {
    const { typingUsers } = get();
    const newTypingUsers = new Map(typingUsers);
    newTypingUsers.delete(data.conversationId);
    set({ typingUsers: newTypingUsers });
  },
}));

export default useMessagingStore;

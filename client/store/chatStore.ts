import { create } from 'zustand';
import { ChatMessage } from '@homezy/shared';
import { api } from '@/lib/api';

interface ChatState {
  conversationId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingMessage: string;
  currentToolCall: { name: string; id: string } | null;
  guestMessageCount: number;
  isGuestLimitReached: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initializeConversation: () => Promise<void>;
  sendMessage: (content: string) => void;
  appendStreamingToken: (token: string) => void;
  setStreamingMessage: (message: string) => void;
  startFunctionCall: (toolName: string, toolId: string) => void;
  completeFunctionCall: (toolName: string, result: any) => void;
  completeStreaming: () => void;
  loadHistory: (conversationId: string) => Promise<void>;
  incrementGuestCount: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversationId: null,
  messages: [],
  isStreaming: false,
  streamingMessage: '',
  currentToolCall: null,
  guestMessageCount: 0,
  isGuestLimitReached: false,
  isInitialized: false,
  error: null,

  initializeConversation: async () => {
    try {
      const response = await api.post('/chat/conversations');
      const { data } = response.data;

      set({
        conversationId: data.conversationId,
        guestMessageCount: data.messageCount,
        isGuestLimitReached: data.messageCount >= 5,
        isInitialized: true,
      });

      // Load existing messages if any
      if (data.messageCount > 0) {
        await get().loadHistory(data.conversationId);
      }
    } catch (error: any) {
      console.error('Failed to initialize conversation:', error);
      set({
        error: 'Failed to start conversation. Please refresh the page.',
        isInitialized: true,
      });
    }
  },

  sendMessage: (content: string) => {
    const { conversationId } = get();

    if (!conversationId) {
      console.error('No conversation ID available');
      set({ error: 'Please wait for the conversation to initialize' });
      return;
    }

    // Create user message ID
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add user message immediately
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: messageId,
          conversationId,
          role: 'user',
          content,
          createdAt: new Date(),
        } as ChatMessage,
      ],
      isStreaming: true,
      streamingMessage: '',
      error: null,
    }));

    // Note: Actual sending happens via Socket.io in the hook
    // The socket hook listens for this state change
  },

  appendStreamingToken: (token: string) => {
    set((state) => ({
      streamingMessage: state.streamingMessage + token,
    }));
  },

  setStreamingMessage: (message: string) => {
    set({ streamingMessage: message });
  },

  startFunctionCall: (toolName: string, toolId: string) => {
    set({
      currentToolCall: { name: toolName, id: toolId },
    });
  },

  completeFunctionCall: (toolName: string, result: any) => {
    console.log(`Function ${toolName} completed:`, result);
    set({ currentToolCall: null });
  },

  completeStreaming: () => {
    const { streamingMessage, messages, conversationId } = get();

    if (!streamingMessage.trim()) {
      set({ isStreaming: false, streamingMessage: '' });
      return;
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    set({
      messages: [
        ...messages,
        {
          id: messageId,
          conversationId: conversationId!,
          role: 'assistant',
          content: streamingMessage,
          createdAt: new Date(),
        } as ChatMessage,
      ],
      isStreaming: false,
      streamingMessage: '',
    });
  },

  loadHistory: async (conversationId: string) => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}`);
      const { data } = response.data;

      set({
        conversationId: data.conversation.conversationId,
        messages: data.messages,
        guestMessageCount: data.conversation.messageCount,
        isGuestLimitReached: data.conversation.messageCount >= 5,
      });
    } catch (error: any) {
      console.error('Failed to load conversation history:', error);
      set({ error: 'Failed to load conversation history' });
    }
  },

  incrementGuestCount: () => {
    set((state) => {
      const newCount = state.guestMessageCount + 1;
      return {
        guestMessageCount: newCount,
        isGuestLimitReached: newCount >= 5,
      };
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  reset: () => {
    set({
      conversationId: null,
      messages: [],
      isStreaming: false,
      streamingMessage: '',
      currentToolCall: null,
      guestMessageCount: 0,
      isGuestLimitReached: false,
      isInitialized: false,
      error: null,
    });
  },
}));

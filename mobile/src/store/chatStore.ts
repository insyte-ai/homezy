/**
 * Chat Store
 * Manages HomeGPT AI chat state
 */

import { create } from 'zustand';
import { api } from '../services/api';

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: ToolCall[];
  createdAt: Date;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  status: 'pending' | 'success' | 'error';
  executionTimeMs?: number;
  error?: string;
}

interface ChatState {
  conversationId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingMessage: string;
  currentToolCall: { name: string; id: string } | null;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initializeConversation: () => Promise<void>;
  addUserMessage: (content: string) => void;
  appendStreamingToken: (token: string) => void;
  setStreamingMessage: (message: string) => void;
  startFunctionCall: (toolName: string, toolId: string) => void;
  completeFunctionCall: (toolName: string, result: any) => void;
  completeStreaming: () => void;
  loadHistory: (conversationId: string) => Promise<void>;
  setError: (error: string | null) => void;
  setIsStreaming: (streaming: boolean) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversationId: null,
  messages: [],
  isStreaming: false,
  streamingMessage: '',
  currentToolCall: null,
  isInitialized: false,
  error: null,

  initializeConversation: async () => {
    try {
      const response = await api.post('/chat/conversations');
      const { data } = response.data;

      set({
        conversationId: data.conversationId,
        isInitialized: true,
        error: null,
      });

      // Load existing messages if any
      if (data.messageCount > 0) {
        await get().loadHistory(data.conversationId);
      }
    } catch (error: any) {
      if (__DEV__) console.error('Failed to initialize conversation:', error);
      set({
        error: 'Failed to start conversation. Please try again.',
        isInitialized: true,
      });
    }
  },

  addUserMessage: (content: string) => {
    const { conversationId } = get();

    if (!conversationId) {
      if (__DEV__) console.error('No conversation ID available');
      set({ error: 'Please wait for the conversation to initialize' });
      return;
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
    if (__DEV__) console.log(`Function ${toolName} completed:`, result);
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
      currentToolCall: null,
    });
  },

  loadHistory: async (conversationId: string) => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}`);
      const { data } = response.data;

      set({
        conversationId: data.conversation.conversationId,
        messages: data.messages.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        })),
      });
    } catch (error: any) {
      if (__DEV__) console.error('Failed to load conversation history:', error);
      set({ error: 'Failed to load conversation history' });
    }
  },

  setError: (error: string | null) => {
    set({ error, isStreaming: false });
  },

  setIsStreaming: (streaming: boolean) => {
    set({ isStreaming: streaming });
  },

  reset: () => {
    set({
      conversationId: null,
      messages: [],
      isStreaming: false,
      streamingMessage: '',
      currentToolCall: null,
      isInitialized: false,
      error: null,
    });
  },
}));

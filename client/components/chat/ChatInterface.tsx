'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from '@/hooks/useSocket';
import { WelcomeSection } from './WelcomeSection';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { GuestLimitBanner } from './GuestLimitBanner';
import { StreamingIndicator } from './StreamingIndicator';

export const ChatInterface = () => {
  const {
    messages,
    isStreaming,
    streamingMessage,
    guestMessageCount,
    isGuestLimitReached,
    isInitialized,
    error,
    initializeConversation,
  } = useChatStore();

  const { user } = useAuthStore();
  const { isConnected, sendMessage } = useSocket();

  // Initialize conversation on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeConversation();
    }
  }, [isInitialized, initializeConversation]);

  const handleSendMessage = (content: string) => {
    if (!isConnected) {
      console.error('Socket not connected');
      return;
    }

    sendMessage(content);
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
          <p className="text-gray-600">Initializing Home GPT...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-12 w-12 text-red-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connection Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto px-4">
      {/* Connection Status Indicator (only show when disconnected) */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-yellow-800">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Reconnecting to Home GPT...</span>
          </div>
        </div>
      )}

      {/* Welcome Section (shown if no messages) */}
      {messages.length === 0 && !isStreaming && <WelcomeSection />}

      {/* Message List */}
      {(messages.length > 0 || isStreaming) && (
        <MessageList
          messages={messages}
          streamingMessage={streamingMessage}
          isStreaming={isStreaming}
        />
      )}

      {/* Streaming Indicator */}
      {isStreaming && !streamingMessage && <StreamingIndicator />}

      {/* Guest Limit Banner */}
      {!user && guestMessageCount >= 3 && (
        <GuestLimitBanner remaining={5 - guestMessageCount} />
      )}

      {/* Error Banner (inline) */}
      {error && messages.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Message Input */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={isStreaming || isGuestLimitReached || !isConnected}
        placeholder={
          isGuestLimitReached
            ? 'Sign up to continue chatting...'
            : !isConnected
            ? 'Connecting...'
            : 'Ask about your home improvement project...'
        }
      />
    </div>
  );
};

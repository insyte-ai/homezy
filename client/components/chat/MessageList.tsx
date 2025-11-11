'use client';

import { useRef, useEffect } from 'react';
import { ChatMessage } from '@homezy/shared';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  streamingMessage: string;
  isStreaming: boolean;
}

export const MessageList = ({ messages, streamingMessage, isStreaming }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  return (
    <div className="flex-1 overflow-y-auto py-6 space-y-4 scroll-smooth">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* Streaming message (AI typing) */}
      {isStreaming && streamingMessage && (
        <MessageBubble
          message={{
            id: 'streaming',
            conversationId: '',
            role: 'assistant',
            content: streamingMessage,
            createdAt: new Date(),
          }}
        />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

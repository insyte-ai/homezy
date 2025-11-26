'use client';

import { ChatMessage, IToolCall } from '@homezy/shared';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 items-start ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
          AI
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-900 border border-gray-200'
        }`}
      >
        {/* Function call badges */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-2 space-y-1">
            {message.toolCalls.map((tool) => (
              <FunctionCallBadge key={tool.id} toolCall={tool} />
            ))}
          </div>
        )}

        {/* Message content */}
        <div className="prose prose-sm max-w-none prose-headings:text-inherit prose-p:text-inherit prose-strong:text-inherit prose-ul:text-inherit prose-ol:text-inherit prose-li:text-inherit">
          <ReactMarkdown
            components={{
              // Customize markdown rendering for better styling
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Timestamp */}
        <div
          className={`text-xs mt-2 ${
            isUser ? 'text-primary-100' : 'text-gray-500'
          }`}
        >
          {format(new Date(message.createdAt), 'HH:mm')}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-sm font-semibold">
          U
        </div>
      )}
    </div>
  );
};

// Function call badge component
interface FunctionCallBadgeProps {
  toolCall: IToolCall;
}

const FunctionCallBadge = ({ toolCall }: FunctionCallBadgeProps) => {
  const icons: Record<string, string> = {
    estimate_budget: '💰',
    estimate_timeline: '📅',
    search_knowledge_base: '📚',
    create_lead_form: '📝',
    search_professionals: '👷',
  };

  const labels: Record<string, string> = {
    estimate_budget: 'Calculating budget',
    estimate_timeline: 'Estimating timeline',
    search_knowledge_base: 'Searching knowledge base',
    create_lead_form: 'Creating lead form',
    search_professionals: 'Finding professionals',
  };

  const statusColors = {
    pending: 'bg-primary-50 text-neutral-900',
    success: 'bg-green-50 text-green-700',
    error: 'bg-red-50 text-red-700',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
        statusColors[toolCall.status]
      }`}
    >
      <span className="text-base">{icons[toolCall.name] || '🔧'}</span>
      <span>{labels[toolCall.name] || toolCall.name}</span>

      {toolCall.status === 'pending' && (
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
      )}

      {toolCall.status === 'success' && (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}

      {toolCall.status === 'error' && (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}

      {toolCall.executionTimeMs && (
        <span className="text-xs opacity-70">({toolCall.executionTimeMs}ms)</span>
      )}
    </div>
  );
};

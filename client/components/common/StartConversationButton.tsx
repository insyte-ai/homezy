'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Send, X } from 'lucide-react';
import { sendMessage } from '@/lib/services/messages';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface StartConversationButtonProps {
  recipientId: string;
  recipientName: string;
  relatedLeadId?: string;
  relatedLeadTitle?: string;
  variant?: 'primary' | 'outline' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  defaultMessage?: string;
}

export function StartConversationButton({
  recipientId,
  recipientName,
  relatedLeadId,
  relatedLeadTitle,
  variant = 'outline',
  size = 'md',
  className = '',
  defaultMessage = '',
}: StartConversationButtonProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageContent, setMessageContent] = useState(defaultMessage);
  const [sending, setSending] = useState(false);

  // Determine the messages route based on user role
  const getMessagesRoute = (conversationId?: string) => {
    const basePath = user?.role === 'pro' ? '/pro/dashboard/messages' : '/dashboard/messages';
    // Use query param to auto-select conversation in split-pane layout
    return conversationId ? `${basePath}?id=${conversationId}` : basePath;
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setSending(true);
      const response = await sendMessage({
        recipientId,
        content: messageContent.trim(),
        relatedLead: relatedLeadId,
      });

      toast.success('Message sent!');
      setIsModalOpen(false);
      setMessageContent('');

      // Navigate to the conversation
      router.push(getMessagesRoute(response.data?.conversationId));
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    icon: 'p-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full',
  };

  const buttonClass =
    variant === 'icon'
      ? variantClasses.icon
      : `${sizeClasses[size]} ${variantClasses[variant]} rounded-lg font-medium transition flex items-center gap-2`;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`${buttonClass} ${className}`}
        title={`Message ${recipientName}`}
      >
        <MessageSquare className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
        {variant !== 'icon' && <span>Message</span>}
      </button>

      {/* Message Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Message {recipientName}
                </h3>
                {relatedLeadTitle && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    Re: {relatedLeadTitle}
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
                maxLength={2000}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder={`Hi ${recipientName}, I'd like to discuss...`}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {messageContent.length}/2000
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={sending}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sending || !messageContent.trim()}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

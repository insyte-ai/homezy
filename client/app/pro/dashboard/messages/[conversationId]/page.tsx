'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Archive,
  Trash2,
  Edit2,
  Check,
  CheckCheck,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  getMessages,
  getConversations,
  markAsRead,
  connectMessagingSocket,
  joinConversation,
  leaveConversation,
  sendMessage,
  startTyping,
  stopTyping,
  archiveConversation,
  deleteMessage,
  editMessage,
  type Message,
  type Conversation,
} from '@/lib/services/messages';
import { format, isSameDay } from 'date-fns';

interface PageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default function ProConversationPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const conversationId = resolvedParams.conversationId;

  const router = useRouter();
  const { user } = useAuthStore();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get access token from localStorage
  const getAccessToken = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  };

  // Get other participant from conversation - for pros, it's the homeowner
  const getOtherParticipant = () => {
    if (!conversation || !user) return null;
    return conversation.participants.homeownerId;
  };

  // Get recipient ID for sending messages
  const getRecipientId = (): string | null => {
    const otherParticipant = getOtherParticipant();
    return otherParticipant?.id || null;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversation details
  useEffect(() => {
    const loadConversation = async () => {
      try {
        // Get all conversations and find this one
        const response = await getConversations({ limit: 100 });
        const conv = response.data.conversations.find(
          (c: Conversation) => c.id === conversationId
        );

        if (conv) {
          setConversation(conv);
        } else {
          console.error('Conversation not found');
          router.push('/pro/dashboard/messages');
        }
      } catch (error) {
        console.error('Failed to load conversation:', error);
      }
    };

    loadConversation();
  }, [conversationId, router]);

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await getMessages(conversationId, { limit: 100 });
        // API returns newest-first, reverse for chronological display (oldest at top)
        setMessages([...response.data.messages].reverse());

        // Mark as read when opening conversation
        await markAsRead(conversationId);

        scrollToBottom();
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversationId]);

  // Setup Socket.io
  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) return;

    const socket = connectMessagingSocket(accessToken);
    joinConversation(conversationId);

    // Handler for new messages
    const handleNewMessage = (data: { message: Message } | Message) => {
      // Handle both wrapped { message } and direct message format
      const message = 'message' in data ? data.message : data;

      if (message.conversationId === conversationId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        scrollToBottom();

        // Mark as read if recipient
        if (message.recipientId.id === user?.id) {
          markAsRead(conversationId);
        }
      }
    };

    // Handler for typing indicators
    const handleUserTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId && data.userId !== user?.id) {
        setIsTyping(true);
      }
    };

    const handleUserStoppedTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId && data.userId !== user?.id) {
        setIsTyping(false);
      }
    };

    // Handler for read receipts
    const handleMessagesRead = (data: { conversationId: string; readBy: string; readAt: Date }) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId.id === user?.id && !msg.isRead
              ? { ...msg, isRead: true, readAt: data.readAt }
              : msg
          )
        );
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('typing:user_typing', handleUserTyping);
    socket.on('typing:user_stopped', handleUserStoppedTyping);
    socket.on('messages:read', handleMessagesRead);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('typing:user_typing', handleUserTyping);
      socket.off('typing:user_stopped', handleUserStoppedTyping);
      socket.off('messages:read', handleMessagesRead);
      leaveConversation(conversationId);
      // Don't disconnect socket - it's managed by the layout for notifications
    };
  }, [conversationId, user?.id]);

  // Handle typing indicator
  const handleTyping = () => {
    const recipientId = getRecipientId();
    if (!recipientId) return;

    startTyping(conversationId, recipientId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversationId, recipientId);
    }, 2000);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const recipientId = getRecipientId();
    if (!recipientId) return;

    const messageContent = newMessage.trim();

    try {
      setSending(true);
      setNewMessage('');

      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping(conversationId, recipientId);

      // Send via HTTP API (server will broadcast via socket for real-time delivery)
      await sendMessage({
        recipientId,
        content: messageContent,
        relatedLead: conversation?.relatedLead?.id,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore the message on error
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  // Handle edit message
  const handleEditMessage = async (messageId: string) => {
    if (!editContent.trim()) return;

    try {
      await editMessage(messageId, editContent.trim());
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: editContent.trim(), isEdited: true, editedAt: new Date() }
            : msg
        )
      );
      setEditingMessageId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Delete this message?')) return;

    try {
      await deleteMessage(messageId);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  // Archive conversation
  const handleArchive = async () => {
    if (!confirm('Archive this conversation?')) return;

    try {
      await archiveConversation(conversationId);
      router.push('/pro/dashboard/messages');
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  };

  // Get display name for other participant
  const otherParticipant = getOtherParticipant();
  const participantName = otherParticipant
    ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
    : '';

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(new Date(message.createdAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/pro/dashboard/messages')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            {otherParticipant && (
              <div className="flex items-center gap-3">
                {otherParticipant.profilePhoto ? (
                  <Image
                    src={otherParticipant.profilePhoto}
                    alt={participantName}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {participantName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{participantName}</h2>
                  {conversation?.relatedLead && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Re: {conversation.relatedLead.title}
                    </p>
                  )}
                  {isTyping && <p className="text-sm text-gray-500 dark:text-gray-400">typing...</p>}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleArchive}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Archive className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                {/* Date divider */}
                <div className="flex items-center justify-center mb-4">
                  <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-500 dark:text-gray-400 shadow-sm">
                    {isSameDay(new Date(date), new Date())
                      ? 'Today'
                      : format(new Date(date), 'MMMM d, yyyy')}
                  </span>
                </div>

                {/* Messages for this date */}
                <div className="space-y-4">
                  {msgs.map((message) => {
                    const isSender = message.senderId.id === user?.id;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isSender ? 'items-end' : 'items-start'}`}>
                          {editingMessageId === message.id ? (
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                              <input
                                type="text"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 mb-2 dark:bg-gray-700 dark:text-white"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditMessage(message.id)}
                                  className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingMessageId(null);
                                    setEditContent('');
                                  }}
                                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`group relative px-4 py-2 rounded-lg ${
                                isSender
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>

                              <div
                                className={`flex items-center gap-2 mt-1 text-xs ${
                                  isSender ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                <span>{format(new Date(message.createdAt), 'h:mm a')}</span>
                                {message.isEdited && <span>(edited)</span>}
                                {isSender && (
                                  <span>
                                    {message.isRead ? (
                                      <CheckCheck className="w-3 h-3" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                  </span>
                                )}
                              </div>

                              {/* Message actions */}
                              {isSender && (
                                <div className="absolute right-0 top-0 -mr-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => {
                                      setEditingMessageId(message.id);
                                      setEditContent(message.content);
                                    }}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMessage(message.id)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-end gap-3">
          <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

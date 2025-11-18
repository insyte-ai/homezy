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
  disconnectMessagingSocket,
  joinConversation,
  leaveConversation,
  sendMessageViaSocket,
  startTyping,
  stopTyping,
  onNewMessage,
  onUserTyping,
  onUserStoppedTyping,
  onMessagesRead,
  archiveConversation,
  deleteMessage,
  editMessage,
  type Message,
  type Conversation,
} from '@/lib/services/messages';
import { format, isSameDay } from 'date-fns';

// Extended type for participants with businessName
type ParticipantWithBusiness = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profilePhoto?: string;
  businessName?: string;
};

interface PageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default function ConversationPage({ params }: PageProps) {
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

  // Get other participant from conversation
  const getOtherParticipant = (): ParticipantWithBusiness | null => {
    if (!conversation || !user) return null;

    if (user.role === 'homeowner') {
      return conversation.participants.professionalId as ParticipantWithBusiness;
    }
    return conversation.participants.homeownerId as ParticipantWithBusiness;
  };

  // Get recipient ID for sending messages
  const getRecipientId = (): string | null => {
    const otherParticipant = getOtherParticipant();
    return otherParticipant?._id || null;
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
          (c: Conversation) => c._id === conversationId
        );

        if (conv) {
          setConversation(conv);
        } else {
          console.error('Conversation not found');
          router.push('/dashboard/messages');
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
        setMessages(response.data.messages);

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

    connectMessagingSocket(accessToken);
    joinConversation(conversationId);

    // Listen for new messages
    const unsubscribeNewMessage = onNewMessage((message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();

        // Mark as read if recipient
        if (message.recipientId._id === user?._id) {
          markAsRead(conversationId);
        }
      }
    });

    // Listen for typing indicators
    const unsubscribeTyping = onUserTyping((data) => {
      if (data.conversationId === conversationId && data.userId !== user?._id) {
        setIsTyping(true);
      }
    });

    const unsubscribeStoppedTyping = onUserStoppedTyping((data) => {
      if (data.conversationId === conversationId && data.userId !== user?._id) {
        setIsTyping(false);
      }
    });

    // Listen for read receipts
    const unsubscribeRead = onMessagesRead((data) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId._id === user?._id && !msg.isRead
              ? { ...msg, isRead: true, readAt: data.readAt }
              : msg
          )
        );
      }
    });

    return () => {
      unsubscribeNewMessage();
      unsubscribeTyping();
      unsubscribeStoppedTyping();
      unsubscribeRead();
      leaveConversation(conversationId);
      disconnectMessagingSocket();
    };
  }, [conversationId, user?._id]);

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

    try {
      setSending(true);

      sendMessageViaSocket({
        conversationId,
        recipientId,
        content: newMessage.trim(),
      });

      setNewMessage('');

      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping(conversationId, recipientId);
    } catch (error) {
      console.error('Failed to send message:', error);
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
          msg._id === messageId
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
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  // Archive conversation
  const handleArchive = async () => {
    if (!confirm('Archive this conversation?')) return;

    try {
      await archiveConversation(conversationId);
      router.push('/dashboard/messages');
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  };

  // Get display name for other participant
  const otherParticipant = getOtherParticipant();
  const participantName = otherParticipant
    ? otherParticipant.businessName ||
      `${otherParticipant.firstName} ${otherParticipant.lastName}`
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
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/messages')}
              className="text-gray-600 hover:text-gray-900"
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
                  <h2 className="font-semibold text-gray-900">{participantName}</h2>
                  {isTyping && <p className="text-sm text-gray-500">typing...</p>}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleArchive}
            className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
          >
            <Archive className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                {/* Date divider */}
                <div className="flex items-center justify-center mb-4">
                  <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                    {isSameDay(new Date(date), new Date())
                      ? 'Today'
                      : format(new Date(date), 'MMMM d, yyyy')}
                  </span>
                </div>

                {/* Messages for this date */}
                <div className="space-y-4">
                  {msgs.map((message) => {
                    const isSender = message.senderId._id === user?._id;

                    return (
                      <div
                        key={message._id}
                        className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isSender ? 'items-end' : 'items-start'}`}>
                          {editingMessageId === message._id ? (
                            <div className="bg-white p-3 rounded-lg shadow-sm">
                              <input
                                type="text"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 mb-2"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditMessage(message._id)}
                                  className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingMessageId(null);
                                    setEditContent('');
                                  }}
                                  className="text-sm text-gray-600 hover:text-gray-700"
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
                                  : 'bg-white text-gray-900 shadow-sm'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>

                              <div
                                className={`flex items-center gap-2 mt-1 text-xs ${
                                  isSender ? 'text-blue-100' : 'text-gray-500'
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
                                      setEditingMessageId(message._id);
                                      setEditContent(message.content);
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4 text-gray-600" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMessage(message._id)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4 text-gray-600" />
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
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-end gap-3">
          <button className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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

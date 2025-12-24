'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  getConversations,
  getMessages,
  markAsRead,
  sendMessage,
  connectMessagingSocket,
  joinConversation,
  leaveConversation,
  startTyping,
  stopTyping,
  setOnline,
  archiveConversation as archiveConv,
  deleteMessage as deleteMsg,
  editMessage as editMsg,
  type Conversation,
  type Message,
  type Attachment,
} from '@/lib/services/messages';
import { handleApiError } from '@/lib/utils/errorHandler';

export type UserRole = 'homeowner' | 'pro';

interface UseMessagingOptions {
  userRole: UserRole;
}

// Pending new conversation state (when starting conversation from query params)
interface PendingConversation {
  recipientId: string;
  recipientName: string;
  leadId?: string;
}

interface UseMessagingReturn {
  // State
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  messagesLoading: boolean;
  sending: boolean;
  isTyping: boolean;
  totalUnread: number;
  searchQuery: string;
  statusFilter: 'active' | 'archived' | 'all';
  newMessage: string;
  editingMessageId: string | null;
  editContent: string;
  showMobileChat: boolean;
  pendingConversation: PendingConversation | null;

  // Setters
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: 'active' | 'archived' | 'all') => void;
  setNewMessage: (message: string) => void;
  setEditingMessageId: (id: string | null) => void;
  setEditContent: (content: string) => void;
  setShowMobileChat: (show: boolean) => void;

  // Handlers
  handleSelectConversation: (conversation: Conversation) => Promise<void>;
  handleSendMessage: (attachments?: Attachment[]) => Promise<void>;
  handleTyping: () => void;
  handleEditMessage: (messageId: string) => Promise<void>;
  handleDeleteMessage: (messageId: string) => Promise<void>;
  handleArchiveConversation: () => Promise<void>;
  clearPendingConversation: () => void;

  // Helpers
  getOtherParticipant: (conversation: Conversation) => any;
  getUnreadCount: (conversation: Conversation) => number;
  getParticipantName: (participant: any) => string;
  groupedMessages: Record<string, Message[]>;

  // Refs
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function useMessaging({ userRole }: UseMessagingOptions): UseMessagingReturn {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  // Conversation list state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [totalUnread, setTotalUnread] = useState(0);

  // Selected conversation state
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [pendingConversation, setPendingConversation] = useState<PendingConversation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentConversationRef = useRef<string | null>(null);

  // Helper functions
  const getAccessToken = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  };

  const getOtherParticipant = useCallback((conversation: Conversation) => {
    return userRole === 'homeowner'
      ? conversation.participants.professionalId
      : conversation.participants.homeownerId;
  }, [userRole]);

  const getUnreadCount = useCallback((conversation: Conversation) => {
    return userRole === 'homeowner'
      ? conversation.unreadCount.homeowner
      : conversation.unreadCount.professional;
  }, [userRole]);

  const getParticipantName = useCallback((participant: any) => {
    if (userRole === 'homeowner' && participant.businessName) {
      return participant.businessName;
    }
    return `${participant.firstName} ${participant.lastName}`;
  }, [userRole]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await getConversations({
          status: statusFilter,
          limit: 50,
        });

        setConversations(response.data.conversations);
        setTotalUnread(response.data.totalUnread);

        // Check for query params to start/open a conversation
        const recipientId = searchParams.get('recipientId');
        const recipientName = searchParams.get('recipientName');
        const leadId = searchParams.get('leadId');

        if (recipientId && recipientName) {
          // Look for existing conversation with this recipient
          const existingConv = response.data.conversations.find((c: Conversation) => {
            const otherParticipant = userRole === 'homeowner'
              ? c.participants.professionalId
              : c.participants.homeownerId;
            return otherParticipant?.id === recipientId;
          });

          if (existingConv) {
            // Select existing conversation
            handleSelectConversation(existingConv);
            setPendingConversation(null);
          } else {
            // Set up pending conversation for new message
            setPendingConversation({
              recipientId,
              recipientName,
              leadId: leadId || undefined,
            });
            setSelectedConversation(null);
            setMessages([]);
            setShowMobileChat(true);
          }
        } else if (response.data.conversations.length > 0 && !selectedConversation && window.innerWidth >= 768) {
          // Auto-select first conversation if on desktop and none selected
          const convId = searchParams.get('id');
          const targetConv = convId
            ? response.data.conversations.find((c: Conversation) => c.id === convId)
            : response.data.conversations[0];
          if (targetConv) {
            handleSelectConversation(targetConv);
          }
        }
      } catch (err) {
        handleApiError(err, 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [statusFilter]);

  // Setup Socket.io connection
  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) return;

    const socket = connectMessagingSocket(accessToken);
    setOnline();

    // Handler for incoming message notifications
    const handleMessageNotification = (data: { conversationId: string; message: Message }) => {
      // Refresh conversations list
      getConversations({ status: statusFilter, limit: 50 }).then((response) => {
        setConversations(response.data.conversations);
        setTotalUnread(response.data.totalUnread);
      });

      // If this message is for the currently selected conversation, add it
      if (data.conversationId === currentConversationRef.current && data.message) {
        setMessages((prev) => {
          if (prev.some(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        scrollToBottom();
        markAsRead(data.conversationId);
      }
    };

    // Handler for new messages in conversation room
    const handleNewMessage = (message: Message) => {
      if (message.conversationId === currentConversationRef.current) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some(m => m.id === message.id)) return prev;

          // Check for optimistic message to replace
          const optimisticIndex = prev.findIndex(m =>
            m.id.startsWith('temp-') &&
            m.content === message.content &&
            m.senderId.id === message.senderId.id
          );

          if (optimisticIndex !== -1) {
            const newMessages = [...prev];
            newMessages[optimisticIndex] = message;
            return newMessages;
          }

          return [...prev, message];
        });
        scrollToBottom();

        if (message.recipientId.id === user?.id) {
          markAsRead(message.conversationId);
        }
      }
    };

    // Handler for typing indicators
    const handleUserTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === currentConversationRef.current && data.userId !== user?.id) {
        setIsTyping(true);
      }
    };

    const handleUserStoppedTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === currentConversationRef.current && data.userId !== user?.id) {
        setIsTyping(false);
      }
    };

    // Handler for read receipts
    const handleMessagesRead = (data: { conversationId: string; readBy: string; readAt: Date }) => {
      if (data.conversationId === currentConversationRef.current) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId.id === user?.id && !msg.isRead
              ? { ...msg, isRead: true, readAt: data.readAt }
              : msg
          )
        );
      }
    };

    // Register event listeners
    socket.on('message:notification', handleMessageNotification);
    socket.on('message:new', handleNewMessage);
    socket.on('typing:user_typing', handleUserTyping);
    socket.on('typing:user_stopped', handleUserStoppedTyping);
    socket.on('messages:read', handleMessagesRead);

    return () => {
      socket.off('message:notification', handleMessageNotification);
      socket.off('message:new', handleNewMessage);
      socket.off('typing:user_typing', handleUserTyping);
      socket.off('typing:user_stopped', handleUserStoppedTyping);
      socket.off('messages:read', handleMessagesRead);
      if (currentConversationRef.current) {
        leaveConversation(currentConversationRef.current);
      }
    };
  }, [statusFilter, user?.id, scrollToBottom]);

  // Handle selecting a conversation
  const handleSelectConversation = useCallback(async (conversation: Conversation) => {
    if (currentConversationRef.current) {
      leaveConversation(currentConversationRef.current);
    }

    setSelectedConversation(conversation);
    currentConversationRef.current = conversation.id;
    setShowMobileChat(true);
    setMessages([]);
    setMessagesLoading(true);

    joinConversation(conversation.id);

    try {
      const response = await getMessages(conversation.id, { limit: 100 });
      // API returns newest-first, reverse for chronological display (oldest at top)
      setMessages([...response.data.messages].reverse());
      await markAsRead(conversation.id);

      // Update unread count locally
      const unreadKey = userRole === 'homeowner' ? 'homeowner' : 'professional';
      setConversations(prev => prev.map(c =>
        c.id === conversation.id
          ? { ...c, unreadCount: { ...c.unreadCount, [unreadKey]: 0 } }
          : c
      ));

      scrollToBottom();
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  }, [userRole, scrollToBottom]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!selectedConversation) return;
    const otherParticipant = getOtherParticipant(selectedConversation);
    if (!otherParticipant?.id) return;

    startTyping(selectedConversation.id, otherParticipant.id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (selectedConversation) {
        stopTyping(selectedConversation.id, otherParticipant.id);
      }
    }, 2000);
  }, [selectedConversation, getOtherParticipant]);

  // Send message
  const handleSendMessage = useCallback(async (attachments?: Attachment[]) => {
    const hasContent = newMessage.trim();
    const hasAttachments = attachments && attachments.length > 0;

    if ((!hasContent && !hasAttachments) || sending) return;

    // Handle pending conversation (new conversation from query params)
    if (pendingConversation && !selectedConversation) {
      const messageContent = newMessage.trim();
      const tempId = `temp-${crypto.randomUUID()}`;

      try {
        setSending(true);

        // Optimistically add message
        const optimisticMessage: Message = {
          id: tempId,
          conversationId: 'pending',
          senderId: {
            id: user?.id || '',
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            role: user?.role || userRole,
          },
          recipientId: {
            id: pendingConversation.recipientId,
            firstName: pendingConversation.recipientName.split(' ')[0] || '',
            lastName: pendingConversation.recipientName.split(' ').slice(1).join(' ') || '',
            email: '',
            role: userRole === 'homeowner' ? 'pro' : 'homeowner',
          },
          content: messageContent,
          attachments,
          isRead: false,
          isEdited: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setMessages([optimisticMessage]);
        setNewMessage('');
        scrollToBottom();

        // Send via HTTP API - this will create the conversation
        const response = await sendMessage({
          recipientId: pendingConversation.recipientId,
          content: messageContent,
          attachments,
          relatedLead: pendingConversation.leadId,
        });

        // Get the created conversation and select it
        if (response.data?.message?.conversationId) {
          const conversationsResponse = await getConversations({ status: 'active', limit: 50 });
          setConversations(conversationsResponse.data.conversations);
          setTotalUnread(conversationsResponse.data.totalUnread);

          const newConv = conversationsResponse.data.conversations.find(
            (c: Conversation) => c.id === response.data.message.conversationId
          );
          if (newConv) {
            setPendingConversation(null);
            handleSelectConversation(newConv);
          }
        }
      } catch (error) {
        setMessages([]);
        handleApiError(error, 'Failed to send message');
      } finally {
        setSending(false);
      }
      return;
    }

    // Regular message to existing conversation
    if (!selectedConversation) return;

    const otherParticipant = getOtherParticipant(selectedConversation);
    if (!otherParticipant?.id) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${crypto.randomUUID()}`;

    try {
      setSending(true);

      // Optimistically add message
      const optimisticMessage: Message = {
        id: tempId,
        conversationId: selectedConversation.id,
        senderId: {
          id: user?.id || '',
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          role: user?.role || userRole,
        },
        recipientId: {
          id: otherParticipant.id,
          firstName: otherParticipant.firstName,
          lastName: otherParticipant.lastName,
          email: otherParticipant.email || '',
          role: userRole === 'homeowner' ? 'pro' : 'homeowner',
        },
        content: messageContent,
        attachments,
        isRead: false,
        isEdited: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMessage('');
      scrollToBottom();

      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping(selectedConversation.id, otherParticipant.id);

      // Send via HTTP API (server will broadcast via socket)
      const response = await sendMessage({
        recipientId: otherParticipant.id,
        content: messageContent,
        attachments,
        relatedLead: selectedConversation.relatedLead?.id,
      });

      // Replace optimistic message with real one if it arrived
      if (response.data?.message) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? response.data.message : msg))
        );
      }
    } catch (error) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      handleApiError(error, 'Failed to send message');
    } finally {
      setSending(false);
    }
  }, [newMessage, sending, selectedConversation, pendingConversation, user, userRole, getOtherParticipant, scrollToBottom]);

  // Edit message
  const handleEditMessage = useCallback(async (messageId: string) => {
    if (!editContent.trim()) return;

    try {
      await editMsg(messageId, editContent.trim());
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
      handleApiError(error, 'Failed to edit message');
    }
  }, [editContent]);

  // Delete message
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!confirm('Delete this message?')) return;

    try {
      await deleteMsg(messageId);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      handleApiError(error, 'Failed to delete message');
    }
  }, []);

  // Archive conversation
  const handleArchiveConversation = useCallback(async () => {
    if (!selectedConversation || !confirm('Archive this conversation?')) return;

    try {
      await archiveConv(selectedConversation.id);
      setConversations(prev => prev.filter(c => c.id !== selectedConversation.id));
      setSelectedConversation(null);
      setShowMobileChat(false);
    } catch (error) {
      handleApiError(error, 'Failed to archive conversation');
    }
  }, [selectedConversation]);

  // Clear pending conversation (e.g., when user clicks back)
  const clearPendingConversation = useCallback(() => {
    setPendingConversation(null);
    setShowMobileChat(false);
    setMessages([]);
  }, []);

  return {
    // State
    conversations,
    selectedConversation,
    messages,
    loading,
    messagesLoading,
    sending,
    isTyping,
    totalUnread,
    searchQuery,
    statusFilter,
    newMessage,
    editingMessageId,
    editContent,
    showMobileChat,
    pendingConversation,

    // Setters
    setSearchQuery,
    setStatusFilter,
    setNewMessage,
    setEditingMessageId,
    setEditContent,
    setShowMobileChat,

    // Handlers
    handleSelectConversation,
    handleSendMessage,
    handleTyping,
    handleEditMessage,
    handleDeleteMessage,
    handleArchiveConversation,
    clearPendingConversation,

    // Helpers
    getOtherParticipant,
    getUnreadCount,
    getParticipantName,
    groupedMessages,

    // Refs
    messagesEndRef,
  };
}

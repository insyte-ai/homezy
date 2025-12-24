'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  Archive,
  Trash2,
  Edit2,
  Check,
  CheckCheck,
  ArrowLeft,
  Image as ImageIcon,
  Video,
  FileText,
  X,
  Loader2,
  Download,
  File,
} from 'lucide-react';
import { formatDistanceToNow, format, isSameDay } from 'date-fns';
import type { Conversation, Message, Attachment } from '@/lib/services/messages';
import { uploadMessageAttachment } from '@/lib/services/messages';

export type ColorScheme = 'primary' | 'blue';

// Pending new conversation state (when starting conversation from query params)
interface PendingConversation {
  recipientId: string;
  recipientName: string;
  leadId?: string;
}

// Pending attachment state
interface PendingAttachment {
  file: File;
  preview?: string;
  type: 'image' | 'video' | 'document' | 'pdf';
  uploading: boolean;
  uploaded?: Attachment;
  error?: string;
}

interface MessagesLayoutProps {
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
  groupedMessages: Record<string, Message[]>;
  currentUserId?: string;
  pendingConversation?: PendingConversation | null;

  // Setters
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: 'active' | 'archived' | 'all') => void;
  setNewMessage: (message: string) => void;
  setEditingMessageId: (id: string | null) => void;
  setEditContent: (content: string) => void;
  setShowMobileChat: (show: boolean) => void;

  // Handlers
  onSelectConversation: (conversation: Conversation) => void;
  onSendMessage: (attachments?: Attachment[]) => void;
  onTyping: () => void;
  onEditMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onArchiveConversation: () => void;
  onClearPendingConversation?: () => void;

  // Helpers
  getOtherParticipant: (conversation: Conversation) => any;
  getUnreadCount: (conversation: Conversation) => number;
  getParticipantName: (participant: any) => string;

  // Refs
  messagesEndRef: React.RefObject<HTMLDivElement | null>;

  // Config
  colorScheme: ColorScheme;
  emptyStateText?: string;
  containerClassName?: string;
}

const colorClasses = {
  primary: {
    bg: 'bg-primary-600',
    bgHover: 'hover:bg-primary-700',
    text: 'text-primary-600',
    textHover: 'hover:text-primary-700',
    textLight: 'text-primary-100',
    ring: 'focus:ring-primary-500',
    gradient: 'from-primary-500 to-primary-600',
    badge: 'bg-primary-600',
  },
  blue: {
    bg: 'bg-blue-600',
    bgHover: 'hover:bg-blue-700',
    text: 'text-blue-600',
    textHover: 'hover:text-blue-700',
    textLight: 'text-blue-100',
    ring: 'focus:ring-blue-500',
    gradient: 'from-blue-500 to-blue-600',
    badge: 'bg-blue-600',
  },
};

export function MessagesLayout({
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
  groupedMessages,
  currentUserId,
  pendingConversation,
  setSearchQuery,
  setStatusFilter,
  setNewMessage,
  setEditingMessageId,
  setEditContent,
  setShowMobileChat,
  onSelectConversation,
  onSendMessage,
  onTyping,
  onEditMessage,
  onDeleteMessage,
  onArchiveConversation,
  onClearPendingConversation,
  getOtherParticipant,
  getUnreadCount,
  getParticipantName,
  messagesEndRef,
  colorScheme,
  emptyStateText = 'No messages yet',
  containerClassName = '',
}: MessagesLayoutProps) {
  const colors = colorClasses[colorScheme];

  // Attachment state
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Get file type from file
  const getFileType = (file: File): 'image' | 'video' | 'document' | 'pdf' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type === 'application/pdf') return 'pdf';
    return 'document';
  };

  // Handle file selection
  const handleFileSelect = async (files: FileList | null, type: 'image' | 'video' | 'document') => {
    if (!files || files.length === 0) return;
    setShowAttachmentMenu(false);

    const newAttachments: PendingAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = getFileType(file);

      // Create preview for images and videos
      let preview: string | undefined;
      if (fileType === 'image' || fileType === 'video') {
        preview = URL.createObjectURL(file);
      }

      newAttachments.push({
        file,
        preview,
        type: fileType,
        uploading: true,
      });
    }

    setPendingAttachments(prev => [...prev, ...newAttachments]);
    setUploadingAttachments(true);

    // Upload all files
    const updatedAttachments = await Promise.all(
      newAttachments.map(async (attachment) => {
        try {
          const result = await uploadMessageAttachment(attachment.file);
          return {
            ...attachment,
            uploading: false,
            uploaded: {
              type: result.type,
              url: result.url,
              filename: result.filename,
              size: result.size,
            },
          };
        } catch (error: any) {
          return {
            ...attachment,
            uploading: false,
            error: error.message || 'Upload failed',
          };
        }
      })
    );

    setPendingAttachments(prev => {
      const existingCount = prev.length - newAttachments.length;
      return [...prev.slice(0, existingCount), ...updatedAttachments];
    });
    setUploadingAttachments(false);
  };

  // Remove pending attachment
  const removePendingAttachment = (index: number) => {
    setPendingAttachments(prev => {
      const attachment = prev[index];
      if (attachment.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Handle send with attachments
  const handleSendWithAttachments = () => {
    const uploadedAttachments = pendingAttachments
      .filter(a => a.uploaded && !a.error)
      .map(a => a.uploaded!);

    onSendMessage(uploadedAttachments.length > 0 ? uploadedAttachments : undefined);

    // Clean up previews
    pendingAttachments.forEach(a => {
      if (a.preview) URL.revokeObjectURL(a.preview);
    });
    setPendingAttachments([]);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Filter conversations by search query
  const filteredConversations = conversations.filter((conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    const participantName = getParticipantName(otherParticipant);
    const lastMessageContent = conversation.lastMessage?.content || '';
    const leadTitle = conversation.relatedLead?.title || '';

    return (
      participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMessageContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leadTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const selectedParticipant = selectedConversation ? getOtherParticipant(selectedConversation) : null;
  const selectedParticipantName = selectedParticipant ? getParticipantName(selectedParticipant) : '';

  return (
    <div className={`flex h-[calc(100vh-7rem)] bg-gray-100 dark:bg-gray-900 ${containerClassName}`}>
      {/* Conversations Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h1>
            {totalUnread > 0 && (
              <span className={`${colors.badge} text-white text-xs px-2 py-1 rounded-full`}>
                {totalUnread}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2 mt-3">
            {(['active', 'archived', 'all'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  statusFilter === filter
                    ? `${colors.bg} text-white`
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-${colorScheme === 'primary' ? 'primary' : 'blue'}-600`}></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No conversations found' : emptyStateText}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const unreadCount = getUnreadCount(conversation);
              const participantName = getParticipantName(otherParticipant);
              const isSelected = selectedConversation?.id === conversation.id;

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`p-4 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 ${
                    isSelected
                      ? `bg-${colorScheme === 'primary' ? 'primary' : 'blue'}-50 dark:bg-${colorScheme === 'primary' ? 'primary' : 'blue'}-900/30`
                      : unreadCount > 0
                      ? 'bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0 relative">
                      {otherParticipant.profilePhoto ? (
                        <img
                          src={otherParticipant.profilePhoto}
                          alt={participantName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white font-semibold`}>
                          {participantName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className={`font-medium truncate ${unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {participantName}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(new Date(conversation.lastMessage.sentAt), { addSuffix: false })}
                            </span>
                          )}
                        </div>
                      </div>

                      {conversation.relatedLead && (
                        <p className={`text-xs ${colors.text} dark:${colors.text.replace('600', '400')} truncate mb-0.5`}>
                          {conversation.relatedLead.title}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        {conversation.lastMessage && (
                          <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                            {conversation.lastMessage.senderId === currentUserId && 'You: '}
                            {conversation.lastMessage.content}
                          </p>
                        )}
                        {unreadCount > 0 && (
                          <span className={`${colors.badge} text-white text-xs px-2 py-0.5 rounded-full min-w-[1.25rem] text-center flex-shrink-0 ml-2`}>
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation || pendingConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowMobileChat(false);
                      if (pendingConversation && onClearPendingConversation) {
                        onClearPendingConversation();
                      }
                    }}
                    className="md:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>

                  {/* Show pending conversation header or selected conversation header */}
                  {pendingConversation && !selectedConversation ? (
                    <>
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white font-semibold`}>
                        {pendingConversation.recipientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">{pendingConversation.recipientName}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">New conversation</p>
                      </div>
                    </>
                  ) : selectedParticipant && (
                    <>
                      {selectedParticipant.profilePhoto ? (
                        <Image
                          src={selectedParticipant.profilePhoto}
                          alt={selectedParticipantName}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white font-semibold`}>
                          {selectedParticipantName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">{selectedParticipantName}</h2>
                        {isTyping ? (
                          <p className="text-xs text-green-600 dark:text-green-400">typing...</p>
                        ) : selectedConversation?.relatedLead && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                            {selectedConversation.relatedLead.title}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {selectedConversation && (
                  <button
                    onClick={onArchiveConversation}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Archive conversation"
                  >
                    <Archive className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-${colorScheme === 'primary' ? 'primary' : 'blue'}-600`}></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 max-w-3xl mx-auto">
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
                      <div className="space-y-3">
                        {msgs.map((message) => {
                          const isSender = message.senderId.id === currentUserId;

                          return (
                            <div
                              key={message.id}
                              className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[75%] ${isSender ? 'items-end' : 'items-start'}`}>
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
                                        onClick={() => onEditMessage(message.id)}
                                        className={`text-sm ${colors.text} ${colors.textHover}`}
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingMessageId(null);
                                          setEditContent('');
                                        }}
                                        className="text-sm text-gray-600 dark:text-gray-400"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    className={`group relative rounded-2xl overflow-hidden ${
                                      isSender
                                        ? `${colors.bg} text-white rounded-br-md`
                                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm rounded-bl-md'
                                    }`}
                                  >
                                    {/* Attachments */}
                                    {message.attachments && message.attachments.length > 0 && (
                                      <div className={`${message.content ? '' : ''}`}>
                                        {message.attachments.map((attachment, idx) => (
                                          <div key={idx}>
                                            {attachment.type === 'image' ? (
                                              <a
                                                href={attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block"
                                              >
                                                <img
                                                  src={attachment.url}
                                                  alt={attachment.filename}
                                                  className="max-w-[280px] max-h-[280px] object-cover rounded-t-2xl"
                                                />
                                              </a>
                                            ) : attachment.type === 'video' ? (
                                              <video
                                                src={attachment.url}
                                                controls
                                                className="max-w-[280px] max-h-[280px] rounded-t-2xl"
                                              />
                                            ) : (
                                              <a
                                                href={attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center gap-3 p-3 ${
                                                  isSender
                                                    ? 'bg-black/10 hover:bg-black/20'
                                                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                } transition-colors`}
                                              >
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                  attachment.type === 'pdf' ? 'bg-red-500' : 'bg-blue-500'
                                                }`}>
                                                  {attachment.type === 'pdf' ? (
                                                    <FileText className="w-5 h-5 text-white" />
                                                  ) : (
                                                    <File className="w-5 h-5 text-white" />
                                                  )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <p className={`text-sm font-medium truncate ${
                                                    isSender ? 'text-white' : 'text-gray-900 dark:text-white'
                                                  }`}>
                                                    {attachment.filename}
                                                  </p>
                                                  <p className={`text-xs ${
                                                    isSender ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                                                  }`}>
                                                    {formatFileSize(attachment.size)}
                                                  </p>
                                                </div>
                                                <Download className={`w-5 h-5 flex-shrink-0 ${
                                                  isSender ? 'text-white/70' : 'text-gray-400'
                                                }`} />
                                              </a>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Message content */}
                                    {message.content && (
                                      <p className="whitespace-pre-wrap break-words px-4 py-2">{message.content}</p>
                                    )}

                                    <div
                                      className={`flex items-center gap-1.5 text-xs px-4 pb-2 ${
                                        !message.content && message.attachments?.length ? 'pt-2' : ''
                                      } ${
                                        isSender ? colors.textLight : 'text-gray-500 dark:text-gray-400'
                                      }`}
                                    >
                                      <span>{format(new Date(message.createdAt), 'h:mm a')}</span>
                                      {message.isEdited && <span>(edited)</span>}
                                      {isSender && (
                                        <span>
                                          {message.isRead ? (
                                            <CheckCheck className="w-3.5 h-3.5" />
                                          ) : (
                                            <Check className="w-3.5 h-3.5" />
                                          )}
                                        </span>
                                      )}
                                    </div>

                                    {/* Message actions */}
                                    {isSender && (
                                      <div className="absolute right-0 top-0 -mr-16 opacity-0 group-hover:opacity-100 transition-opacity flex">
                                        <button
                                          onClick={() => {
                                            setEditingMessageId(message.id);
                                            setEditContent(message.content);
                                          }}
                                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                          title="Edit"
                                        >
                                          <Edit2 className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <button
                                          onClick={() => onDeleteMessage(message.id)}
                                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                          title="Delete"
                                        >
                                          <Trash2 className="w-4 h-4 text-gray-500" />
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

            {/* Message Input */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              {/* Hidden file inputs */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files, 'image')}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files, 'video')}
              />
              <input
                ref={documentInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files, 'document')}
              />

              {/* Pending attachments preview */}
              {pendingAttachments.length > 0 && (
                <div className="mb-3 max-w-3xl mx-auto">
                  <div className="flex flex-wrap gap-2">
                    {pendingAttachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="relative group bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                      >
                        {attachment.type === 'image' && attachment.preview ? (
                          <div className="w-20 h-20 relative">
                            <img
                              src={attachment.preview}
                              alt={attachment.file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : attachment.type === 'video' && attachment.preview ? (
                          <div className="w-20 h-20 relative bg-gray-800 flex items-center justify-center">
                            <Video className="w-8 h-8 text-white" />
                          </div>
                        ) : (
                          <div className="w-20 h-20 flex flex-col items-center justify-center p-2">
                            <FileText className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-center mt-1">
                              {attachment.file.name.split('.').pop()?.toUpperCase()}
                            </span>
                          </div>
                        )}

                        {/* Upload status overlay */}
                        {attachment.uploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}

                        {/* Error overlay */}
                        {attachment.error && (
                          <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                            <X className="w-6 h-6 text-white" />
                          </div>
                        )}

                        {/* Remove button */}
                        <button
                          onClick={() => removePendingAttachment(index)}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-end gap-3 max-w-3xl mx-auto">
                {/* Attachment button with menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    className={`text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0 transition-colors ${showAttachmentMenu ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  {/* Attachment menu (WhatsApp-style) */}
                  {showAttachmentMenu && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowAttachmentMenu(false)}
                      />

                      {/* Menu */}
                      <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20 min-w-[180px]">
                        <button
                          onClick={() => {
                            imageInputRef.current?.click();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-gray-900 dark:text-white font-medium">Photos</span>
                        </button>

                        <button
                          onClick={() => {
                            videoInputRef.current?.click();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
                            <Video className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-gray-900 dark:text-white font-medium">Videos</span>
                        </button>

                        <button
                          onClick={() => {
                            documentInputRef.current?.click();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-gray-900 dark:text-white font-medium">Documents</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      onTyping();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendWithAttachments();
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className={`w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 ${colors.ring} focus:border-transparent resize-none dark:bg-gray-700 dark:text-white pr-12`}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>

                <button
                  onClick={handleSendWithAttachments}
                  disabled={(!newMessage.trim() && pendingAttachments.filter(a => a.uploaded).length === 0) || sending || uploadingAttachments}
                  className={`${colors.bg} text-white p-2.5 rounded-full ${colors.bgHover} disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0`}
                >
                  {uploadingAttachments ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

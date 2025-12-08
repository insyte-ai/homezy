'use client';

import Image from 'next/image';
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
} from 'lucide-react';
import { formatDistanceToNow, format, isSameDay } from 'date-fns';
import type { Conversation, Message } from '@/lib/services/messages';

export type ColorScheme = 'primary' | 'blue';

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

  // Setters
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: 'active' | 'archived' | 'all') => void;
  setNewMessage: (message: string) => void;
  setEditingMessageId: (id: string | null) => void;
  setEditContent: (content: string) => void;
  setShowMobileChat: (show: boolean) => void;

  // Handlers
  onSelectConversation: (conversation: Conversation) => void;
  onSendMessage: () => void;
  onTyping: () => void;
  onEditMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onArchiveConversation: () => void;

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
  getOtherParticipant,
  getUnreadCount,
  getParticipantName,
  messagesEndRef,
  colorScheme,
  emptyStateText = 'No messages yet',
  containerClassName = '',
}: MessagesLayoutProps) {
  const colors = colorClasses[colorScheme];

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
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>

                  {selectedParticipant && (
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
                        ) : selectedConversation.relatedLead && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                            {selectedConversation.relatedLead.title}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={onArchiveConversation}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Archive conversation"
                >
                  <Archive className="w-5 h-5" />
                </button>
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
                                    className={`group relative px-4 py-2 rounded-2xl ${
                                      isSender
                                        ? `${colors.bg} text-white rounded-br-md`
                                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm rounded-bl-md'
                                    }`}
                                  >
                                    <p className="whitespace-pre-wrap break-words">{message.content}</p>

                                    <div
                                      className={`flex items-center gap-1.5 mt-1 text-xs ${
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
              <div className="flex items-end gap-3 max-w-3xl mx-auto">
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0">
                  <Paperclip className="w-5 h-5" />
                </button>

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
                        onSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className={`w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 ${colors.ring} focus:border-transparent resize-none dark:bg-gray-700 dark:text-white pr-12`}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>

                <button
                  onClick={onSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className={`${colors.bg} text-white p-2.5 rounded-full ${colors.bgHover} disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0`}
                >
                  <Send className="w-5 h-5" />
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

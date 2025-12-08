'use client';

import { Suspense } from 'react';
import { useMessaging } from '@/lib/hooks/useMessaging';
import { MessagesLayout } from '@/components/messaging/MessagesLayout';
import { useAuthStore } from '@/store/authStore';

// Loading component for Suspense
function MessagesLoading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );
}

// Inner component that uses useSearchParams via useMessaging
function MessagesContent() {
  const { user } = useAuthStore();
  const messaging = useMessaging({ userRole: 'homeowner' });

  return (
    <MessagesLayout
      // State
      conversations={messaging.conversations}
      selectedConversation={messaging.selectedConversation}
      messages={messaging.messages}
      loading={messaging.loading}
      messagesLoading={messaging.messagesLoading}
      sending={messaging.sending}
      isTyping={messaging.isTyping}
      totalUnread={messaging.totalUnread}
      searchQuery={messaging.searchQuery}
      statusFilter={messaging.statusFilter}
      newMessage={messaging.newMessage}
      editingMessageId={messaging.editingMessageId}
      editContent={messaging.editContent}
      showMobileChat={messaging.showMobileChat}
      groupedMessages={messaging.groupedMessages}
      currentUserId={user?.id}

      // Setters
      setSearchQuery={messaging.setSearchQuery}
      setStatusFilter={messaging.setStatusFilter}
      setNewMessage={messaging.setNewMessage}
      setEditingMessageId={messaging.setEditingMessageId}
      setEditContent={messaging.setEditContent}
      setShowMobileChat={messaging.setShowMobileChat}

      // Handlers
      onSelectConversation={messaging.handleSelectConversation}
      onSendMessage={messaging.handleSendMessage}
      onTyping={messaging.handleTyping}
      onEditMessage={messaging.handleEditMessage}
      onDeleteMessage={messaging.handleDeleteMessage}
      onArchiveConversation={messaging.handleArchiveConversation}

      // Helpers
      getOtherParticipant={messaging.getOtherParticipant}
      getUnreadCount={messaging.getUnreadCount}
      getParticipantName={messaging.getParticipantName}

      // Refs
      messagesEndRef={messaging.messagesEndRef}

      // Config
      colorScheme="primary"
      emptyStateText="No messages yet. Start a conversation by messaging a professional on your project."
      containerClassName="-mx-4 sm:-mx-6 lg:-mx-8 -my-8"
    />
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesLoading />}>
      <MessagesContent />
    </Suspense>
  );
}

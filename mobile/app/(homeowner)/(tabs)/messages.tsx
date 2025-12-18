/**
 * Messages Screen (Homeowner View)
 * Shows list of conversations with professionals
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, EmptyState } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { useMessagingStore } from '../../../src/store/messagingStore';
import { useAuthStore } from '../../../src/store/authStore';
import { Conversation } from '../../../src/services/messaging';

function ConversationItem({
  conversation,
  currentUserId,
  onPress,
}: {
  conversation: Conversation;
  currentUserId: string;
  onPress: () => void;
}) {
  // Get the other participant (professional for homeowner view)
  const otherUser = conversation.participants.professionalId;
  const displayName = otherUser.businessName || `${otherUser.firstName} ${otherUser.lastName}`;

  // Get unread count for homeowner
  const unreadCount = conversation.unreadCount.homeowner;

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins < 1 ? 'Now' : `${diffMins}m`;
    }
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const lastMessageTime = conversation.lastMessage?.timestamp
    ? formatTime(conversation.lastMessage.timestamp)
    : '';

  const isMyMessage = conversation.lastMessage?.senderId === currentUserId;

  return (
    <TouchableOpacity
      style={[styles.conversationItem, unreadCount > 0 && styles.conversationUnread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Avatar name={displayName} source={otherUser.profilePhoto} size="lg" />

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.conversationName, unreadCount > 0 && styles.textBold]} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.conversationTime}>{lastMessageTime}</Text>
        </View>

        {conversation.relatedLead && (
          <Text style={styles.relatedLead} numberOfLines={1}>
            Re: {conversation.relatedLead.title}
          </Text>
        )}

        <View style={styles.lastMessageRow}>
          <Text
            style={[styles.lastMessage, unreadCount > 0 && styles.textBold]}
            numberOfLines={1}
          >
            {isMyMessage ? 'You: ' : ''}
            {conversation.lastMessage?.content || 'No messages yet'}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MessagesScreen() {
  const { user } = useAuthStore();
  const {
    conversations,
    conversationsLoading,
    conversationsError,
    totalUnread,
    loadConversations,
    connectSocket,
    disconnectSocket,
  } = useMessagingStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Connect socket on mount
  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  // Load conversations on focus
  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadConversations();
    setIsRefreshing(false);
  };

  const handleConversationPress = (conversation: Conversation) => {
    router.push(`/(homeowner)/conversation/${conversation.id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Messages</Text>
          {totalUnread > 0 && (
            <Text style={styles.subtitle}>
              {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>

      {/* Content */}
      {conversationsLoading && conversations.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : conversationsError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorText}>{conversationsError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadConversations}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="No Messages Yet"
          description="When professionals respond to your requests, your conversations will appear here."
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationItem
              conversation={item}
              currentUserId={user?.id || ''}
              onPress={() => handleConversationPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary[500]]}
              tintColor={colors.primary[500]}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  subtitle: {
    ...textStyles.caption,
    color: colors.primary[600],
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  errorText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  retryButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...textStyles.button,
    color: '#fff',
  },
  listContent: {
    paddingVertical: spacing[2],
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
  },
  conversationUnread: {
    backgroundColor: colors.primary[50],
  },
  conversationContent: {
    flex: 1,
    marginLeft: spacing[3],
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  conversationName: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing[2],
  },
  conversationTime: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  relatedLead: {
    ...textStyles.caption,
    color: colors.primary[600],
    marginBottom: 2,
  },
  lastMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    flex: 1,
    marginRight: spacing[2],
  },
  textBold: {
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCount: {
    ...textStyles.caption,
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: layout.screenPadding + 56 + spacing[3],
  },
});

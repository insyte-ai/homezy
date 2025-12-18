/**
 * Conversation (Chat) Screen
 * Real-time messaging with a homeowner
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { useMessagingStore } from '../../../src/store/messagingStore';
import { useAuthStore } from '../../../src/store/authStore';
import { Message, Conversation, getConversations } from '../../../src/services/messaging';

function MessageBubble({
  message,
  isOwnMessage,
  showAvatar,
  otherUserName,
  otherUserPhoto,
}: {
  message: Message;
  isOwnMessage: boolean;
  showAvatar: boolean;
  otherUserName: string;
  otherUserPhoto?: string;
}) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={[styles.messageBubbleContainer, isOwnMessage && styles.ownMessageContainer]}>
      {!isOwnMessage && showAvatar && (
        <Avatar name={otherUserName} source={otherUserPhoto} size="sm" />
      )}
      {!isOwnMessage && !showAvatar && <View style={styles.avatarPlaceholder} />}

      <View
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
          ]}
        >
          {message.content}
        </Text>
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.messageTime,
              isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
            ]}
          >
            {formatTime(message.createdAt)}
          </Text>
          {isOwnMessage && (
            <Ionicons
              name={message.isRead ? 'checkmark-done' : 'checkmark'}
              size={14}
              color={message.isRead ? colors.primary[300] : 'rgba(255,255,255,0.6)'}
              style={styles.readIcon}
            />
          )}
        </View>
      </View>
    </View>
  );
}

function DateSeparator({ date }: { date: string }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <View style={styles.dateSeparator}>
      <Text style={styles.dateSeparatorText}>{formatDate(date)}</Text>
    </View>
  );
}

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const {
    messages,
    messagesLoading,
    messagesError,
    hasMoreMessages,
    typingUsers,
    loadMessages,
    sendMessage,
    markConversationAsRead,
    setActiveConversation,
    sendTypingStart,
    sendTypingStop,
  } = useMessagingStore();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // Load conversation details
  useEffect(() => {
    const loadConversation = async () => {
      try {
        const data = await getConversations({ status: 'all' });
        const conv = data.conversations.find((c) => c.id === id);
        if (conv) {
          setConversation(conv);
        }
      } catch (error) {
        console.error('Failed to load conversation:', error);
      } finally {
        setIsLoadingConversation(false);
      }
    };

    loadConversation();
  }, [id]);

  // Set active conversation and load messages
  useEffect(() => {
    if (id) {
      setActiveConversation(id);
      loadMessages(id);
      markConversationAsRead(id);
    }

    return () => {
      setActiveConversation(null);
    };
  }, [id]);

  // Get other participant info
  const otherUser = conversation?.participants.homeownerId;
  const otherUserName = otherUser
    ? `${otherUser.firstName} ${otherUser.lastName}`
    : 'Loading...';
  const otherUserId = otherUser?.id || '';

  // Check if other user is typing
  const isOtherUserTyping = typingUsers.get(id || '') === otherUserId;

  // Handle text input change
  const handleTextChange = (text: string) => {
    setInputText(text);

    // Handle typing indicators
    if (text.length > 0 && !isTypingRef.current && otherUserId && id) {
      isTypingRef.current = true;
      sendTypingStart(id, otherUserId);
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current && otherUserId && id) {
        isTypingRef.current = false;
        sendTypingStop(id, otherUserId);
      }
    }, 2000);
  };

  // Handle send message
  const handleSend = async () => {
    if (!inputText.trim() || !otherUserId || isSending) return;

    const messageContent = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Stop typing indicator
    if (isTypingRef.current && id) {
      isTypingRef.current = false;
      sendTypingStop(id, otherUserId);
    }

    try {
      await sendMessage(
        otherUserId,
        messageContent,
        conversation?.relatedLead?.id
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setInputText(messageContent); // Restore message on failure
    } finally {
      setIsSending(false);
    }
  };

  // Handle load more messages
  const handleLoadMore = () => {
    if (hasMoreMessages && !messagesLoading && id) {
      loadMessages(id, true);
    }
  };

  // Group messages by date
  const getMessagesWithDates = useCallback(() => {
    const result: Array<{ type: 'date' | 'message'; data: string | Message }> = [];
    let lastDate = '';

    messages.forEach((message, index) => {
      const messageDate = new Date(message.createdAt).toDateString();
      if (messageDate !== lastDate) {
        result.push({ type: 'date', data: message.createdAt });
        lastDate = messageDate;
      }
      result.push({ type: 'message', data: message });
    });

    return result;
  }, [messages]);

  // Check if should show avatar (first message of a sequence from same sender)
  const shouldShowAvatar = (index: number, senderId: string) => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    if (!prevMessage) return true;

    const prevSenderId =
      typeof prevMessage.senderId === 'string'
        ? prevMessage.senderId
        : prevMessage.senderId.id;

    return prevSenderId !== senderId;
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoadingConversation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerContent}>
          <Avatar
            name={otherUserName}
            source={otherUser?.profilePhoto}
            size="sm"
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {otherUserName}
            </Text>
            {conversation?.relatedLead && (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {conversation.relatedLead.title}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const senderId =
              typeof item.senderId === 'string' ? item.senderId : item.senderId.id;
            const isOwnMessage = senderId === user?.id;

            return (
              <MessageBubble
                message={item}
                isOwnMessage={isOwnMessage}
                showAvatar={!isOwnMessage && shouldShowAvatar(index, senderId)}
                otherUserName={otherUserName}
                otherUserPhoto={otherUser?.profilePhoto}
              />
            );
          }}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          inverted={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            messagesLoading && hasMoreMessages ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.primary[500]} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !messagesLoading ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color={colors.text.tertiary} />
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubtext}>Start the conversation!</Text>
              </View>
            ) : null
          }
        />

        {/* Typing Indicator */}
        {isOtherUserTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>{otherUserName} is typing...</Text>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.text.tertiary}
            value={inputText}
            onChangeText={handleTextChange}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing[2],
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  headerTitle: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  headerSubtitle: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  headerRight: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContent: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
    flexGrow: 1,
  },
  loadingMore: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[8],
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing[3],
  },
  emptySubtext: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: spacing[4],
  },
  dateSeparatorText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing[2],
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  avatarPlaceholder: {
    width: 32,
    marginRight: spacing[2],
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.lg,
  },
  ownMessageBubble: {
    backgroundColor: colors.primary[500],
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  otherMessageBubble: {
    backgroundColor: colors.background.secondary,
    borderBottomLeftRadius: 4,
    marginLeft: spacing[2],
  },
  messageText: {
    ...textStyles.body,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: colors.text.primary,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing[1],
  },
  messageTime: {
    ...textStyles.caption,
    fontSize: 10,
  },
  ownMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherMessageTime: {
    color: colors.text.tertiary,
  },
  readIcon: {
    marginLeft: spacing[1],
  },
  typingIndicator: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[2],
  },
  typingText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    paddingRight: spacing[4],
    ...textStyles.body,
    color: colors.text.primary,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing[2],
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral[300],
  },
});

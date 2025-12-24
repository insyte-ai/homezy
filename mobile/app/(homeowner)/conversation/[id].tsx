/**
 * Conversation (Chat) Screen - Homeowner View
 * Real-time messaging with a professional
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
  Image,
  Modal,
  Pressable,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Avatar } from '../../../src/components/ui';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, layout } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { useMessagingStore } from '../../../src/store/messagingStore';
import { useAuthStore } from '../../../src/store/authStore';
import {
  Message,
  Conversation,
  MessageAttachment,
  getConversations,
  uploadMessageAttachment,
} from '../../../src/services/messaging';

// Pending attachment type
interface PendingAttachment {
  uri: string;
  filename: string;
  mimeType: string;
  type: 'image' | 'video' | 'document' | 'pdf';
  uploading: boolean;
  uploaded?: MessageAttachment;
  error?: string;
}

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

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

  const handleOpenAttachment = (url: string) => {
    Linking.openURL(url);
  };

  const hasAttachments = message.attachments && message.attachments.length > 0;
  const hasContent = message.content && message.content.trim().length > 0;

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
          hasAttachments && !hasContent && styles.attachmentOnlyBubble,
        ]}
      >
        {/* Attachments */}
        {hasAttachments && (
          <View style={styles.attachmentsContainer}>
            {message.attachments.map((attachment, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleOpenAttachment(attachment.url)}
                activeOpacity={0.8}
              >
                {attachment.type === 'image' ? (
                  <Image
                    source={{ uri: attachment.url }}
                    style={styles.attachmentImage}
                    resizeMode="cover"
                  />
                ) : attachment.type === 'video' ? (
                  <View style={styles.videoAttachment}>
                    <Ionicons name="play-circle" size={48} color="#fff" />
                    <Text style={styles.videoLabel}>Video</Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.documentAttachment,
                      isOwnMessage
                        ? styles.ownDocumentAttachment
                        : styles.otherDocumentAttachment,
                    ]}
                  >
                    <View
                      style={[
                        styles.documentIcon,
                        attachment.type === 'pdf'
                          ? styles.pdfIcon
                          : styles.docIcon,
                      ]}
                    >
                      <Ionicons
                        name={attachment.type === 'pdf' ? 'document-text' : 'document'}
                        size={20}
                        color="#fff"
                      />
                    </View>
                    <View style={styles.documentInfo}>
                      <Text
                        style={[
                          styles.documentName,
                          isOwnMessage
                            ? styles.ownDocumentName
                            : styles.otherDocumentName,
                        ]}
                        numberOfLines={1}
                      >
                        {attachment.filename}
                      </Text>
                      <Text
                        style={[
                          styles.documentSize,
                          isOwnMessage
                            ? styles.ownDocumentSize
                            : styles.otherDocumentSize,
                        ]}
                      >
                        {formatFileSize(attachment.size)}
                      </Text>
                    </View>
                    <Ionicons
                      name="download-outline"
                      size={20}
                      color={isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.text.tertiary}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Message content */}
        {hasContent && (
          <Text
            style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
              hasAttachments && styles.messageTextWithAttachment,
            ]}
          >
            {message.content}
          </Text>
        )}

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
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // Get file type from mime type
  const getFileType = (mimeType: string): 'image' | 'video' | 'document' | 'pdf' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'application/pdf') return 'pdf';
    return 'document';
  };

  // Handle picking photos
  const handlePickPhoto = async () => {
    setShowAttachmentMenu(false);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      await uploadAttachments(result.assets.map((asset) => ({
        uri: asset.uri,
        filename: asset.fileName || `photo_${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
        type: 'image' as const,
        uploading: true,
      })));
    }
  };

  // Handle picking videos
  const handlePickVideo = async () => {
    setShowAttachmentMenu(false);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      await uploadAttachments([{
        uri: asset.uri,
        filename: asset.fileName || `video_${Date.now()}.mp4`,
        mimeType: asset.mimeType || 'video/mp4',
        type: 'video' as const,
        uploading: true,
      }]);
    }
  };

  // Handle picking documents
  const handlePickDocument = async () => {
    setShowAttachmentMenu(false);

    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      multiple: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      await uploadAttachments(result.assets.map((asset) => ({
        uri: asset.uri,
        filename: asset.name,
        mimeType: asset.mimeType || 'application/pdf',
        type: getFileType(asset.mimeType || 'application/pdf'),
        uploading: true,
      })));
    }
  };

  // Upload attachments
  const uploadAttachments = async (attachments: PendingAttachment[]) => {
    setPendingAttachments((prev) => [...prev, ...attachments]);
    setIsUploading(true);

    const uploadedAttachments = await Promise.all(
      attachments.map(async (attachment) => {
        try {
          const result = await uploadMessageAttachment(
            attachment.uri,
            attachment.filename,
            attachment.mimeType
          );
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

    setPendingAttachments((prev) => {
      const existingCount = prev.length - attachments.length;
      return [...prev.slice(0, existingCount), ...uploadedAttachments];
    });
    setIsUploading(false);
  };

  // Remove pending attachment
  const removePendingAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

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

  // Get other participant info (professional)
  const otherUser = conversation?.participants.professionalId;
  const otherUserName = otherUser
    ? otherUser.businessName || `${otherUser.firstName} ${otherUser.lastName}`
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
    const hasContent = inputText.trim().length > 0;
    const uploadedAttachments = pendingAttachments
      .filter((a) => a.uploaded && !a.error)
      .map((a) => a.uploaded!);
    const hasAttachments = uploadedAttachments.length > 0;

    if ((!hasContent && !hasAttachments) || !otherUserId || isSending || isUploading) return;

    const messageContent = inputText.trim();
    setInputText('');
    setPendingAttachments([]);
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
        conversation?.relatedLead?.id,
        uploadedAttachments.length > 0 ? uploadedAttachments : undefined
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

        {/* Pending Attachments Preview */}
        {pendingAttachments.length > 0 && (
          <View style={styles.pendingAttachmentsContainer}>
            {pendingAttachments.map((attachment, index) => (
              <View key={index} style={styles.pendingAttachment}>
                {attachment.type === 'image' ? (
                  <Image
                    source={{ uri: attachment.uri }}
                    style={styles.pendingAttachmentImage}
                  />
                ) : attachment.type === 'video' ? (
                  <View style={styles.pendingAttachmentVideo}>
                    <Ionicons name="videocam" size={24} color="#fff" />
                  </View>
                ) : (
                  <View style={styles.pendingAttachmentDoc}>
                    <Ionicons name="document" size={24} color={colors.primary[500]} />
                  </View>
                )}

                {/* Upload status */}
                {attachment.uploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}

                {/* Error indicator */}
                {attachment.error && (
                  <View style={styles.errorOverlay}>
                    <Ionicons name="alert-circle" size={20} color="#fff" />
                  </View>
                )}

                {/* Remove button */}
                <TouchableOpacity
                  style={styles.removeAttachmentButton}
                  onPress={() => removePendingAttachment(index)}
                >
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setShowAttachmentMenu(true)}
          >
            <Ionicons name="attach" size={24} color={colors.text.secondary} />
          </TouchableOpacity>

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
            style={[
              styles.sendButton,
              (!inputText.trim() && pendingAttachments.filter(a => a.uploaded).length === 0) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={(!inputText.trim() && pendingAttachments.filter(a => a.uploaded).length === 0) || isSending || isUploading}
          >
            {isSending || isUploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Menu Modal */}
      <Modal
        visible={showAttachmentMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAttachmentMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAttachmentMenu(false)}
        >
          <View style={styles.attachmentMenu}>
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={handlePickPhoto}
            >
              <View style={[styles.attachmentOptionIcon, { backgroundColor: '#9C27B0' }]}>
                <Ionicons name="image" size={24} color="#fff" />
              </View>
              <Text style={styles.attachmentOptionText}>Photos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={handlePickVideo}
            >
              <View style={[styles.attachmentOptionIcon, { backgroundColor: '#E91E63' }]}>
                <Ionicons name="videocam" size={24} color="#fff" />
              </View>
              <Text style={styles.attachmentOptionText}>Videos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={handlePickDocument}
            >
              <View style={[styles.attachmentOptionIcon, { backgroundColor: '#2196F3' }]}>
                <Ionicons name="document" size={24} color="#fff" />
              </View>
              <Text style={styles.attachmentOptionText}>Documents</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
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
  attachButton: {
    padding: spacing[2],
    marginRight: spacing[1],
  },
  // Attachment styles
  attachmentsContainer: {
    marginBottom: spacing[1],
  },
  attachmentImage: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: spacing[1],
  },
  videoAttachment: {
    width: 200,
    height: 150,
    borderRadius: borderRadius.md,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  videoLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: spacing[1],
  },
  documentAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[2],
    borderRadius: borderRadius.md,
    marginBottom: spacing[1],
    minWidth: 200,
  },
  ownDocumentAttachment: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  otherDocumentAttachment: {
    backgroundColor: colors.background.tertiary,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[2],
  },
  pdfIcon: {
    backgroundColor: '#EF4444',
  },
  docIcon: {
    backgroundColor: '#3B82F6',
  },
  documentInfo: {
    flex: 1,
    marginRight: spacing[2],
  },
  documentName: {
    ...textStyles.caption,
    fontWeight: '500',
  },
  ownDocumentName: {
    color: '#fff',
  },
  otherDocumentName: {
    color: colors.text.primary,
  },
  documentSize: {
    ...textStyles.caption,
    fontSize: 10,
    marginTop: 2,
  },
  ownDocumentSize: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherDocumentSize: {
    color: colors.text.tertiary,
  },
  attachmentOnlyBubble: {
    padding: spacing[1],
  },
  messageTextWithAttachment: {
    marginTop: spacing[1],
  },
  // Pending attachments
  pendingAttachmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[2],
    gap: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  pendingAttachment: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  pendingAttachmentImage: {
    width: '100%',
    height: '100%',
  },
  pendingAttachmentVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingAttachmentDoc: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(239,68,68,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Attachment menu modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  attachmentMenu: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
    paddingHorizontal: spacing[4],
  },
  attachmentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  attachmentOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
  },
  attachmentOptionText: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
});

/**
 * HomeGPT AI Chat screen
 * Real-time AI chat with streaming responses
 */

import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius } from '../../../src/theme/spacing';
import { textStyles } from '../../../src/theme/typography';
import { useChatStore, ChatMessage } from '../../../src/store/chatStore';
import { useChatSocket } from '../../../src/hooks/useChatSocket';

// Message bubble component
function MessageBubble({ message, isStreaming }: { message: ChatMessage; isStreaming?: boolean }) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
      {!isUser && (
        <View style={styles.avatarContainer}>
          <Ionicons name="sparkles" size={16} color={colors.primary[500]} />
        </View>
      )}
      <View style={[styles.messageContent, isUser ? styles.userContent : styles.assistantContent]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
        {isStreaming && (
          <View style={styles.cursorContainer}>
            <View style={styles.cursor} />
          </View>
        )}
      </View>
    </View>
  );
}

// Streaming message component
function StreamingMessage({
  content,
  toolCall,
}: {
  content: string;
  toolCall: { name: string; id: string } | null;
}) {
  return (
    <View style={[styles.messageBubble, styles.assistantBubble]}>
      <View style={styles.avatarContainer}>
        <Ionicons name="sparkles" size={16} color={colors.primary[500]} />
      </View>
      <View style={[styles.messageContent, styles.assistantContent]}>
        {toolCall && (
          <View style={styles.toolCallBadge}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
            <Text style={styles.toolCallText}>
              {formatToolName(toolCall.name)}
            </Text>
          </View>
        )}
        {content ? (
          <>
            <Text style={[styles.messageText, styles.assistantText]}>{content}</Text>
            <View style={styles.cursorContainer}>
              <View style={styles.cursor} />
            </View>
          </>
        ) : !toolCall ? (
          <View style={styles.thinkingContainer}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
            <Text style={styles.thinkingText}>Thinking...</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

// Format tool name for display
function formatToolName(name: string): string {
  const toolNames: Record<string, string> = {
    search_professionals: 'Searching professionals...',
    get_cost_estimate: 'Calculating estimate...',
    search_knowledge_base: 'Searching knowledge...',
    create_service_request: 'Creating request...',
    get_user_properties: 'Getting properties...',
    get_user_projects: 'Getting projects...',
  };
  return toolNames[name] || `Running ${name}...`;
}

// Welcome screen when no messages
function WelcomeScreen({ onSuggestionPress }: { onSuggestionPress: (text: string) => void }) {
  const suggestions = [
    'How much does AC maintenance cost?',
    'Find me a plumber in Dubai',
    'What permits do I need for a kitchen renovation?',
    'Tips for maintaining my water heater',
  ];

  return (
    <View style={styles.welcomeContainer}>
      <View style={styles.welcomeIconContainer}>
        <Ionicons name="sparkles" size={48} color={colors.primary[500]} />
      </View>
      <Text style={styles.welcomeTitle}>Welcome to HomeGPT</Text>
      <Text style={styles.welcomeSubtitle}>
        Your AI assistant for all things home-related
      </Text>

      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Try asking:</Text>
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionButton}
            onPress={() => onSuggestionPress(suggestion)}
          >
            <Ionicons name="chatbubble-outline" size={16} color={colors.primary[500]} />
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const {
    messages,
    isStreaming,
    streamingMessage,
    currentToolCall,
    isInitialized,
    error,
    initializeConversation,
    setError,
  } = useChatStore();

  const { isConnected, sendMessage } = useChatSocket();

  // Initialize conversation on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeConversation();
    }
  }, [isInitialized, initializeConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 || isStreaming) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, streamingMessage, isStreaming]);

  const handleSend = () => {
    if (!inputText.trim() || isStreaming) return;

    sendMessage(inputText.trim());
    setInputText('');
  };

  const handleSuggestionPress = (suggestion: string) => {
    if (isStreaming) return;
    sendMessage(suggestion);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <MessageBubble message={item} />
  );

  const showWelcome = messages.length === 0 && !isStreaming;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={24} color={colors.primary[500]} />
          <Text style={styles.title}>HomeGPT</Text>
        </View>
        <View style={styles.connectionStatus}>
          <View
            style={[
              styles.connectionDot,
              isConnected ? styles.connectedDot : styles.disconnectedDot,
            ]}
          />
          <Text style={styles.connectionText}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </Text>
        </View>
      </View>

      {/* Error Banner */}
      {error && (
        <TouchableOpacity style={styles.errorBanner} onPress={() => setError(null)}>
          <Ionicons name="alert-circle" size={20} color={colors.error[500]} />
          <Text style={styles.errorText}>{error}</Text>
          <Ionicons name="close" size={18} color={colors.error[300]} />
        </TouchableOpacity>
      )}

      {/* Messages or Welcome */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {showWelcome ? (
          <WelcomeScreen onSuggestionPress={handleSuggestionPress} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              isStreaming ? (
                <StreamingMessage
                  content={streamingMessage}
                  toolCall={currentToolCall}
                />
              ) : null
            }
          />
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask HomeGPT anything..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              maxLength={2000}
              editable={!isStreaming && isConnected}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isStreaming || !isConnected) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isStreaming || !isConnected}
            >
              {isStreaming ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.disclaimer}>
            HomeGPT can make mistakes. Verify important information.
          </Text>
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
    justifyContent: 'space-between',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  title: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectedDot: {
    backgroundColor: colors.success[500],
  },
  disconnectedDot: {
    backgroundColor: colors.warning[500],
  },
  connectionText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error[50],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  errorText: {
    ...textStyles.bodySmall,
    color: colors.error[700],
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesList: {
    padding: spacing[4],
    paddingBottom: spacing[2],
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: spacing[3],
    maxWidth: '100%',
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  assistantBubble: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[2],
    flexShrink: 0,
  },
  messageContent: {
    maxWidth: '80%',
    padding: spacing[3],
    borderRadius: borderRadius.lg,
  },
  userContent: {
    backgroundColor: colors.primary[500],
    borderBottomRightRadius: borderRadius.sm,
    marginLeft: 'auto',
  },
  assistantContent: {
    backgroundColor: colors.background.secondary,
    borderBottomLeftRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  messageText: {
    ...textStyles.body,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: colors.text.primary,
  },
  cursorContainer: {
    flexDirection: 'row',
    marginTop: spacing[1],
  },
  cursor: {
    width: 2,
    height: 16,
    backgroundColor: colors.primary[500],
    opacity: 0.7,
  },
  toolCallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  toolCallText: {
    ...textStyles.caption,
    color: colors.primary[700],
    fontWeight: '500',
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  thinkingText: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  // Welcome Screen
  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  welcomeIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  welcomeTitle: {
    ...textStyles.h2,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  welcomeSubtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  suggestionsContainer: {
    width: '100%',
    maxWidth: 400,
  },
  suggestionsTitle: {
    ...textStyles.label,
    color: colors.text.tertiary,
    marginBottom: spacing[3],
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing[2],
    gap: spacing[3],
  },
  suggestionText: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
  },
  // Input Area
  inputContainer: {
    padding: spacing[4],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingLeft: spacing[4],
    paddingRight: spacing[2],
    paddingVertical: spacing[2],
  },
  input: {
    flex: 1,
    ...textStyles.body,
    color: colors.text.primary,
    maxHeight: 100,
    paddingVertical: spacing[2],
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.primary[300],
  },
  disclaimer: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing[2],
  },
});

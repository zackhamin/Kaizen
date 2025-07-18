import { colors, theme } from '@/constants/theme';
import { useCBTChat } from '@/hooks/useCBTChat';
import { CBTMessage } from '@/services/cbt.service.modern';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { StackScreen } from '../Layout/StackScreen';

interface CBTChatProps {
  conversationId: string;
  onBack?: () => void;
}

export function CBTChat({ conversationId, onBack }: CBTChatProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  const {
    messages,
    inputText,
    setInputText,
    isLoading,
    isLoadingHistory,
    sendMessage,
    flatListRef,
  } = useCBTChat({ conversationId });

  // Keyboard listeners for better Android support
  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    
    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardShowListener?.remove();
      keyboardHideListener?.remove();
    };
  }, []);

  const handleSend = useCallback(async () => {
    await sendMessage();
    Keyboard.dismiss();
  }, [sendMessage]);

  const renderMessage = useCallback(({ item }: { item: CBTMessage }) => (
    <View style={[
      styles.messageContainer,
      item.role === 'user' ? styles.userMessage : styles.assistantMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.role === 'user' ? styles.userBubble : styles.assistantBubble,
        item.metadata?.isTemporary && styles.temporaryMessage,
        item.metadata?.isLoading && styles.loadingMessage
      ]}>
        {item.metadata?.isLoading ? (
          <View style={styles.loadingMessageContent}>
            <ActivityIndicator size="small" color={colors.glass.text.secondary} />
            <Text style={styles.loadingMessageText}>Thinking...</Text>
          </View>
        ) : (
          <Text style={[
            styles.messageText,
            item.role === 'user' ? styles.userText : styles.assistantText,
            item.metadata?.isTemporary && styles.temporaryText
          ]}>
            {item.content}
          </Text>
        )}
        {item.metadata?.isTemporary && (
          <View style={styles.sendingIndicator}>
            <ActivityIndicator size="small" color={colors.glass.text.muted} />
            <Text style={styles.sendingText}>Sending...</Text>
          </View>
        )}
      </View>
      <Text style={styles.timestamp}>
        {new Date(item.created_at).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  ), []);

  const keyExtractor = useCallback((item: CBTMessage) => item.id, []);

  if (isLoadingHistory) {
    return (
      <StackScreen title="CBT Session" onBack={onBack}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.white} />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
        </StackScreen>
    );
  }

  return (
    <StackScreen title="CBT Session" onBack={onBack}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={keyExtractor}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={[
            styles.messagesContent,
            messages.length === 0 && styles.emptyMessagesContent
          ]}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          ListEmptyComponent={
            <View style={styles.emptyMessagesContainer}>
              <Ionicons 
                name="chatbubbles-outline" 
                size={48} 
                color={colors.glass.text.placeholder} 
              />
              <Text style={styles.emptyMessagesText}>
                Start your CBT session by typing a message below
              </Text>
              <Text style={styles.emptyMessagesSubtext}>
                Share what's on your mind, and I'll help guide you through it
              </Text>
            </View>
          }
        />
        
        {/* Input Area */}
        <View style={[
          styles.inputContainer,
          Platform.OS === 'android' && keyboardHeight > 0 && { paddingBottom: 8 }
        ]}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor={colors.glass.text.placeholder}
            multiline
            maxLength={1000}
            editable={!isLoading}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={isLoading || !inputText.trim()}
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.accent.white} />
            ) : (
              <Ionicons name="send" size={20} color={colors.accent.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: colors.accent.white,
    fontWeight: theme.typography.weights.medium,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  emptyMessagesContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyMessagesText: {
    marginTop: theme.spacing.md,
    fontSize: 18,
    color: colors.glass.text.primary,
    textAlign: 'center',
    fontWeight: theme.typography.weights.medium,
  },
  emptyMessagesSubtext: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    color: colors.glass.text.muted,
    textAlign: 'center',
    fontWeight: theme.typography.weights.regular,
  },
  messageContainer: {
    marginBottom: theme.spacing.md,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 4,
    borderRadius: theme.borderRadius.large * 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: colors.glass.userBubble,
    borderBottomRightRadius: theme.borderRadius.small,
  },
  assistantBubble: {
    backgroundColor: colors.glass.assistantBubble,
    borderBottomLeftRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
  },
  temporaryMessage: {
    opacity: theme.opacity.muted,
  },
  loadingMessage: {
    opacity: 0.9,
  },
  loadingMessageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  loadingMessageText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.glass.text.secondary,
    fontStyle: 'italic',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: theme.typography.weights.regular,
  },
  userText: {
    color: colors.glass.text.primary,
  },
  assistantText: {
    color: colors.glass.text.primary,
  },
  temporaryText: {
    fontStyle: 'italic',
  },
  sendingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  sendingText: {
    marginLeft: theme.spacing.sm,
    fontSize: 12,
    color: colors.glass.text.muted,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 12,
    color: colors.glass.text.placeholder,
    marginTop: theme.spacing.xs,
    marginHorizontal: theme.spacing.sm,
    fontWeight: theme.typography.weights.regular,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 4,
    paddingBottom: 70,
    borderTopWidth: 1,
    borderTopColor: colors.glass.overlayBorder,
    backgroundColor: colors.glass.overlay,
    marginHorizontal: -theme.spacing.lg, // Compensate for StackScreen padding
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.glass.inputBorder,
    borderRadius: theme.borderRadius.large * 2.5,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 4,
    marginRight: theme.spacing.sm,
    maxHeight: 100,
    minHeight: 44,
    fontSize: 16,
    color: colors.glass.text.primary,
    backgroundColor: colors.glass.inputBackground,
    fontWeight: theme.typography.weights.regular,
  },
  sendButton: {
    backgroundColor: colors.primary.main,
    borderRadius: theme.borderRadius.large * 2.5,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: colors.glass.buttonDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
});
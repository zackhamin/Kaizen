// hooks/useCBTChat.ts
import { cbtService, type Message } from '@/services/cbt.service';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

interface UseCBTChatProps {
  conversationId: string;
}

interface UseCBTChatReturn {
  messages: Message[];
  inputText: string;
  setInputText: (text: string) => void;
  isLoading: boolean;
  isLoadingHistory: boolean;
  sendMessage: () => Promise<void>;
  scrollToEnd: (animated?: boolean) => void;
  flatListRef: React.RefObject<any>;
  refresh: () => Promise<void>;
}

export const useCBTChat = ({ conversationId }: UseCBTChatProps): UseCBTChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  const flatListRef = useRef<any>(null);

  // Load messages for the conversation
  const loadMessages = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const msgs = await cbtService.getConversationMessages(conversationId);
      setMessages(msgs);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load conversation history');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [conversationId]);

  // Scroll to end of messages
  const scrollToEnd = useCallback((animated = true) => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated });
    }, 100);
  }, []);

  // Send a new message
  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    const tempId = `temp-${Date.now()}`;
    const aiTempId = `ai-temp-${Date.now()}`;
    
    // Add temporary user message for immediate UI feedback
    const tempUserMsg: Message = {
      id: tempId,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
      metadata: {
        isTemporary: true
      }
    };

    // Add temporary AI message for loading state
    const tempAiMsg: Message = {
      id: aiTempId,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
      metadata: {
        isLoading: true
      }
    };

    setMessages(prev => [...prev, tempUserMsg, tempAiMsg]);
    setInputText('');
    setIsLoading(true);
    scrollToEnd();

    try {
      // Send message to service and get AI response
      const aiResponse = await cbtService.sendMessage(conversationId, userMessage);
      
      // Update the temporary AI message with the real response
      setMessages(prev => prev.map(msg => 
        msg.id === aiTempId 
          ? { ...msg, content: aiResponse, metadata: { isTemporary: false } }
          : msg.id === tempId
          ? { ...msg, metadata: { isTemporary: false } }
          : msg
      ));
      
      scrollToEnd();
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove temporary messages on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId && msg.id !== aiTempId));
      
      Alert.alert('Error', 'Failed to send message. Please try again.');
      
      // Restore input text so user can try again
      setInputText(userMessage);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, conversationId, scrollToEnd]);

  // Refresh messages
  const refresh = useCallback(async () => {
    await loadMessages();
    scrollToEnd(false);
  }, [loadMessages, scrollToEnd]);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId, loadMessages]);

  // Auto-scroll when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      scrollToEnd(false);
    }
  }, [messages.length, scrollToEnd]);

  return {
    messages,
    inputText,
    setInputText,
    isLoading,
    isLoadingHistory,
    sendMessage,
    scrollToEnd,
    flatListRef,
    refresh,
  };
};
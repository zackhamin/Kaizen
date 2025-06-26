import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { CBTConversation, CBTMessage, cbtService } from '../../services/cbt.service.modern';

interface UseCBTChatProps {
  conversationId: string;
}

interface UseCBTChatReturn {
  messages: CBTMessage[];
  inputText: string;
  setInputText: (text: string) => void;
  isLoading: boolean;
  isLoadingHistory: boolean;
  sendMessage: () => Promise<void>;
  scrollToEnd: (animated?: boolean) => void;
  flatListRef: React.RefObject<any>;
  refresh: () => Promise<void>;
}

// Query keys
export const queryKeys = {
  conversations: ['cbt', 'conversations'] as const,
  conversation: (conversationId: string) => ['cbt', 'conversation', conversationId] as const,
  messages: (conversationId: string) => ['cbt', 'messages', conversationId] as const,
};

// Hook for fetching CBT conversations
export function useCBTConversations() {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: () => cbtService.getConversations(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook for fetching a specific conversation
export function useCBTConversation(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.conversation(conversationId),
    queryFn: () => cbtService.getConversation(conversationId),
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook for fetching messages in a conversation
export function useCBTMessages(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: () => cbtService.getConversationMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 1000 * 60, // 1 minute - less aggressive for messages
  });
}

// Hook for creating a new conversation
export function useCreateCBTConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (title: string) => cbtService.createConversation(title),
    onSuccess: (newConversation) => {
      // Optimistically add to conversations list
      queryClient.setQueryData(
        queryKeys.conversations,
        (oldData: CBTConversation[] | undefined) => {
          if (!oldData) return [newConversation];
          return [newConversation, ...oldData];
        }
      );
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

// Hook for adding a message to a conversation
export function useAddCBTMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      conversationId, 
      content, 
      role = 'user' 
    }: { 
      conversationId: string; 
      content: string; 
      role?: 'user' | 'assistant'; 
    }) => cbtService.addMessage(conversationId, content, role),
    onSuccess: (newMessage, { conversationId }) => {
      // Optimistically add message to the conversation
      queryClient.setQueryData(
        queryKeys.messages(conversationId),
        (oldData: CBTMessage[] | undefined) => {
          if (!oldData) return [newMessage];
          return [...oldData, newMessage];
        }
      );
      
      // Update conversation's updated_at timestamp in the list
      queryClient.setQueryData(
        queryKeys.conversations,
        (oldData: CBTConversation[] | undefined) => {
          if (!oldData) return oldData;
          
          return oldData.map(conversation => 
            conversation.id === conversationId
              ? { 
                  ...conversation, 
                  updated_at: new Date().toISOString(),
                  message_count: (conversation.message_count || 0) + 1
                }
              : conversation
          );
        }
      );
      
      // Update the specific conversation cache
      queryClient.setQueryData(
        queryKeys.conversation(conversationId),
        (oldData: CBTConversation | undefined) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            updated_at: new Date().toISOString(),
            message_count: (oldData.message_count || 0) + 1
          };
        }
      );
      
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation(conversationId) });
    },
  });
}

// Hook for deleting a conversation
export function useDeleteCBTConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (conversationId: string) => cbtService.deleteConversation(conversationId),
    onSuccess: (_, conversationId) => {
      // Remove from conversations list
      queryClient.setQueryData(
        queryKeys.conversations,
        (oldData: CBTConversation[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter(conversation => conversation.id !== conversationId);
        }
      );
      
      // Remove conversation and messages caches
      queryClient.removeQueries({ queryKey: queryKeys.conversation(conversationId) });
      queryClient.removeQueries({ queryKey: queryKeys.messages(conversationId) });
      
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

// Hook for updating conversation title
export function useUpdateCBTConversationTitle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      conversationId, 
      title 
    }: { 
      conversationId: string; 
      title: string; 
    }) => cbtService.updateConversationTitle(conversationId, title),
    onSuccess: (updatedConversation) => {
      // Update in conversations list
      queryClient.setQueryData(
        queryKeys.conversations,
        (oldData: CBTConversation[] | undefined) => {
          if (!oldData) return oldData;
          
          return oldData.map(conversation => 
            conversation.id === updatedConversation.id
              ? updatedConversation
              : conversation
          );
        }
      );
      
      // Update specific conversation cache
      queryClient.setQueryData(
        queryKeys.conversation(updatedConversation.id),
        updatedConversation
      );
      
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation(updatedConversation.id) });
    },
  });
}

export const useCBTChat = ({ conversationId }: UseCBTChatProps): UseCBTChatReturn => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<any>(null);
  
  // Use React Query hooks instead of local state
  const { data: messages = [], isLoading: isLoadingHistory } = useCBTMessages(conversationId);
  const addMessageMutation = useAddCBTMessage();
  const queryClient = useQueryClient();
  
  // Scroll to end of messages
  const scrollToEnd = useCallback((animated = true) => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated });
    }, 100);
  }, []);

  // Send a new message
  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isSending) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsSending(true);
    
    try {
      // Use the service method that handles both user message and AI response
      await cbtService.sendMessage(conversationId, userMessage);
      
      // Invalidate the messages query to refetch the updated conversation
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });
      
      scrollToEnd();
      
    } catch (error) {
      console.error('Error sending message:', error);
      setInputText(userMessage); // Restore on error
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [inputText, conversationId, isSending, scrollToEnd, queryClient]);

  // Refresh messages
  const refresh = useCallback(async () => {
    // React Query handles this automatically via refetch
    scrollToEnd(false);
  }, [scrollToEnd]);

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
    isLoading: isSending,
    isLoadingHistory,
    sendMessage,
    scrollToEnd,
    flatListRef,
    refresh,
  };
};
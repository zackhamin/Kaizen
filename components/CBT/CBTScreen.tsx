import { colors, theme } from '@/constants/theme';
import { useCBTConversations, useCreateCBTConversation } from '@/hooks/useCBTChat';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import GradientBackground from '../Layout/GradientBackground';
import { CBTChat } from './CBTChat';

export function CBTScreen() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [moodBefore, setMoodBefore] = useState(5);
  
  // Use React Query hooks instead of local state
  const { data: conversations = [], isLoading, refetch } = useCBTConversations();
  const createConversationMutation = useCreateCBTConversation();

  const startNewSession = async () => {
    try {
      const conversation = await createConversationMutation.mutateAsync('New CBT Session');
      setSelectedConversation(conversation.id);
      setShowNewSessionModal(false);
      setMoodBefore(5);
    } catch (error) {
      console.error('Error starting session:', error);
      Alert.alert('Error', 'Failed to start new session. Please try again.');
    }
  };

  const handleConversationPress = useCallback((conversationId: string) => {
    setSelectedConversation(conversationId);
  }, []);

  const handleBackFromChat = useCallback(() => {
    setSelectedConversation(null);
    // React Query will automatically refetch when needed
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }, []);

  const renderConversation = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.conversationHeader}>
        <Text style={styles.conversationTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.conversationDate}>
          {formatDate(item.created_at)}
        </Text>
      </View>
      
      <View style={styles.conversationMeta}>
        <View style={styles.messageCountContainer}>
          <Ionicons name="chatbubble-outline" size={16} color={colors.primary.light} />
          <Text style={styles.messageCountText}>
            {item.message_count || 0} messages
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleConversationPress, formatDate]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  if (selectedConversation) {
    return (
      <CBTChat
        conversationId={selectedConversation}
        onBack={handleBackFromChat}
      />
    );
  }

  if (isLoading) {
    return (
      <GradientBackground showHeader={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.white} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground showHeader={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>CBT Sessions</Text>
        <TouchableOpacity
          style={styles.addButtonInline}
          onPress={() => setShowNewSessionModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonInlineText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.glass.text.placeholder} />
          <Text style={styles.emptyTitle}>No sessions yet</Text>
          <Text style={styles.emptySubtitle}>
            Start your first CBT session to begin your mental health journey
          </Text>
          <TouchableOpacity
            style={styles.startFirstSessionButton}
            onPress={() => setShowNewSessionModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.startFirstSessionText}>Start First Session</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={keyExtractor}
          renderItem={renderConversation}
          contentContainerStyle={styles.conversationsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={colors.accent.white}
              colors={[colors.primary.main]}
            />
          }
        />
      )}

      {/* New Session Modal */}
      <Modal
        visible={showNewSessionModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <GradientBackground showHeader={false}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowNewSessionModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.accent.white} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Start New Session</Text>
            </View>

            <View style={styles.modalContent}>

              <TouchableOpacity
                style={[
                  styles.startSessionButton,
                  createConversationMutation.isPending && styles.startSessionButtonDisabled
                ]}
                onPress={startNewSession}
                disabled={createConversationMutation.isPending}
                activeOpacity={0.8}
              >
                {createConversationMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.accent.white} />
                ) : (
                  <Text style={styles.startSessionText}>Start Session</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </GradientBackground>
      </Modal>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
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
  headerTitle: {
    fontSize: 20,
    fontWeight: theme.typography.weights.bold,
    color: colors.glass.text.primary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    marginTop: 4,
    marginHorizontal: 12,
  },
  addButtonInline: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    width: 56,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonInlineText: {
    color: colors.accent.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: theme.typography.weights.semibold,
    color: colors.glass.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.glass.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
    fontWeight: theme.typography.weights.regular,
  },
  startFirstSessionButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 4,
    borderRadius: theme.borderRadius.large,
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  startFirstSessionText: {
    color: colors.accent.white,
    fontSize: 16,
    fontWeight: theme.typography.weights.semibold,
  },
  conversationsList: {
    padding: theme.spacing.md,
  },
  conversationItem: {
    backgroundColor: colors.glass.conversationCard,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm + 4,
    borderWidth: 1,
    borderColor: colors.glass.conversationBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semibold,
    color: colors.glass.text.primary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  conversationDate: {
    fontSize: 14,
    color: colors.glass.text.muted,
    fontWeight: theme.typography.weights.regular,
  },
  conversationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageCountText: {
    fontSize: 14,
    color: colors.glass.text.muted,
    marginLeft: theme.spacing.xs,
    fontWeight: theme.typography.weights.regular,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg - 4,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.overlayBorder,
    backgroundColor: colors.glass.overlay,
  },
  modalCloseButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.medium,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: theme.typography.weights.semibold,
    color: colors.glass.text.primary,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  startSessionButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.large,
    marginTop: theme.spacing.xl,
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  startSessionButtonDisabled: {
    backgroundColor: colors.glass.buttonDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  startSessionText: {
    color: colors.accent.white,
    fontSize: 16,
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
  },
});
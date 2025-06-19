import { colors, theme } from '@/constants/theme';
import { cbtService, type Conversation } from '@/services/cbt.service';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
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
import { QuestionCard } from '../Cards/QuestionCard';
import GradientBackground from '../Layout/GradientBackground';
import { CBTChat } from './CBTChat';

export function CBTScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [moodBefore, setMoodBefore] = useState(5);
  const [startingSession, setStartingSession] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const convos = await cbtService.getUserConversations();
      setConversations(convos);
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadConversations();
    } finally {
      setRefreshing(false);
    }
  }, [loadConversations]);

  const startNewSession = async () => {
    try {
      setStartingSession(true);
      const conversation = await cbtService.startConversation('general', moodBefore);
      setConversations(prev => [conversation, ...prev]);
      setSelectedConversation(conversation.id);
      setShowNewSessionModal(false);
      setMoodBefore(5);
    } catch (error) {
      console.error('Error starting session:', error);
      Alert.alert('Error', 'Failed to start new session. Please try again.');
    } finally {
      setStartingSession(false);
    }
  };

  const handleConversationPress = useCallback((conversationId: string) => {
    setSelectedConversation(conversationId);
  }, []);

  const handleBackFromChat = useCallback(() => {
    setSelectedConversation(null);
    // Refresh conversations when returning from chat to see any updates
    loadConversations();
  }, [loadConversations]);

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

  const renderConversation = useCallback(({ item }: { item: Conversation }) => (
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
        <View style={styles.moodContainer}>
          <Ionicons name="heart" size={16} color={colors.primary.light} />
          <Text style={styles.moodText}>
            {item.mood_before ? `Mood: ${item.mood_before}/10` : 'No mood recorded'}
          </Text>
        </View>
        
        <View style={styles.sessionTypeContainer}>
          <Text style={styles.sessionType}>{item.session_type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleConversationPress, formatDate]);

  const keyExtractor = useCallback((item: Conversation) => item.id, []);

  if (selectedConversation) {
    return (
      <CBTChat
        conversationId={selectedConversation}
        onBack={handleBackFromChat}
      />
    );
  }

  if (loading) {
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CBT Sessions</Text>
        <TouchableOpacity
          style={styles.newSessionButton}
          onPress={() => setShowNewSessionModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color={colors.accent.white} />
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
              refreshing={refreshing}
              onRefresh={onRefresh}
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
                style={styles.closeButton}
                disabled={startingSession}
              >
                <Ionicons name="close" size={24} color={colors.glass.text.primary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New CBT Session</Text>
              <View style={styles.modalSpacer} />
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalSubtitle}>
                How are you feeling right now?
              </Text>
              <Text style={styles.modalDescription}>
                Rate your current mood on a scale from 1 (very low) to 10 (excellent)
              </Text>
              
              <QuestionCard
                question=""
                initialValue={moodBefore}
                onValueChange={setMoodBefore}
                showLabels={false}
                transparent={true}
              />

              <View style={styles.moodLabels}>
                <Text style={styles.moodLabel}>Very Low</Text>
                <Text style={styles.moodLabel}>Excellent</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.startSessionButton,
                  startingSession && styles.startSessionButtonDisabled
                ]}
                onPress={startNewSession}
                disabled={startingSession}
                activeOpacity={0.8}
              >
                {startingSession ? (
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg - 4,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.overlayBorder,
    backgroundColor: colors.glass.overlay,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    color: colors.glass.text.primary,
  },
  newSessionButton: {
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
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodText: {
    fontSize: 14,
    color: colors.glass.text.muted,
    marginLeft: theme.spacing.xs,
    fontWeight: theme.typography.weights.regular,
  },
  sessionTypeContainer: {
    backgroundColor: colors.glass.sessionType,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.large,
  },
  sessionType: {
    fontSize: 12,
    color: colors.glass.text.primary,
    fontWeight: theme.typography.weights.medium,
    textTransform: 'capitalize',
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
  closeButton: {
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
  modalSpacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  modalSubtitle: {
    fontSize: 18,
    color: colors.glass.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    fontWeight: theme.typography.weights.medium,
  },
  modalDescription: {
    fontSize: 14,
    color: colors.glass.text.secondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: theme.typography.weights.regular,
  },
  moodLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  moodLabel: {
    fontSize: 12,
    color: colors.glass.text.muted,
    fontWeight: theme.typography.weights.regular,
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
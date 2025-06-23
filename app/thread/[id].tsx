import { ConnectionStatus } from '@/components/Chat/ConnectionStatus';
import GradientBackground from '@/components/Layout/GradientBackground';
import { colors, theme } from '@/constants/theme';
import { useRealtimeThreadReplies } from '@/hooks/useRealTimeChat';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { ChatReply, ChatThread, CommunityService } from '../../services/community.service';

const communityService = new CommunityService();

export default function ThreadDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const flatListRef = useRef<FlatList>(null);
  
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [initialReplies, setInitialReplies] = useState<ChatReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [postingReply, setPostingReply] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);

  // Use real-time hook for live reply updates
  const { replies, isConnected } = useRealtimeThreadReplies(id!, initialReplies);

  useEffect(() => {
    if (id) {
      loadThreadData();
    }
  }, [id]);

  // Cache user session to prevent unnecessary auth calls
  useEffect(() => {
    const getUserSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUserSession(user);
      } catch (error) {
        console.error('Error getting user session:', error);
      }
    };
    getUserSession();
  }, []);

  // Debug logging for real-time updates
  useEffect(() => {
    console.log('Thread screen - replies count:', replies.length);
    console.log('Thread screen - isConnected:', isConnected);
  }, [replies.length, isConnected]);

  // Auto-scroll to bottom when new replies arrive
  useEffect(() => {
    if (replies.length > initialReplies.length && !loading) {
      console.log('Auto-scrolling to new reply - replies:', replies.length, 'initial:', initialReplies.length);
      // Small delay to ensure the new item is rendered
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 300); // Increased delay to ensure real-time update is processed
    }
  }, [replies.length, initialReplies.length, loading]);

  const loadThreadData = async () => {
    try {
      setLoading(true);
      const data = await communityService.getThreadDetail(id!);
      setThread(data.thread);
      setInitialReplies(data.replies); // This will trigger real-time updates
    } catch (error) {
      console.error('Error loading thread data:', error);
      Alert.alert('Error', 'Failed to load thread');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadThreadData();
    setRefreshing(false);
  };

  const handlePostReply = async () => {
    if (!replyText.trim()) {
      Alert.alert('Empty Reply', 'Please enter a reply');
      return;
    }

    if (!id) {
      Alert.alert('Error', 'Thread not found');
      return;
    }

    console.log('Posting reply - current replies count:', replies.length);
    console.log('Posting reply - connection status:', isConnected);

    try {
      setPostingReply(true);
      
      // Clear input immediately for better UX
      const currentReplyText = replyText.trim();
      setReplyText('');
      
      // Actually post the reply - real-time will handle the UI update
      const newReply = await communityService.createReply(id, currentReplyText);
      console.log('Reply created successfully:', newReply.id);
      
      // Don't manually scroll here - let the real-time auto-scroll handle it
      // The real-time update will trigger the useEffect above
      
    } catch (error: any) {
      console.error('Error posting reply:', error);
      
      if (error.message?.includes('alias not found')) {
        Alert.alert(
          'Profile Incomplete',
          'Please complete your profile setup to reply anonymously.',
          [
            {
              text: 'Complete Profile',
              onPress: () => router.push('/settings')
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to post reply. Please try again.');
      }
    } finally {
      setPostingReply(false);
    }
  };

  const handleReaction = async (contentType: 'thread' | 'reply', contentId: string, reactionType: string) => {
    try {
      // Optimistic update for immediate UI feedback
      if (contentType === 'thread' && thread) {
        setThread(prev => prev ? {
          ...prev,
          reaction_count: (prev.reaction_count || 0) + 1
        } : null);
      } else if (contentType === 'reply') {
        setInitialReplies(prev => prev.map(reply => 
          reply.id === contentId 
            ? { ...reply, reaction_count: (reply.reaction_count || 0) + 1 }
            : reply
        ));
      }

      // Actually add the reaction
      await communityService.addReaction(contentType, contentId, reactionType);
      
      // Note: Real-time updates will handle the actual count updates
      // We don't need to manually refresh here
    } catch (error) {
      console.error('Error adding reaction:', error);
      
      // Revert optimistic update on error
      if (contentType === 'thread' && thread) {
        setThread(prev => prev ? {
          ...prev,
          reaction_count: Math.max(0, (prev.reaction_count || 0) - 1)
        } : null);
      } else if (contentType === 'reply') {
        setInitialReplies(prev => prev.map(reply => 
          reply.id === contentId 
            ? { ...reply, reaction_count: Math.max(0, (reply.reaction_count || 0) - 1) }
            : reply
        ));
      }
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const renderThreadHeader = () => {
    if (!thread) return null;

    return (
      <View style={styles.threadContainer}>
        <View style={styles.threadHeader}>
          <View style={styles.authorInfo}>
            <Text style={styles.author}>u/{thread.alias_username}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(thread.created_at)}</Text>
            {thread.is_pinned && (
              <>
                <Text style={styles.separator}>•</Text>
                <View style={styles.pinnedBadge}>
                  <Ionicons name="pin" size={10} color={colors.accent.copper} />
                  <Text style={styles.pinnedText}>PINNED</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <Text style={styles.threadTitle}>{thread.title}</Text>
        <Text style={styles.threadContent}>{thread.content}</Text>

        <View style={styles.threadActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleReaction('thread', thread.id, 'upvote')}
          >
            <Ionicons name="arrow-up" size={16} color={colors.glass.text.secondary} />
            <Text style={styles.actionText}>{thread.reaction_count || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.glass.text.secondary} />
            <Text style={styles.actionText}>{replies.length}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={16} color={colors.glass.text.secondary} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderReply = ({ item: reply }: { item: ChatReply }) => {
    const isOptimistic = reply.id.startsWith('temp-');
    
    return (
      <View style={[
        styles.replyContainer,
        isOptimistic && styles.optimisticReply
      ]}>
        <View style={styles.replyHeader}>
          <Text style={styles.replyAuthor}>u/{reply.alias_username}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.replyTime}>{formatTimeAgo(reply.created_at)}</Text>
          {isOptimistic && (
            <View style={styles.sendingIndicator}>
              <ActivityIndicator size="small" color={colors.glass.text.muted} />
              <Text style={styles.sendingText}>Sending...</Text>
            </View>
          )}
        </View>
        
        <Text style={[
          styles.replyContent,
          isOptimistic && styles.optimisticText
        ]}>
          {reply.content}
        </Text>
        
        {!isOptimistic && (
          <View style={styles.replyActions}>
            <TouchableOpacity 
              style={styles.replyActionButton}
              onPress={() => handleReaction('reply', reply.id, 'upvote')}
            >
              <Ionicons name="arrow-up" size={14} color={colors.glass.text.secondary} />
              <Text style={styles.replyActionText}>{reply.reaction_count || 0}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.replyActionButton}>
              <Ionicons name="chatbubble-outline" size={14} color={colors.glass.text.secondary} />
              <Text style={styles.replyActionText}>Reply</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderReplyInput = () => (
    <View style={styles.replyInputContainer}>
      <TextInput
        style={styles.replyInput}
        placeholder="Add a reply..."
        placeholderTextColor={colors.glass.text.muted}
        value={replyText}
        onChangeText={setReplyText}
        multiline={true}
        maxLength={1000}
      />
      <TouchableOpacity 
        style={[
          styles.sendButton,
          { opacity: replyText.trim() ? 1 : 0.5 }
        ]}
        onPress={handlePostReply}
        disabled={!replyText.trim() || postingReply}
      >
        {postingReply ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="send" size={16} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <GradientBackground showHeader={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.glass.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.glass.text.primary} />
          <Text style={styles.loadingText}>Loading thread...</Text>
        </View>
      </GradientBackground>
    );
  }

  if (!thread) {
    return (
      <GradientBackground showHeader={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.glass.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thread Not Found</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Thread not found</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground showHeader={false}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.glass.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Discussion</Text>
            <ConnectionStatus isConnected={isConnected} />
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <FlatList
          ref={flatListRef}
          data={replies}
          renderItem={renderReply}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderThreadHeader}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />

        {renderReplyInput()}
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: 60,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.overlayBorder,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginRight: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.glass.text.primary,
    marginBottom: 4,
  },
  headerSpacer: {
    width: 40,
  },
  listContainer: {
    paddingBottom: 100,
  },
  threadContainer: {
    backgroundColor: colors.glass.overlay,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
  },
  threadHeader: {
    marginBottom: theme.spacing.md,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  author: {
    fontSize: 14,
    color: colors.glass.text.secondary,
    fontWeight: '500',
  },
  separator: {
    fontSize: 14,
    color: colors.glass.text.muted,
    marginHorizontal: 6,
  },
  timeAgo: {
    fontSize: 14,
    color: colors.glass.text.secondary,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 146, 60, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.small,
  },
  pinnedText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.accent.copper,
    marginLeft: 2,
  },
  threadTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.glass.text.primary,
    lineHeight: 28,
    marginBottom: theme.spacing.md,
  },
  threadContent: {
    fontSize: 16,
    color: colors.glass.text.secondary,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  threadActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.glass.overlayBorder,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: colors.glass.text.secondary,
    fontWeight: '500',
  },
  replyContainer: {
    backgroundColor: colors.glass.overlay,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
  },
  optimisticReply: {
    opacity: 0.7,
    borderColor: colors.primary.main,
    borderWidth: 1,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  replyAuthor: {
    fontSize: 12,
    color: colors.glass.text.secondary,
    fontWeight: '500',
  },
  replyTime: {
    fontSize: 12,
    color: colors.glass.text.secondary,
  },
  sendingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 4,
  },
  sendingText: {
    fontSize: 10,
    color: colors.glass.text.muted,
    fontStyle: 'italic',
  },
  replyContent: {
    fontSize: 14,
    color: colors.glass.text.primary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  optimisticText: {
    opacity: 0.8,
  },
  replyActions: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  replyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyActionText: {
    fontSize: 12,
    color: colors.glass.text.secondary,
    fontWeight: '500',
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.glass.overlayBorder,
    backgroundColor: colors.glass.overlay,
    gap: theme.spacing.sm,
  },
  replyInput: {
    flex: 1,
    backgroundColor: colors.glass.conversationCard,
    borderRadius: theme.borderRadius.large,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: colors.glass.text.primary,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary.main,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    fontSize: 16,
    color: colors.glass.text.secondary,
  },
});
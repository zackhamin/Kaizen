// app/community/[id].tsx
import { ConnectionStatus } from '@/components/Chat/ConnectionStatus';
import GradientBackground from '@/components/Layout/GradientBackground';
import { colors, theme } from '@/constants/theme';
import { useRealtimeCommunityThreads, useRealtimeStatus } from '@/hooks/useRealTimeChat';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ChatThread, Community, CommunityService } from '../../services/community.service';
const communityService = new CommunityService();

export default function CommunityDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [community, setCommunity] = useState<Community | null>(null);
  const [initialThreads, setInitialThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isConnected } = useRealtimeStatus();
  const previousIdRef = useRef<string | null>(null);

  // Use real-time hook for live thread updates - only when we have a valid ID
  const { threads, isConnected: threadsConnected } = useRealtimeCommunityThreads(
    id || '', // Pass empty string if id is undefined
    initialThreads
  );

  useEffect(() => {
    console.log('Community ID changed:', previousIdRef.current, '->', id);
    
    // Only load data if the ID actually changed
    if (id && id !== previousIdRef.current) {
      previousIdRef.current = id;
      loadCommunityData();
    }
  }, [id]);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      console.log('Loading community data for ID:', id);
      
      // Load community info and threads in parallel
      const [communitiesData, threadsData] = await Promise.all([
        communityService.getCommunities(),
        communityService.getCommunityThreads(id!)
      ]);

      const communityData = communitiesData.find(c => c.id === id);
      console.log('Found community:', communityData);
      console.log('Found threads:', threadsData);
      
      setCommunity(communityData || null);
      setInitialThreads(threadsData); // This will trigger real-time updates
    } catch (error) {
      console.error('Error loading community data:', error);
      Alert.alert('Error', 'Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCommunityData();
    setRefreshing(false);
  };

  const handleCreateThread = () => {
    console.log('Create thread for community:', id);
    router.push(`/create-thread?communityId=${id}`);
  };

  const handleThreadPress = (thread: ChatThread) => {
    console.log('Thread pressed:', thread.id);
    // Optimistic update: increment reply count if real-time is not working
    if (!threadsConnected) {
      setInitialThreads(prevThreads =>
        prevThreads.map(t =>
          t.id === thread.id
            ? { ...t, reply_count: (t.reply_count || 0) + 1 }
            : t
        )
      );
    }
    router.push(`/thread/${thread.id}`);
  };

  const getCommunityStyle = (communityName: string) => {
    switch (communityName?.toLowerCase()) {
      case 'mental support':
        return { bg: 'rgba(139, 69, 19, 0.15)', emoji: '🧠' };
      case 'side hustles':
        return { bg: 'rgba(34, 197, 94, 0.15)', emoji: '💼' };
      case 'group chat':
        return { bg: 'rgba(59, 130, 246, 0.15)', emoji: '💬' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.15)', emoji: '🏠' };
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

  const renderThreadCard = ({ item: thread }: { item: ChatThread }) => {
    return (
      <TouchableOpacity
        style={styles.threadCard}
        onPress={() => handleThreadPress(thread)}
        activeOpacity={0.8}
      >
        {thread.is_pinned && (
          <View style={styles.pinnedBadge}>
            <Ionicons name="pin" size={12} color={colors.accent.copper} />
            <Text style={styles.pinnedText}>PINNED</Text>
          </View>
        )}
        
        <View style={styles.threadHeader}>
          <Text style={styles.threadTitle} numberOfLines={2}>
            {thread.title}
          </Text>
          <View style={styles.threadMeta}>
            <Text style={styles.author}>u/{thread.alias_username}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(thread.created_at)}</Text>
          </View>
        </View>

        <Text style={styles.threadContent} numberOfLines={3}>
          {thread.content}
        </Text>

        <View style={styles.threadFooter}>
          <View style={styles.threadStats}>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={14} color={colors.glass.text.secondary} />
              <Text style={styles.statText}>{thread.reply_count || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={14} color={colors.glass.text.secondary} />
              <Text style={styles.statText}>{thread.reaction_count || 0}</Text>
            </View>
          </View>
          
          {thread.latest_reply && (
            <Text style={styles.latestReply}>
              Last: u/{thread.latest_reply.alias_username} • {formatTimeAgo(thread.latest_reply.created_at)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>💭</Text>
      <Text style={styles.emptyTitle}>No posts yet</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to start a conversation in this community!
      </Text>
      <TouchableOpacity style={styles.createFirstButton} onPress={handleCreateThread}>
        <Text style={styles.createFirstButtonText}>Create First Post</Text>
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
          <Text style={styles.loadingText}>Loading community...</Text>
        </View>
      </GradientBackground>
    );
  }

  if (!community) {
    return (
      <GradientBackground showHeader={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.glass.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Community Not Found</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Community not found</Text>
          <TouchableOpacity 
            style={styles.createFirstButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.createFirstButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </GradientBackground>
    );
  }

  const communityStyle = getCommunityStyle(community.name);

  return (
    <GradientBackground showHeader={false}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.glass.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.headerIcon, { backgroundColor: communityStyle.bg }]}>
            <Text style={styles.headerEmoji}>{communityStyle.emoji}</Text>
          </View>
          <Text style={styles.headerTitle}>{community.name}</Text>
        </View>
        <TouchableOpacity 
          onPress={handleCreateThread}
          style={styles.createButton}
        >
          <Ionicons name="add" size={24} color={colors.glass.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.descriptionContainer}>
          <Text style={styles.communityDescription}>
            {community.description}
          </Text>
          <ConnectionStatus isConnected={isConnected} showWhenConnected={true} />
        </View>

        <FlatList
          data={threads}
          renderItem={renderThreadCard}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
        />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateThread}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: 60,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 40, // Compensate for create button
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  headerEmoji: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.glass.text.primary,
  },
  createButton: {
    padding: theme.spacing.sm,
    marginRight: -theme.spacing.sm,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  communityDescription: {
    fontSize: 14,
    color: colors.glass.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  listContainer: {
    paddingBottom: 100, // Space for FAB
  },
  threadCard: {
    backgroundColor: colors.glass.overlay,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(251, 146, 60, 0.15)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.sm,
  },
  pinnedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent.copper,
    marginLeft: 4,
  },
  threadHeader: {
    marginBottom: theme.spacing.sm,
  },
  threadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.glass.text.primary,
    lineHeight: 22,
    marginBottom: theme.spacing.xs,
  },
  threadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  author: {
    fontSize: 12,
    color: colors.glass.text.secondary,
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    color: colors.glass.text.muted,
    marginHorizontal: 6,
  },
  timeAgo: {
    fontSize: 12,
    color: colors.glass.text.secondary,
  },
  threadContent: {
    fontSize: 14,
    color: colors.glass.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  threadFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.glass.overlayBorder,
    paddingTop: theme.spacing.sm,
  },
  threadStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.glass.text.secondary,
    fontWeight: '500',
  },
  latestReply: {
    fontSize: 11,
    color: colors.glass.text.muted,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.glass.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.glass.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  createFirstButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.large,
  },
  createFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: 100, // Above tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
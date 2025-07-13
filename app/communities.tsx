import { StackScreen } from '@/components/Layout/StackScreen';
import { colors, theme } from '@/constants/theme';
import { useCommunities } from '@/hooks/useCommunities';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Community } from '../services/community.service.modern';

export default function CommunitiesScreen() {
  const router = useRouter();
  
  // Use React Query for communities data
  const { data: communities = [], isLoading, error, refetch, isRefetching } = useCommunities();

  const handleRefresh = () => {
    refetch();
  };

  const handleCommunityPress = (community: Community) => {
    router.push(`/community/${community.id}`);
  };

  const getCommunityStyle = (communityName: string) => {
    switch (communityName.toLowerCase()) {
      case 'mental-support':
        return { bg: 'rgba(139, 69, 19, 0.15)', emoji: '🧠' };
      case 'relationships':
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

  const renderCommunityCard = ({ item: community }: { item: Community }) => {
    const style = getCommunityStyle(community.name);
    
    return (
      <TouchableOpacity
        style={styles.communityCard}
        onPress={() => handleCommunityPress(community)}
        activeOpacity={0.8}
      >
        <View style={styles.communityHeader}>
          <View style={[styles.communityIcon, { backgroundColor: style.bg }]}>
            <Text style={styles.communityEmoji}>{style.emoji}</Text>
          </View>
          <View style={styles.communityInfo}>
            <Text style={styles.communityName}>{community.name}</Text>
            <Text style={styles.communityDescription} numberOfLines={2}>
              {community.description}
            </Text>
          </View>
          <View style={styles.communityStats}>
            <Text style={styles.threadCount}>
              {community.thread_count || 0} posts
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color={colors.glass.text.secondary} 
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
       <StackScreen title="Communities"> 
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.glass.text.primary} />
          <Text style={styles.loadingText}>Loading communities...</Text>
        </View>
      </StackScreen>
    );
  }

  if (error) {
    return (
      <StackScreen title="Communities">

        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Failed to load communities</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </StackScreen>
    );
  }

  return (
    <StackScreen title="Communities">


      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Connect with others anonymously. Share experiences, support each other, and build together.
        </Text>

        <FlatList
          data={communities}
          renderItem={renderCommunityCard}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: colors.glass.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  listContainer: {
    paddingBottom: theme.spacing.xl,
  },
  communityCard: {
    backgroundColor: colors.glass.overlay,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  communityIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.large,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  communityEmoji: {
    fontSize: 24,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.glass.text.primary,
    marginBottom: theme.spacing.xs,
  },
  communityDescription: {
    fontSize: 14,
    color: colors.glass.text.secondary,
    lineHeight: 20,
  },
  communityStats: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 48,
  },
  threadCount: {
    fontSize: 12,
    color: colors.glass.text.secondary,
    fontWeight: '500',
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
  retryButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  retryButtonText: {
    fontSize: 14,
    color: colors.glass.text.primary,
    fontWeight: '500',
  },
});
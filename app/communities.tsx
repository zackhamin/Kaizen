// app/communities.tsx
import GradientBackground from '@/components/Layout/GradientBackground';
import { colors, theme } from '@/constants/theme';
import { testRealtimeConnection, useRealtimeCommunities } from '@/hooks/useRealTimeChat';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Community, CommunityService } from '../services/community.service';

const communityService = new CommunityService();

export default function CommunitiesScreen() {
  const router = useRouter();
  const [initialCommunities, setInitialCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Use real-time hook for live community updates
  const { communities, isConnected, connectionError } = useRealtimeCommunities(initialCommunities);

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      const data = await communityService.getCommunities();
      setInitialCommunities(data); // This will trigger real-time updates
    } catch (error) {
      console.error('Error loading communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCommunities();
    setRefreshing(false);
  };

  const handleTestRealtime = async () => {
    console.log('Testing real-time connection...');
    const result = await testRealtimeConnection();
    Alert.alert(
      'Real-time Test',
      result ? 'Real-time test initiated. Check console logs.' : 'Real-time test failed. Check console logs.',
      [{ text: 'OK' }]
    );
  };

  const handleCommunityPress = (community: Community) => {
    // Optimistic update: increment thread count immediately
    if (!isConnected) {
      setInitialCommunities(prevCommunities =>
        prevCommunities.map(c =>
          c.id === community.id
            ? { ...c, thread_count: (c.thread_count || 0) + 1 }
            : c
        )
      );
    }
    router.push(`/community/${community.id}`);
  };

  const getCommunityStyle = (communityName: string) => {
    switch (communityName.toLowerCase()) {
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
          <Text style={styles.headerTitle}>Communities</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.glass.text.primary} />
          <Text style={styles.loadingText}>Loading communities...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground showHeader={false}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.glass.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Communities</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Connect with others anonymously. Share experiences, support each other, and build together.
        </Text>

        {/* Connection Status */}
        <View style={styles.connectionStatus}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10b981' : '#ef4444' }]} />
          <Text style={styles.statusText}>
            {isConnected ? 'Real-time Connected' : 'Real-time Disconnected'}
          </Text>
          {connectionError && (
            <Text style={styles.errorText}>Error: {connectionError}</Text>
          )}
          <TouchableOpacity style={styles.testButton} onPress={handleTestRealtime}>
            <Text style={styles.testButtonText}>Test Real-time</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={communities}
          renderItem={renderCommunityCard}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
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
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.glass.text.primary,
    textAlign: 'center',
    marginRight: 40, // Compensate for back button
  },
  headerSpacer: {
    width: 40,
  },
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
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  statusText: {
    fontSize: 14,
    color: colors.glass.text.secondary,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginLeft: theme.spacing.sm,
  },
  testButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  testButtonText: {
    fontSize: 14,
    color: colors.glass.text.primary,
    fontWeight: '500',
  },
});
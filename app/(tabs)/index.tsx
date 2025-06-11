import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../constants/theme';

// Mock data types
interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  community: {
    name: string;
    category: string;
    slug: string;
  };
  votes: {
    upvotes: number;
    downvotes: number;
    userVote: 'up' | 'down' | null;
  };
  commentCount: number;
  timeAgo: string;
  isPrivate: boolean;
}

// Enhanced category configuration
const categoryConfig: { [key: string]: { bg: string; text: string; emoji: string } } = {
  'chronic-pain': { bg: '#FEE2E2', text: '#DC2626', emoji: '🩹' },
  'mental-health': { bg: '#E0E7FF', text: '#4F46E5', emoji: '🧠' },
  'autoimmune': { bg: '#D1FAE5', text: '#059669', emoji: '🤝' },
  'cancer': { bg: '#FED7E2', text: '#BE185D', emoji: '🎗️' },
  'neurological': { bg: '#E9D5FF', text: '#7C3AED', emoji: '⚡' },
  'default': { bg: '#F3F4F6', text: '#6B7280', emoji: '👥' },
};

// Filter options for home feed
const feedFilters = [
  'For You',
  'Following',
  'Trending',
  'Recent',
  'Mental Health',
  'Chronic Pain',
  'Support'
];

// Mock posts data
const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Finally found a pain management routine that works',
    content: 'After 3 years of trying different approaches, I wanted to share what has been helping me manage my chronic pain. The combination of gentle yoga, meditation, and working with a pain specialist has made such a difference. The key was finding the right balance and not pushing myself too hard...',
    author: 'Sarah_M',
    community: {
      name: 'Chronic Pain Warriors',
      category: 'chronic-pain',
      slug: 'chronic-pain-warriors'
    },
    votes: {
      upvotes: 127,
      downvotes: 3,
      userVote: null
    },
    commentCount: 23,
    timeAgo: '2h ago',
    isPrivate: false
  },
  {
    id: '2',
    title: 'Dealing with anxiety at work - tips that helped me',
    content: 'I used to have panic attacks during meetings and it was affecting my career. Here are some strategies that have really helped me cope with workplace anxiety. First, I started doing breathing exercises before important meetings...',
    author: 'MindfulMike',
    community: {
      name: 'Anxiety & Depression Support',
      category: 'mental-health',
      slug: 'anxiety-depression-support'
    },
    votes: {
      upvotes: 89,
      downvotes: 1,
      userVote: 'up'
    },
    commentCount: 18,
    timeAgo: '4h ago',
    isPrivate: true
  },
  {
    id: '3',
    title: 'Lupus flare management - what works for me',
    content: 'Living with lupus means being prepared for unexpected flares. Over the years, I\'ve developed a toolkit of strategies that help me manage symptoms and maintain quality of life. Today I want to share what has been most effective...',
    author: 'LupusLion',
    community: {
      name: 'Autoimmune Alliance',
      category: 'autoimmune',
      slug: 'autoimmune-alliance'
    },
    votes: {
      upvotes: 156,
      downvotes: 2,
      userVote: null
    },
    commentCount: 31,
    timeAgo: '6h ago',
    isPrivate: false
  }
];

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('For You');
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleVote = (postId: string, voteType: 'up' | 'down') => {
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          const currentVote = post.votes.userVote;
          let newUpvotes = post.votes.upvotes;
          let newDownvotes = post.votes.downvotes;
          let newUserVote: 'up' | 'down' | null = voteType;

          // Remove previous vote if exists
          if (currentVote === 'up') newUpvotes--;
          if (currentVote === 'down') newDownvotes--;

          // Add new vote or remove if same vote
          if (currentVote === voteType) {
            newUserVote = null; // Remove vote if clicking same button
          } else {
            if (voteType === 'up') newUpvotes++;
            if (voteType === 'down') newDownvotes++;
          }

          return {
            ...post,
            votes: {
              ...post.votes,
              upvotes: newUpvotes,
              downvotes: newDownvotes,
              userVote: newUserVote
            }
          };
        }
        return post;
      })
    );
  };

  const getCategoryConfig = (category: string) => {
    return categoryConfig[category] || categoryConfig.default;
  };

  const getNetVotes = (post: Post) => {
    return post.votes.upvotes - post.votes.downvotes;
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const renderPost = ({ item, index }: { item: Post; index: number }) => {
    const categoryStyle = getCategoryConfig(item.community.category);
    const netVotes = getNetVotes(item);
    
    return (
      <Animated.View
        style={[
          styles.postCardWrapper,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            }],
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.postCard}
          onPress={() => router.push(`/post/${item.id}`)}
          activeOpacity={0.7}
        >
          <View style={styles.splitContainer}>
            {/* Left side - Voting */}
            <View style={styles.votingSection}>
              <TouchableOpacity
                style={[
                  styles.voteButton,
                  item.votes.userVote === 'up' && styles.voteButtonActive
                ]}
                onPress={() => handleVote(item.id, 'up')}
              >
                <Ionicons 
                  name="chevron-up" 
                  size={20} 
                  color={item.votes.userVote === 'up' ? '#10B981' : colors.ui.muted.dark} 
                />
              </TouchableOpacity>
              
              <Text style={[
                styles.voteCount,
                netVotes > 0 && styles.voteCountPositive,
                netVotes < 0 && styles.voteCountNegative
              ]}>
                {netVotes}
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.voteButton,
                  item.votes.userVote === 'down' && styles.voteButtonActiveDown
                ]}
                onPress={() => handleVote(item.id, 'down')}
              >
                <Ionicons 
                  name="chevron-down" 
                  size={20} 
                  color={item.votes.userVote === 'down' ? '#EF4444' : colors.ui.muted.dark} 
                />
              </TouchableOpacity>
            </View>

            {/* Right side - Content */}
            <View style={styles.contentSection}>
              {/* Community header */}
              <View style={styles.communityHeader}>
                <View style={styles.communityInfo}>
                  <View style={[styles.communityIcon, { backgroundColor: categoryStyle.bg }]}>
                    <Text style={styles.communityEmoji}>{categoryStyle.emoji}</Text>
                  </View>
                  <View style={styles.communityDetails}>
                    <TouchableOpacity onPress={() => router.push(`/community/${item.community.slug}`)}>
                      <Text style={styles.communityName}>r/{item.community.name}</Text>
                    </TouchableOpacity>
                    <View style={styles.postMeta}>
                      <Text style={styles.author}>u/{item.author}</Text>
                      <Text style={styles.separator}>•</Text>
                      <Text style={styles.timeAgo}>{item.timeAgo}</Text>
                      {item.isPrivate && (
                        <>
                          <Text style={styles.separator}>•</Text>
                          <Ionicons name="lock-closed" size={12} color={colors.ui.muted.dark} />
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </View>

              {/* Post content */}
              <Text style={styles.postTitle} numberOfLines={2}>
                {item.title}
              </Text>
              
              <Text style={styles.postContent} numberOfLines={3}>
                {truncateContent(item.content)}
              </Text>

              {/* Post footer */}
              <View style={styles.postFooter}>
                <TouchableOpacity style={styles.commentButton}>
                  <Ionicons name="chatbubble-outline" size={16} color={colors.ui.muted.dark} />
                  <Text style={styles.commentCount}>{item.commentCount}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.shareButton}>
                  <Ionicons name="share-outline" size={16} color={colors.ui.muted.dark} />
                  <Text style={styles.shareText}>Share</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.saveButton}>
                  <Ionicons name="bookmark-outline" size={16} color={colors.ui.muted.dark} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading your feed...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient Header */}
      {/* <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradientHeader}
      >
        <Text style={styles.headerTitle}>Home</Text>
      </LinearGradient> */}

      <View style={styles.contentContainer}>
        {/* Tab-style Filters */}
        <View style={styles.filtersSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
          >
            {feedFilters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterTab,
                  activeFilter === filter && styles.filterTabActive
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[
                  styles.filterTabText,
                  activeFilter === filter && styles.filterTabTextActive
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Posts Feed */}
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary.main}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrapper}>
                <Ionicons name="newspaper-outline" size={48} color={colors.ui.muted.light} />
              </View>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptySubtitle}>
                Follow some communities to see posts in your feed
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  gradientHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.light,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.ui.muted.dark,
  },
  filtersSection: {
    paddingVertical: 16,
  },
  filtersScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.ui.muted.light,
    backgroundColor: 'transparent',
  },
  filterTabActive: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.ui.muted.dark,
  },
  filterTabTextActive: {
    color: 'white',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  postCardWrapper: {
    marginBottom: 12,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  splitContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  votingSection: {
    alignItems: 'center',
    marginRight: 12,
    minWidth: 40,
  },
  voteButton: {
    padding: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteButtonActive: {
    backgroundColor: '#ECFDF5',
  },
  voteButtonActiveDown: {
    backgroundColor: '#FEF2F2',
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ui.muted.dark,
    marginVertical: 4,
    textAlign: 'center',
  },
  voteCountPositive: {
    color: '#10B981',
  },
  voteCountNegative: {
    color: '#EF4444',
  },
  contentSection: {
    flex: 1,
  },
  communityHeader: {
    marginBottom: 8,
  },
  communityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  communityEmoji: {
    fontSize: 12,
  },
  communityDetails: {
    flex: 1,
  },
  communityName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary.main,
    marginBottom: 2,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  author: {
    fontSize: 11,
    color: colors.ui.muted.dark,
    fontWeight: '500',
  },
  separator: {
    fontSize: 11,
    color: colors.ui.muted.light,
    marginHorizontal: 4,
  },
  timeAgo: {
    fontSize: 11,
    color: colors.ui.muted.dark,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary.dark,
    lineHeight: 22,
    marginBottom: 6,
  },
  postContent: {
    fontSize: 14,
    color: colors.ui.muted.dark,
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentCount: {
    fontSize: 12,
    color: colors.ui.muted.dark,
    fontWeight: '500',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shareText: {
    fontSize: 12,
    color: colors.ui.muted.dark,
    fontWeight: '500',
  },
  saveButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.ui.lavender + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.ui.muted.dark,
    textAlign: 'center',
    lineHeight: 24,
  },
});
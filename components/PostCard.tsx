import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

interface CategoryConfig {
  bg: string;
  text: string;
  emoji: string;
}

interface PostCardProps {
  post: Post;
  fadeAnim: Animated.Value;
  categoryStyle: CategoryConfig;
  netVotes: number;
  onPress: () => void;
  onVote: (voteType: 'up' | 'down') => void;
}

export default function PostCard({
  post,
  fadeAnim,
  categoryStyle,
  netVotes,
  onPress,
  onVote,
}: PostCardProps) {
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
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.splitContainer}>
          {/* Left side - Voting */}
          <View style={styles.votingSection}>
            <TouchableOpacity
              style={[
                styles.voteButton,
                post.votes.userVote === 'up' && styles.voteButtonActive
              ]}
              onPress={() => onVote('up')}
            >
              <Ionicons 
                name="chevron-up" 
                size={20} 
                color={post.votes.userVote === 'up' ? '#10B981' : colors.ui.muted.dark} 
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
                post.votes.userVote === 'down' && styles.voteButtonActiveDown
              ]}
              onPress={() => onVote('down')}
            >
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color={post.votes.userVote === 'down' ? '#EF4444' : colors.ui.muted.dark} 
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
                  <Text style={styles.communityName}>r/{post.community.name}</Text>
                  <View style={styles.postMeta}>
                    <Text style={styles.author}>u/{post.author}</Text>
                    <Text style={styles.separator}>•</Text>
                    <Text style={styles.timeAgo}>{post.timeAgo}</Text>
                    {post.isPrivate && (
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
              {post.title}
            </Text>
            <Text style={styles.postContent} numberOfLines={3}>
              {post.content}
            </Text>
            {/* Post footer */}
            <View style={styles.postFooter}>
              <TouchableOpacity style={styles.commentButton}>
                <Ionicons name="chatbubble-outline" size={16} color={colors.ui.muted.dark} />
                <Text style={styles.commentCount}>{post.commentCount}</Text>
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
}

const styles = StyleSheet.create({
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
}); 
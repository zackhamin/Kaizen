import { StackScreen } from '@/components/Layout/StackScreen';
import { colors, theme } from '@/constants/theme';
import { FORUM_TOPICS, ForumPost, ForumTopic, StreamService } from '@/services/stream.service';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type ForumView = 'topics' | 'posts';

interface ForumState {
  view: ForumView;
  selectedTopic?: ForumTopic;
  posts: ForumPost[];
  loading: boolean;
  showCreatePost: boolean;
  newPostText: string;
}

export default function ForumScreen() {
  const router = useRouter();
  const [anonymousUser, setAnonymousUser] = useState<any>(null);
  const [forumState, setForumState] = useState<ForumState>({
    view: 'topics',
    posts: [],
    loading: false,
    showCreatePost: false,
    newPostText: '',
  });

  useEffect(() => {
    initializeForum();
  }, []);

  const initializeForum = async () => {
    try {
      setForumState(prev => ({ ...prev, loading: true }));
      
      // Connect anonymous user
      const user = await StreamService.connectAnonymousUser('forum-user');
      setAnonymousUser(user);
      
      // Initialize channels
      await StreamService.initializeChannels();
      
      console.log('Forum: Initialized successfully');
    } catch (error) {
      console.error('Forum: Error initializing:', error);
      Alert.alert('Error', 'Failed to initialize forum');
    } finally {
      setForumState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleTopicPress = async (topic: ForumTopic) => {
    try {
      setForumState(prev => ({ ...prev, loading: true, selectedTopic: topic, view: 'posts' }));
      
      // Get or create channel for this topic
      const channel = await StreamService.getOrCreateChannel(topic.id);
      
      // Load posts for this topic using our service
      const posts = await StreamService.getPosts(topic.id);
      setForumState(prev => ({ ...prev, posts, loading: false }));
    } catch (error) {
      console.error('Forum: Error loading posts:', error);
      Alert.alert('Error', 'Failed to load posts');
      setForumState(prev => ({ ...prev, loading: false }));
    }
  };

  const handlePostPress = (post: ForumPost) => {
    // Navigate to the post detail screen
    router.push(`/post/${post.id}?topicId=${forumState.selectedTopic?.id}&postText=${encodeURIComponent(post.text)}`);
  };

  const handleCreatePost = async () => {
    if (!anonymousUser || !forumState.selectedTopic || !forumState.newPostText.trim()) return;
    
    try {
      setForumState(prev => ({ ...prev, loading: true }));
      
      const newPost = await StreamService.createPost(
        forumState.selectedTopic!.id,
        forumState.newPostText.trim(),
        anonymousUser
      );
      
      // Refresh posts
      const posts = await StreamService.getPosts(forumState.selectedTopic!.id);
      setForumState(prev => ({ 
        ...prev, 
        posts, 
        loading: false, 
        showCreatePost: false, 
        newPostText: '' 
      }));
    } catch (error) {
      console.error('Forum: Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
      setForumState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleBack = () => {
    if (forumState.view === 'posts') {
      setForumState(prev => ({ ...prev, view: 'topics', selectedTopic: undefined, posts: [] }));
    }
  };

  const renderTopicItem = ({ item }: { item: ForumTopic }) => (
    <TouchableOpacity
      style={styles.topicItem}
      onPress={() => handleTopicPress(item)}
    >
      <Text style={styles.topicTitle}>{item.name}</Text>
      <Text style={styles.topicDescription}>{item.description}</Text>
      <View style={styles.topicCategory}>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPostItem = ({ item }: { item: ForumPost }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => handlePostPress(item)}
    >
      <View style={styles.postHeader}>
        <Text style={styles.postAuthor}>{item.user.name}</Text>
        <Text style={styles.postDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.postText}>{item.text}</Text>
      <View style={styles.postFooter}>
        <Text style={styles.replyCount}>
          {item.reply_count} {item.reply_count === 1 ? 'reply' : 'replies'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCreatePostForm = () => (
    <View style={styles.createPostContainer}>
      <Text style={styles.createPostTitle}>Create a new post</Text>
      <TextInput
        style={styles.postInput}
        placeholder="What's on your mind? (e.g., What tablets do you all take for anxiety?)"
        placeholderTextColor={colors.glass.text.secondary}
        value={forumState.newPostText}
        onChangeText={(text) => setForumState(prev => ({ ...prev, newPostText: text }))}
        multiline
        numberOfLines={4}
      />
      <View style={styles.createPostActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setForumState(prev => ({ ...prev, showCreatePost: false, newPostText: '' }))}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.createButton, !forumState.newPostText.trim() && styles.createButtonDisabled]}
          onPress={handleCreatePost}
          disabled={!forumState.newPostText.trim()}
        >
          <Text style={styles.createButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getTitle = () => {
    switch (forumState.view) {
      case 'topics':
        return 'Brotherhood Forum';
      case 'posts':
        return forumState.selectedTopic?.name || 'Posts';
      default:
        return 'Forum';
    }
  };

  const renderContent = () => {
    if (forumState.loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    switch (forumState.view) {
      case 'topics':
        return (
          <View style={styles.topicsContainer}>
            <Text style={styles.welcomeText}>
              Welcome to Brotherhood, {anonymousUser?.name}! 
              Join anonymous conversations with your brothers.
            </Text>
            
            <Text style={styles.safetyText}>
              💙 This is a safe space. Be supportive and respectful.
            </Text>
            
            <FlatList
              data={FORUM_TOPICS}
              renderItem={renderTopicItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        );
      case 'posts':
        return (
          <View style={styles.postsContainer}>
            <TouchableOpacity
              style={styles.createPostButton}
              onPress={() => setForumState(prev => ({ ...prev, showCreatePost: true }))}
            >
              <Text style={styles.createPostButtonText}>+ Create New Post</Text>
            </TouchableOpacity>
            
            {forumState.showCreatePost && renderCreatePostForm()}
            
            <FlatList
              data={forumState.posts}
              renderItem={renderPostItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No posts yet</Text>
                  <Text style={styles.emptySubtext}>Be the first to share something!</Text>
                </View>
              }
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <StackScreen
      title={getTitle()}
      onBack={forumState.view !== 'topics' ? handleBack : undefined}
    >
      <View style={styles.container}>
        {renderContent()}
      </View>
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.glass.overlay,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.glass.text.primary,
    fontSize: 16,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  topicsContainer: {
    padding: theme.spacing.md,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.glass.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  safetyText: {
    fontSize: 14,
    color: colors.glass.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  topicItem: {
    backgroundColor: colors.glass.overlay,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.glass.text.primary,
    marginBottom: theme.spacing.xs,
  },
  topicDescription: {
    fontSize: 14,
    color: colors.glass.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  topicCategory: {
    alignSelf: 'flex-start',
    backgroundColor: colors.glass.buttonDefault,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.medium,
  },
  categoryText: {
    fontSize: 12,
    color: colors.glass.text.primary,
    fontWeight: '500',
  },
  postsContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  createPostButton: {
    backgroundColor: colors.glass.buttonDefault,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  createPostButtonText: {
    color: colors.glass.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  createPostContainer: {
    backgroundColor: colors.glass.overlay,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
  },
  createPostTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.glass.text.primary,
    marginBottom: theme.spacing.sm,
  },
  postInput: {
    fontSize: 16,
    color: colors.glass.text.primary,
    lineHeight: 24,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
    backgroundColor: colors.glass.inputBackground,
    minHeight: 100,
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.sm,
  },
  cancelButton: {
    backgroundColor: colors.glass.buttonDefault,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
  },
  cancelButtonText: {
    color: colors.glass.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: colors.glass.buttonDefault,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
  },
  createButtonDisabled: {
    backgroundColor: colors.glass.buttonDefault,
    opacity: 0.7,
  },
  createButtonText: {
    color: colors.glass.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  postItem: {
    backgroundColor: colors.glass.overlay,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.glass.text.primary,
  },
  postDate: {
    fontSize: 12,
    color: colors.glass.text.secondary,
  },
  postText: {
    fontSize: 16,
    color: colors.glass.text.primary,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  replyCount: {
    fontSize: 12,
    color: colors.glass.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.glass.text.primary,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.glass.text.secondary,
    textAlign: 'center',
  },
}); 
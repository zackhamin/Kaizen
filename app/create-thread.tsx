import GradientBackground from '@/components/Layout/GradientBackground';
import { colors, theme } from '@/constants/theme';
import { useCreateThread } from '@/hooks/useCommunities';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Community, CommunityService } from '../services/community.service';

const communityService = new CommunityService();

export default function CreateThreadModal() {
  const router = useRouter();
  const { communityId } = useLocalSearchParams<{ communityId: string }>();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loadingCommunity, setLoadingCommunity] = useState(true);

  // Use React Query mutation for creating threads
  const createThreadMutation = useCreateThread();

  useEffect(() => {
    loadCommunity();
  }, [communityId]);

  const loadCommunity = async () => {
    try {
      setLoadingCommunity(true);
      const communities = await communityService.getCommunities();
      const foundCommunity = communities.find(c => c.id === communityId);
      setCommunity(foundCommunity || null);
    } catch (error) {
      console.error('Error loading community:', error);
      Alert.alert('Error', 'Failed to load community information');
    } finally {
      setLoadingCommunity(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        'Discard Post?',
        'Are you sure you want to discard this post?',
        [
          { text: 'Keep Writing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => router.back()
          }
        ]
      );
    } else {
      router.back();
    }
  };

  const handlePost = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your post');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Missing Content', 'Please enter some content for your post');
      return;
    }

    if (!communityId) {
      Alert.alert('Error', 'Community not found');
      return;
    }

    try {
      await createThreadMutation.mutateAsync({
        communityId,
        title: title.trim(),
        content: content.trim()
      });

      // Success! Go back to the previous screen
      router.back();
      
    } catch (error: any) {
      console.error('Error creating thread:', error);
      
      if (error.message?.includes('alias not found')) {
        Alert.alert(
          'Profile Incomplete',
          'Please complete your profile setup to post anonymously. You need to choose a username.',
          [
            {
              text: 'Complete Profile',
              onPress: () => router.push('/settings')
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to create post. Please try again.');
      }
    }
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

  const isPostValid = title.trim().length > 0 && content.trim().length > 0;

  if (loadingCommunity) {
    return (
      <GradientBackground showHeader={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.glass.text.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </GradientBackground>
    );
  }

  if (!community) {
    return (
      <GradientBackground showHeader={false}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Community not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </GradientBackground>
    );
  }

  const communityStyle = getCommunityStyle(community.name);

  return (
    <GradientBackground showHeader={false}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={[styles.communityIcon, { backgroundColor: communityStyle.bg }]}>
              <Text style={styles.communityEmoji}>{communityStyle.emoji}</Text>
            </View>
            <Text style={styles.headerTitle}>{community.name}</Text>
          </View>
          
          <TouchableOpacity 
            onPress={handlePost}
            style={[
              styles.postButton,
              { opacity: isPostValid ? 1 : 0.5 }
            ]}
            disabled={!isPostValid || createThreadMutation.isPending}
          >
            {createThreadMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.postText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Title Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Post Title</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="What's on your mind?"
                placeholderTextColor={colors.glass.text.muted}
                value={title}
                onChangeText={setTitle}
                maxLength={200}
                multiline={false}
                returnKeyType="next"
                autoFocus={true}
              />
              <Text style={styles.characterCount}>
                {title.length}/200
              </Text>
            </View>

            {/* Content Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Content</Text>
              <TextInput
                style={styles.contentInput}
                placeholder="Share your thoughts, ask questions, or start a discussion..."
                placeholderTextColor={colors.glass.text.muted}
                value={content}
                onChangeText={setContent}
                maxLength={2000}
                multiline={true}
                textAlignVertical="top"
                returnKeyType="default"
              />
              <Text style={styles.characterCount}>
                {content.length}/2000
              </Text>
            </View>

            {/* Guidelines */}
            <View style={styles.guidelines}>
              <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
              <View style={styles.guidelineItem}>
                <Ionicons name="shield-checkmark" size={16} color={colors.glass.text.secondary} />
                <Text style={styles.guidelineText}>Be respectful and supportive</Text>
              </View>
              <View style={styles.guidelineItem}>
                <Ionicons name="eye-off" size={16} color={colors.glass.text.secondary} />
                <Text style={styles.guidelineText}>Your identity remains anonymous</Text>
              </View>
              <View style={styles.guidelineItem}>
                <Ionicons name="heart" size={16} color={colors.glass.text.secondary} />
                <Text style={styles.guidelineText}>Focus on mental fitness and growth</Text>
              </View>
              <View style={styles.guidelineItem}>
                <Ionicons name="alert-circle" size={16} color={colors.error.main} />
                <Text style={[styles.guidelineText, { color: colors.error.main }]}>
                  If you're in crisis, please use the SOS button
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
  cancelButton: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
  },
  cancelText: {
    fontSize: 16,
    color: colors.glass.text.secondary,
    fontWeight: '500',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.md,
  },
  communityIcon: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  communityEmoji: {
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.glass.text.primary,
  },
  postButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.large,
    minWidth: 60,
    alignItems: 'center',
  },
  postText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: theme.spacing.md,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.glass.text.primary,
    marginBottom: theme.spacing.sm,
  },
  titleInput: {
    backgroundColor: colors.glass.overlay,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    fontSize: 16,
    color: colors.glass.text.primary,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
    fontWeight: '600',
  },
  contentInput: {
    backgroundColor: colors.glass.overlay,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    fontSize: 16,
    color: colors.glass.text.primary,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
    minHeight: 120,
    maxHeight: 200,
  },
  characterCount: {
    fontSize: 12,
    color: colors.glass.text.muted,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  guidelines: {
    backgroundColor: colors.glass.overlay,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.glass.text.primary,
    marginBottom: theme.spacing.md,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  guidelineText: {
    fontSize: 14,
    color: colors.glass.text.secondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
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
  backButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.large,
    marginTop: theme.spacing.lg,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
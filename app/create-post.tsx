import { colors } from '@/constants/theme';
import { CommunityService } from '@/services/community.service';
import { PostService } from '@/services/post.service';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const communityService = new CommunityService();
const postService = new PostService();

export default function CreatePostScreen() {
  const router = useRouter();
  const { communityId } = useLocalSearchParams<{ communityId: string }>();
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showCommunityPicker, setShowCommunityPicker] = useState(false);

  useEffect(() => {
    loadUserCommunities();
  }, []);

  useEffect(() => {
    if (communityId && communities.length > 0) {
      const community = communities.find(c => c.id === communityId);
      if (community) {
        setSelectedCommunity(community);
      }
    }
  }, [communityId, communities]);

  const loadUserCommunities = async () => {
    try {
      setLoading(true);
      const userCommunities = await communityService.getUserCommunities();
      setCommunities(userCommunities);
      
      // If no community is selected and we have communities, select the first one
      if (!selectedCommunity && userCommunities.length > 0) {
        setSelectedCommunity(userCommunities[0]);
      }
    } catch (error) {
      console.error('Error loading communities:', error);
      Alert.alert('Error', 'Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!selectedCommunity) {
      Alert.alert('Error', 'Please select a community');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    try {
      setLoading(true);
      await postService.createPost({
        title: title.trim(),
        content: content.trim(),
        community_id: selectedCommunity.id,
      });

      Alert.alert('Success', 'Post created successfully', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back to the community screen
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  if (loading && communities.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text.primary.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Post</Text>
        <TouchableOpacity 
          onPress={handleCreatePost}
          disabled={loading}
          style={[styles.createButton, loading && styles.createButtonDisabled]}
        >
          <Text style={styles.createButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity 
          style={styles.communityPicker}
          onPress={() => setShowCommunityPicker(!showCommunityPicker)}
        >
          <Text style={styles.communityPickerLabel}>
            Post in {selectedCommunity?.name || 'Select a community'}
          </Text>
          <Ionicons 
            name={showCommunityPicker ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={colors.text.primary.dark} 
          />
        </TouchableOpacity>

        {showCommunityPicker && (
          <View style={styles.communityList}>
            {communities.map((community) => (
              <TouchableOpacity
                key={community.id}
                style={[
                  styles.communityItem,
                  selectedCommunity?.id === community.id && styles.selectedCommunityItem
                ]}
                onPress={() => {
                  setSelectedCommunity(community);
                  setShowCommunityPicker(false);
                }}
              >
                <Text style={[
                  styles.communityItemText,
                  selectedCommunity?.id === community.id && styles.selectedCommunityItemText
                ]}>
                  {community.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          placeholderTextColor={colors.ui.muted.dark}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <TextInput
          style={styles.contentInput}
          placeholder="What's on your mind?"
          placeholderTextColor={colors.ui.muted.dark}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.muted.light,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary.dark,
  },
  createButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: colors.background.light,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  communityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.ui.muted.light,
    borderRadius: 8,
    marginBottom: 16,
  },
  communityPickerLabel: {
    fontSize: 16,
    color: colors.text.primary.dark,
  },
  communityList: {
    backgroundColor: colors.background.light,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.ui.muted.light,
    marginBottom: 16,
    maxHeight: 200,
  },
  communityItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.muted.light,
  },
  selectedCommunityItem: {
    backgroundColor: colors.ui.muted.light,
  },
  communityItemText: {
    fontSize: 16,
    color: colors.text.primary.dark,
  },
  selectedCommunityItemText: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary.dark,
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.ui.muted.light,
    borderRadius: 8,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary.dark,
    padding: 12,
    backgroundColor: colors.ui.muted.light,
    borderRadius: 8,
    minHeight: 200,
  },
}); 
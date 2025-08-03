import { StackScreen } from '@/components/Layout/StackScreen';
import { colors, theme } from '@/constants/theme';
import { StreamService } from '@/services/stream.service';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { StreamChat } from 'stream-chat';
import {
    Channel,
    Chat,
    OverlayProvider,
    Thread
} from 'stream-chat-react-native';




interface PostDetailState {
  postId: string;
  topicId: string;
  postText: string;
  loading: boolean;
  channel: any;
  streamClient: StreamChat | null;
  threadMessage: any;
}

export default function PostDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [anonymousUser, setAnonymousUser] = useState<any>(null);
  const [postState, setPostState] = useState<PostDetailState>({
    postId: params.id as string,
    topicId: params.topicId as string,
    postText: decodeURIComponent(params.postText as string),
    loading: false,
    channel: null,
    streamClient: null,
    threadMessage: null,
  });

  useEffect(() => {
    initializePost();
  }, []);

  const initializePost = async () => {
    try {
      setPostState(prev => ({ ...prev, loading: true }));
      
      // Connect anonymous user
      const user = await StreamService.connectAnonymousUser('forum-user');
      setAnonymousUser(user);
      
      // Get Stream client
      const client = StreamService.getStreamClient();
      
      // Get or create channel for this topic
      const channel = await StreamService.getOrCreateChannel(postState.topicId);
      
      // Get the specific message to create thread
      const response = await channel.query({ messages: { limit: 50 } });
      const threadMessage = response.messages.find((msg: any) => msg.id === postState.postId);
      
      setPostState(prev => ({ 
        ...prev, 
        channel, 
        streamClient: client, 
        threadMessage,
        loading: false 
      }));
    } catch (error) {
      console.error('PostDetail: Error initializing:', error);
      Alert.alert('Error', 'Failed to load post');
      setPostState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleQuoteMessage = async (message: any) => {
    try {
      // Show input prompt for the user to type their reply
      Alert.prompt(
        'Quote Reply',
        'Type your reply to the quoted message:',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Send',
            onPress: async (replyText) => {
              if (replyText && replyText.trim()) {
                // Send the quoted message with user's text
                const channel = postState.channel;
                if (channel) {
                  await channel.sendMessage({
                    text: replyText.trim(),
                    quoted_message_id: message.id,
                    parent_id: postState.postId, // Reply to the original post
                    show_in_channel: false,
                  });
                  
                  Alert.alert('Quote Sent', 'Your quoted reply has been sent!');
                }
              }
            },
          },
        ],
        'plain-text',
        ''
      );
    } catch (error) {
      console.error('Error quoting message:', error);
      Alert.alert('Quote Failed', 'Failed to quote message');
    }
  };

  const renderContent = () => {
    if (postState.loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (!postState.streamClient || !postState.channel) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load post</Text>
        </View>
      );
    }

    return (
      <OverlayProvider>
        <Chat client={postState.streamClient}>
          <Channel 
            channel={postState.channel}
            thread={postState.threadMessage}
            threadList={true}
            messageActions={({ message, ...props }) => [
              // Add quote action
              {
                title: 'Quote',
                action: () => {
                  // Implement actual quote functionality
                  handleQuoteMessage(message);
                },
                actionType: 'quote',
                icon: <Ionicons name="chatbubble-outline" size={20} color={colors.glass.text.primary} />,
              },
              props.deleteMessage,
              props.editMessage,
              props.flagMessage,
              props.pinMessage,
              props.retry,
            ]}
          >
            <View style={styles.container}>
              {/* Original Post Header */}
              <View style={styles.originalPostContainer}>
                <Text style={styles.originalPostText}>{postState.postText}</Text>
                <Text style={styles.originalPostAuthor}>- Anonymous Brother</Text>
              </View>
              
              {/* Thread Component - No wrapper */}
              <Thread />
            </View>
          </Channel>
        </Chat>
      </OverlayProvider>
    );
  };

  return (
    <StackScreen title="Post">
      {renderContent()}
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.glass.overlay,
    borderRadius: theme.borderRadius.large,
    margin: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
    overflow: 'hidden',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.glass.text.primary,
    fontSize: 16,
  },
  originalPostContainer: {
    backgroundColor: colors.glass.conversationCard,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
  },
  originalPostText: {
    fontSize: 16,
    color: colors.glass.text.primary,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  originalPostAuthor: {
    fontSize: 14,
    color: colors.glass.text.secondary,
    textAlign: 'right',
  },
}); 
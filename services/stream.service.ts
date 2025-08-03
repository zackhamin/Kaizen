import { StreamChat } from 'stream-chat';

// Stream Chat client singleton
let streamClient: StreamChat | null = null;

// Environment variables
const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY;
const STREAM_API_SECRET = process.env.EXPO_PUBLIC_STREAM_API_SECRET;

if (!STREAM_API_KEY) {
  console.error('Stream API key not found. Please add EXPO_PUBLIC_STREAM_API_KEY to your .env file');
}

export interface AnonymousUser {
  id: string;
  name: string;
  image?: string;
}

// Forum channel types for Reddit-style posts
export interface ForumTopic {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const FORUM_TOPICS: ForumTopic[] = [
  {
    id: 'mental-health',
    name: 'Mental Health',
    description: 'Share your mental health journey, struggles, and victories',
    category: 'support'
  },
  {
    id: 'goals-ambitions',
    name: 'Goals & Ambitions',
    description: 'Discuss your goals, progress, and strategies for success',
    category: 'growth'
  },
  {
    id: 'daily-struggles',
    name: 'Daily Struggles',
    description: 'Talk about daily challenges and how you overcome them',
    category: 'support'
  },
  {
    id: 'motivation',
    name: 'Motivation',
    description: 'Share motivational content and inspire your brothers',
    category: 'growth'
  },
  {
    id: 'relationships',
    name: 'Relationships',
    description: 'Discuss relationships, family, and social connections',
    category: 'support'
  },
  {
    id: 'fitness-health',
    name: 'Fitness & Health',
    description: 'Physical health, fitness goals, and wellness tips',
    category: 'growth'
  }
];

export interface ForumPost {
  id: string;
  text: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  created_at: string;
  reply_count: number;
  topic_id: string;
}

export interface ForumReply {
  id: string;
  text: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  created_at: string;
  parent_id: string;
  quoted_message_id?: string; // Optional field for quoted replies
}

export class StreamService {
  /**
   * Get or create Stream Chat client
   */
  static getStreamClient(): StreamChat {
    if (!streamClient) {
      if (!STREAM_API_KEY) {
        throw new Error('Stream API key not configured');
      }
      
      streamClient = StreamChat.getInstance(STREAM_API_KEY, {
        timeout: 6000,
        enableInsights: true,
        enableWSFallback: true,
      });
    }
    return streamClient;
  }

  /**
   * Generate token for React Native
   * Using devToken() when "Disable Auth Checks" is enabled in Stream Dashboard
   */
  static async generateUserToken(userId: string): Promise<string> {
    try {
      const client = this.getStreamClient();
      
      // Use devToken() when "Disable Auth Checks" is enabled in Stream Dashboard
      // This is the correct method for development/prototyping
      const token = client.devToken(userId);
      
      return token;
    } catch (error) {
      console.error('StreamService: Error generating token:', error);
      throw new Error('Failed to generate Stream token. Please check your API key configuration.');
    }
  }

  /**
   * Generate consistent anonymous user ID from Supabase user ID
   */
  static generateAnonymousId(supabaseUserId: string): string {
    // Create a hash of the Supabase user ID for consistency
    let hash = 0;
    for (let i = 0; i < supabaseUserId.length; i++) {
      const char = supabaseUserId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `anon_${Math.abs(hash)}`;
  }

  /**
   * Generate anonymous username from user ID
   */
  static generateAnonymousName(userId: string): string {
    const adjectives = [
      'Strong', 'Brave', 'Resilient', 'Wise', 'Calm', 'Focused', 
      'Determined', 'Hopeful', 'Courageous', 'Steady', 'Mindful', 'Present'
    ];
    
    const nouns = [
      'Bear', 'Lion', 'Eagle', 'Wolf', 'Phoenix', 'Tiger', 
      'Warrior', 'Guardian', 'Pilgrim', 'Sage', 'Explorer', 'Builder'
    ];

    // Use userId to generate consistent name
    const hash = this.generateAnonymousId(userId);
    const num = parseInt(hash.replace('anon_', '')) || 0;
    
    const adjective = adjectives[num % adjectives.length];
    const noun = nouns[(num >> 8) % nouns.length];
    const number = (num % 999) + 1;
    
    return `${adjective}${noun}${number}`;
  }

  /**
   * Connect user with anonymous identity
   */
  static async connectAnonymousUser(supabaseUserId: string): Promise<AnonymousUser> {
    try {
      const client = this.getStreamClient();
      
      // Generate consistent anonymous identity
      const userId = this.generateAnonymousId(supabaseUserId);
      const username = this.generateAnonymousName(userId);
      
      // Generate server-side token
      const userToken = await this.generateUserToken(userId);
      
      // Connect user
      await client.connectUser(
        {
          id: userId,
          name: username,
          image: `https://getstream.io/random_svg/?id=${userId}`,
        },
        userToken
      );

      console.log('StreamService: Connected anonymous user:', username);
      
      return {
        id: userId,
        name: username,
        image: `https://getstream.io/random_svg/?id=${userId}`,
      };
    } catch (error) {
      console.error('StreamService: Error connecting user:', error);
      throw error;
    }
  }

  /**
   * Disconnect user from Stream
   */
  static async disconnectUser(): Promise<void> {
    try {
      if (streamClient) {
        await streamClient.disconnectUser();
        streamClient = null;
        console.log('StreamService: User disconnected');
      }
    } catch (error) {
      console.error('StreamService: Error disconnecting user:', error);
    }
  }

  /**
   * Initialize forum channels (topics)
   */
  static async initializeChannels(): Promise<void> {
    try {
      const client = this.getStreamClient();
      
      for (const channelConfig of FORUM_TOPICS) {
        try {
          // Create public channel that anyone can access
          const channel = client.channel('messaging', channelConfig.id, {
            members: [], // No members initially - public access
          });

          // Try to create the channel (will fail if already exists)
          await channel.create();
          
          console.log(`StreamService: Created channel: ${channelConfig.name}`);
        } catch (error: any) {
          // Channel might already exist, which is fine
          if (error.message?.includes('already exists')) {
            console.log(`StreamService: Channel already exists: ${channelConfig.name}`);
          } else {
            console.error(`StreamService: Error creating channel ${channelConfig.name}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('StreamService: Error initializing channels:', error);
      throw error;
    }
  }

  /**
   * Get channels (topics) that the user can access
   */
  static async getChannels(): Promise<any[]> {
    try {
      const client = this.getStreamClient();
      
      // Get all channels (they should be public)
      const response = await client.queryChannels({
        type: 'messaging',
      });

      return response;
    } catch (error) {
      console.error('StreamService: Error getting channels:', error);
      // Return empty array if no channels found
      return [];
    }
  }

  /**
   * Get or create a channel for a topic
   */
  static async getOrCreateChannel(topicId: string): Promise<any> {
    try {
      const client = this.getStreamClient();
      const currentUser = this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('User not connected');
      }

      // Create channel with user as member
      const channel = client.channel('messaging', topicId, {
        members: [currentUser.id],
      });

      try {
        // Try to watch the channel
        await channel.watch();
        return channel;
      } catch (error: any) {
        // If channel doesn't exist, create it
        if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
          await channel.create();
          return channel;
        }
        throw error;
      }
    } catch (error) {
      console.error('StreamService: Error getting/creating channel:', error);
      throw error;
    }
  }

  /**
   * Get specific channel
   */
  static async getChannel(channelId: string): Promise<any> {
    try {
      const client = this.getStreamClient();
      const channel = client.channel('messaging', channelId);
      await channel.watch();
      return channel;
    } catch (error) {
      console.error('StreamService: Error getting channel:', error);
      throw error;
    }
  }

  /**
   * Send message to channel
   */
  static async sendMessage(channelId: string, message: string): Promise<any> {
    try {
      const channel = await this.getChannel(channelId);
      const response = await channel.sendMessage({
        text: message,
      });
      return response;
    } catch (error) {
      console.error('StreamService: Error sending message:', error);
      throw error;
    }
  }

  /**
   * Create a new post in a topic
   */
  static async createPost(topicId: string, text: string, user: AnonymousUser): Promise<ForumPost> {
    try {
      const client = this.getStreamClient();
      const channel = client.channel('messaging', topicId);
      
      // Send the post as a message directly (no membership required for sending)
      const response = await channel.sendMessage({
        text,
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      });

      const message = response.message;
      
      return {
        id: message.id,
        text: message.text!,
        user: {
          id: message.user?.id || user.id,
          name: message.user?.name || user.name,
          image: message.user?.image || user.image || undefined,
        },
        created_at: message.created_at ? new Date(message.created_at).toISOString() : new Date().toISOString(),
        reply_count: 0,
        topic_id: topicId,
      };
    } catch (error) {
      console.error('StreamService: Error creating post:', error);
      throw error;
    }
  }

  /**
   * Reply to a post (create a thread)
   */
  static async createReply(postId: string, text: string, user: AnonymousUser): Promise<ForumReply> {
    try {
      const client = this.getStreamClient();
      
      // Find the channel that contains the post
      const channels = await this.getChannels();
      let targetChannel = null;
      
      for (const channel of channels) {
        try {
          const messages = await channel.query({ messages: { limit: 50 } });
          const hasPost = messages.messages.some((msg: any) => msg.id === postId);
          if (hasPost) {
            targetChannel = channel;
            break;
          }
        } catch (error) {
          // Continue searching other channels
          continue;
        }
      }

      if (!targetChannel) {
        throw new Error('Post not found');
      }

      // Send reply with parent_id to create a thread
      const response = await targetChannel.sendMessage({
        text,
        parent_id: postId,
        show_in_channel: false, // Only show in thread, not main channel
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      });

      const message = response.message;
      
      return {
        id: message.id,
        text: message.text,
        user: {
          id: message.user?.id || user.id,
          name: message.user?.name || user.name,
          image: message.user?.image || user.image,
        },
        created_at: message.created_at ? new Date(message.created_at).toISOString() : new Date().toISOString(),
        parent_id: postId,
      };
    } catch (error) {
      console.error('StreamService: Error creating reply:', error);
      throw error;
    }
  }

  /**
   * Reply to a specific reply (quote the reply)
   */
  static async createReplyWithQuote(postId: string, quotedReplyId: string, text: string, user: AnonymousUser): Promise<ForumReply> {
    try {
      const client = this.getStreamClient();
      
      // Find the channel that contains the post
      const channels = await this.getChannels();
      let targetChannel = null;
      
      for (const channel of channels) {
        try {
          const messages = await channel.query({ messages: { limit: 50 } });
          const hasPost = messages.messages.some((msg: any) => msg.id === postId);
          if (hasPost) {
            targetChannel = channel;
            break;
          }
        } catch (error) {
          // Continue searching other channels
          continue;
        }
      }

      if (!targetChannel) {
        throw new Error('Post not found');
      }

      // Send reply with parent_id and quoted_message_id
      const response = await targetChannel.sendMessage({
        text,
        parent_id: postId,           // Always the original post
        quoted_message_id: quotedReplyId, // The specific reply being quoted
        show_in_channel: false,      // Only show in thread, not main channel
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      });

      const message = response.message;
      
      return {
        id: message.id,
        text: message.text,
        user: {
          id: message.user?.id || user.id,
          name: message.user?.name || user.name,
          image: message.user?.image || user.image,
        },
        created_at: message.created_at ? new Date(message.created_at).toISOString() : new Date().toISOString(),
        parent_id: postId,
        quoted_message_id: quotedReplyId,
      };
    } catch (error) {
      console.error('StreamService: Error creating quoted reply:', error);
      throw error;
    }
  }

  /**
   * Get posts from a topic (main messages, not replies)
   */
  static async getPosts(topicId: string, limit: number = 20): Promise<ForumPost[]> {
    try {
      const client = this.getStreamClient();
      const currentUser = this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('User not connected');
      }

      const channel = client.channel('messaging', topicId);
      
      // Add current user as member
      try {
        await channel.addMembers([currentUser.id]);
      } catch (error: any) {
        // User might already be a member
        if (!error.message?.includes('already a member')) {
          console.warn('Could not add user to channel:', error);
        }
      }
      
      // Query messages directly
      const response = await channel.query({ messages: { limit } });
      
      // Filter out replies (messages with parent_id)
      const posts = response.messages
        .filter((message: any) => !message.parent_id) // Only main posts
        .map((message: any) => ({
          id: message.id,
          text: message.text!,
          user: {
            id: message.user?.id || 'anonymous',
            name: message.user?.name || 'Anonymous Brother',
            image: message.user?.image,
          },
          created_at: message.created_at ? new Date(message.created_at).toISOString() : new Date().toISOString(),
          reply_count: message.reply_count || 0,
          topic_id: topicId,
        }));

      return posts;
    } catch (error) {
      console.error('StreamService: Error getting posts:', error);
      throw error;
    }
  }

  /**
   * Get replies to a specific post
   */
  static async getReplies(postId: string, limit: number = 20): Promise<ForumReply[]> {
    try {
      const client = this.getStreamClient();
      
      // Find the channel that contains the post
      const channels = await this.getChannels();
      let targetChannel = null;
      
      for (const channel of channels) {
        try {
          const messages = await channel.query({ messages: { limit: 50 } });
          const hasPost = messages.messages.some((msg: any) => msg.id === postId);
          if (hasPost) {
            targetChannel = channel;
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!targetChannel) {
        throw new Error('Post not found');
      }

      // Get replies to the post
      const response = await targetChannel.getReplies(postId, { limit });
      
      const replies = response.messages.map((message: any) => ({
        id: message.id,
        text: message.text,
        user: {
          id: message.user?.id || 'anonymous',
          name: message.user?.name || 'Anonymous Brother',
          image: message.user?.image,
        },
        created_at: message.created_at ? new Date(message.created_at).toISOString() : new Date().toISOString(),
        parent_id: postId,
      }));

      return replies;
    } catch (error) {
      console.error('StreamService: Error getting replies:', error);
      throw error;
    }
  }

  /**
   * Quote a message (for UI integration)
   */
  static async quoteMessage(messageId: string): Promise<any> {
    try {
      const client = this.getStreamClient();
      
      // Find the message to quote
      const channels = await this.getChannels();
      let targetChannel = null;
      let targetMessage = null;
      
      for (const channel of channels) {
        try {
          const messages = await channel.query({ messages: { limit: 50 } });
          const message = messages.messages.find((msg: any) => msg.id === messageId);
          if (message) {
            targetChannel = channel;
            targetMessage = message;
            break;
          }
        } catch (error) {
          // Continue searching other channels
          continue;
        }
      }

      if (!targetMessage) {
        throw new Error('Message not found');
      }

      return targetMessage;
    } catch (error) {
      console.error('StreamService: Error quoting message:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  static getCurrentUser(): any {
    if (!streamClient) return null;
    return streamClient.user;
  }

  /**
   * Check if user is connected
   */
  static isConnected(): boolean {
    return streamClient?.userID !== undefined;
  }
} 
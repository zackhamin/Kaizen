import { supabase } from '@/lib/supabase';

// Types
export interface Community {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  thread_count?: number;
}

export interface ChatThread {
  id: string;
  community_id: string;
  user_id: string;
  alias_username: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
  reply_count?: number;
  reaction_count?: number;
  latest_reply?: {
    created_at: string;
    alias_username: string;
  } | null;
}

export interface ChatReply {
  id: string;
  thread_id: string;
  parent_reply_id?: string | null;
  user_id: string;
  alias_username: string;
  content: string;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
  reaction_count?: number;
}

export interface ChatReaction {
  id: string;
  user_id: string;
  thread_id?: string | null;
  reply_id?: string | null;
  reaction_type: string;
  created_at: string;
}

// Modern functional service
export const communityService = {
  // Get all active communities with thread counts
  async getCommunities(): Promise<Community[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First get communities
      const { data: communities, error } = await supabase
        .from('communities')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Then get thread counts for each community
      const communitiesWithCounts = await Promise.all(
        communities?.map(async (community) => {
          const { count } = await supabase
            .from('chat_threads')
            .select('*', { count: 'exact', head: true })
            .eq('community_id', community.id)
            .eq('is_flagged', false);

          return {
            ...community,
            thread_count: count || 0
          };
        }) || []
      );

      return communitiesWithCounts;
    } catch (error) {
      console.error('CommunityService.getCommunities:', error);
      throw error;
    }
  },

  // Get threads for a specific community
  async getCommunityThreads(communityId: string, limit: number = 20): Promise<ChatThread[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First get threads
      const { data: threads, error } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('community_id', communityId)
        .eq('is_flagged', false)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Then get counts for each thread
      const threadsWithCounts = await Promise.all(
        threads?.map(async (thread) => {
          const [replyCount, reactionCount, latestReply] = await Promise.all([
            // Get reply count
            supabase
              .from('chat_replies')
              .select('*', { count: 'exact', head: true })
              .eq('thread_id', thread.id)
              .eq('is_flagged', false),
            
            // Get reaction count
            supabase
              .from('chat_reactions')
              .select('*', { count: 'exact', head: true })
              .eq('thread_id', thread.id),
            
            // Get latest reply
            supabase
              .from('chat_replies')
              .select('created_at, alias_username')
              .eq('thread_id', thread.id)
              .eq('is_flagged', false)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()
          ]);

          return {
            ...thread,
            reply_count: replyCount.count || 0,
            reaction_count: reactionCount.count || 0,
            latest_reply: latestReply.data || null
          };
        }) || []
      );

      return threadsWithCounts;
    } catch (error) {
      console.error('CommunityService.getCommunityThreads:', error);
      throw error;
    }
  },

  // Create a new thread
  async createThread(
    communityId: string, 
    title: string, 
    content: string
  ): Promise<ChatThread> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's alias from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('alias')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Could not fetch user profile');
      }

      if (!profile?.alias) {
        throw new Error('User alias not found. Please complete your profile setup with an anonymous username.');
      }

      console.log('Creating thread with alias:', profile.alias);

      const { data, error } = await supabase
        .from('chat_threads')
        .insert({
          community_id: communityId,
          user_id: user.id,
          alias_username: profile.alias,
          title: title.trim(),
          content: content.trim()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating thread:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('CommunityService.createThread:', error);
      throw error;
    }
  },

  // Get thread detail with replies
  async getThreadDetail(threadId: string): Promise<{
    thread: ChatThread;
    replies: ChatReply[];
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get thread
      const { data: thread, error: threadError } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('id', threadId)
        .eq('is_flagged', false)
        .single();

      if (threadError) throw threadError;

      // Get replies
      const { data: replies, error: repliesError } = await supabase
        .from('chat_replies')
        .select('*')
        .eq('thread_id', threadId)
        .eq('is_flagged', false)
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;

      return {
        thread,
        replies: replies || []
      };
    } catch (error) {
      console.error('CommunityService.getThreadDetail:', error);
      throw error;
    }
  },

  // Create a reply
  async createReply(
    threadId: string,
    content: string,
    parentReplyId?: string
  ): Promise<ChatReply> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's alias
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('alias')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.alias) {
        throw new Error('User alias not found. Please complete your profile setup.');
      }

      const { data, error } = await supabase
        .from('chat_replies')
        .insert({
          thread_id: threadId,
          parent_reply_id: parentReplyId,
          user_id: user.id,
          alias_username: profile.alias,
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('CommunityService.createReply:', error);
      throw error;
    }
  },

  // Add a reaction
  async addReaction(
    contentType: 'thread' | 'reply',
    contentId: string,
    reactionType: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const reactionData = {
        user_id: user.id,
        reaction_type: reactionType,
        ...(contentType === 'thread' 
          ? { thread_id: contentId }
          : { reply_id: contentId }
        )
      };

      const { error } = await supabase
        .from('chat_reactions')
        .insert(reactionData);

      if (error) throw error;
    } catch (error) {
      console.error('CommunityService.addReaction:', error);
      throw error;
    }
  },

  // Remove a reaction
  async removeReaction(
    contentType: 'thread' | 'reply',
    contentId: string,
    reactionType: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('chat_reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType)
        .eq(contentType === 'thread' ? 'thread_id' : 'reply_id', contentId);

      if (error) throw error;
    } catch (error) {
      console.error('CommunityService.removeReaction:', error);
      throw error;
    }
  }
}; 
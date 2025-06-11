import { supabase } from '@/lib/supabase';
import { BaseService } from './base.service';

export interface Post {
  id: string;
  title: string;
  content: string;
  community_id: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  is_edited: boolean;
  tags?: string[];
  media_urls?: string[];
}

export class PostService extends BaseService {
  constructor() {
    super('posts');
  }

  async createPost(data: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'author_id' | 'is_pinned' | 'is_edited'>): Promise<Post> {
    try {
      // Get the current auth user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: post, error } = await supabase
        .from(this.tableName)
        .insert({
          ...data,
          author_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          likes_count: 0,
          comments_count: 0,
          is_pinned: false,
          is_edited: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      return post;
    } catch (error) {
      console.error('Error in createPost:', error);
      throw error;
    }
  }

  async getPosts(communityId: string): Promise<Post[]> {
    try {
      const { data: posts, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      return posts;
    } catch (error) {
      console.error('Error in getPosts:', error);
      throw error;
    }
  }

  async getPostById(id: string): Promise<Post | null> {
    try {
      const { data: post, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching post:', error);
        throw error;
      }

      return post;
    } catch (error) {
      console.error('Error in getPostById:', error);
      throw error;
    }
  }

  async getFeedPosts(page = 1, limit = 10) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        user:users(id, username, full_name, avatar_url),
        likes:post_likes(user_id)
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    return { data: data as (Post & { user: any, likes: any[] })[], error };
  }

  async getUserPosts(userId: string, page = 1, limit = 10) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    return { data: data as Post[], error };
  }

  async likePost(postId: string, userId: string) {
    const { error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: userId });
    
    if (!error) {
      await supabase.rpc('increment_post_likes', { post_id: postId });
    }
    
    return { error };
  }

  async unlikePost(postId: string, userId: string) {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .match({ post_id: postId, user_id: userId });
    
    if (!error) {
      await supabase.rpc('decrement_post_likes', { post_id: postId });
    }
    
    return { error };
  }
} 
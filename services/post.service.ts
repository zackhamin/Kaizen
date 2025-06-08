import { supabase } from '../lib/supabase';
import { BaseService } from './base.service';

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export class PostService extends BaseService {
  constructor() {
    super('posts');
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
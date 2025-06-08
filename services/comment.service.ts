import { supabase } from '../lib/supabase';
import { BaseService } from './base.service';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export class CommentService extends BaseService {
  constructor() {
    super('comments');
  }

  async getPostComments(postId: string, page = 1, limit = 10) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        user:users(id, username, full_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    return { data: data as (Comment & { user: any })[], error };
  }

  async likeComment(commentId: string, userId: string) {
    const { error } = await supabase
      .from('comment_likes')
      .insert({ comment_id: commentId, user_id: userId });
    
    if (!error) {
      await supabase.rpc('increment_comment_likes', { comment_id: commentId });
    }
    
    return { error };
  }

  async unlikeComment(commentId: string, userId: string) {
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .match({ comment_id: commentId, user_id: userId });
    
    if (!error) {
      await supabase.rpc('decrement_comment_likes', { comment_id: commentId });
    }
    
    return { error };
  }
} 
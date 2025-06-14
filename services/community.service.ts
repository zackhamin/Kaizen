import { supabase } from '../lib/supabase';
import { BaseService } from './base.service';
import { UserService } from './user.service';

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count: number;
  is_private: boolean;
  avatar_url?: string;
  banner_url?: string;
  rules?: string[];
  tags?: string[];
  post_count?: number;
  moderator_only_posting?: boolean;
}

export class CommunityService extends BaseService {
  private userService: UserService;
  private table = 'pods';
  private membersTable = 'community_members';

  constructor() {
    super('pods');
    this.userService = new UserService();
  }

  async getAllpods(page = 1, limit = 10) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('member_count', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    return { data: data as Community[], error };
  }

  async searchpods(query: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('member_count', { ascending: false });
    
    return { data: data as Community[], error };
  }

  async createCommunity(data: Omit<Community, 'id' | 'created_at' | 'updated_at' | 'member_count' | 'created_by'>): Promise<Community> {
    try {
      // Get the current auth user directly
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Auth error:', authError);
        throw new Error('User not authenticated');
      }

      console.log('Creating community with user ID:', user.id);

      // Create the community directly with the auth user ID
      const { data: community, error } = await supabase
        .from(this.tableName)
        .insert({
          ...data,
          created_by: user.id, // Use auth user ID directly
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          member_count: 1
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating community:', error);
        throw error;
      }

      // Add the creator as a member
      console.log('Adding creator as community member...');
      const { error: memberError } = await supabase
        .from('community_members')
        .insert({
          community_id: community.id,
          user_id: user.id, // Use auth user ID directly
          role: 'admin',
          joined_at: new Date().toISOString()
        });

      if (memberError) {
        console.error('Error adding creator as member:', memberError);
        // Don't throw here, as the community was created successfully
      }

      console.log('Community created successfully:', community.id);
      return community;
    } catch (error) {
      console.error('Error in createCommunity:', error);
      throw error;
    }
  }

  async joinCommunity(communityId: string, userId: string) {
    const { error } = await supabase
      .from('community_members')
      .insert({ community_id: communityId, user_id: userId });
    
    if (!error) {
      await supabase.rpc('increment_community_members', { community_id: communityId });
    }
    
    return { error };
  }

  async leaveCommunity(communityId: string, userId: string) {
    const { error } = await supabase
      .from('community_members')
      .delete()
      .match({ community_id: communityId, user_id: userId });
    
    if (!error) {
      await supabase.rpc('decrement_community_members', { community_id: communityId });
    }
    
    return { error };
  }

  async getUserpods(): Promise<Community[]> {
    try {
      // Get the current auth user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Get all pods where the user is a member
      const { data: pods, error } = await supabase
        .from(this.table)
        .select(`
          *,
          members:community_members!inner(user_id)
        `)
        .eq('members.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user pods:', error);
        throw error;
      }

      return pods;
    } catch (error) {
      console.error('Error in getUserpods:', error);
      throw error;
    }
  }
} 
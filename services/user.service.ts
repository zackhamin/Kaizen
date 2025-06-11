import { supabase } from '@/lib/supabase';
import { BaseService } from './base.service';

export interface Profile {
  id: string;
  username?: string | null;
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  location?: string | null;
  created_at?: string;
  updated_at?: string;
  is_verified?: boolean;
  badges?: any[];
  notification_settings?: {
    posts: boolean;
    comments: boolean;
    mentions: boolean;
  };
  privacy_settings?: {
    show_location: boolean;
    show_communities: boolean;
  };
  health_conditions?: string[];
  diagnosis_date?: string | null;
  treatment_status?: string | null;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  } | null;
}

export class UserService extends BaseService {
  constructor() {
    super('profiles');
  }

  async getCurrentUser(): Promise<Profile | null> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Error getting auth user:', authError);
        throw authError;
      }

      if (!authUser) {
        console.log('No authenticated user found');
        return null;
      }

      // Try to get existing profile
      const { data: profile, error: profileError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          console.log('Profile not found, creating new profile for user:', authUser.id);
          return this.createProfile(authUser.id);
        }
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      return profile;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      throw error;
    }
  }

  private async createProfile(userId: string): Promise<Profile> {
    try {
      console.log('Creating new profile for user:', userId);
      
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const email = authUser.user?.email;
      const displayName = email?.split('@')[0] || 'User';

      const newProfile = {
        id: userId,
        display_name: displayName,
        // username is now optional
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_verified: false,
        badges: [],
        notification_settings: {
          posts: true,
          comments: true,
          mentions: true
        },
        privacy_settings: {
          show_location: true,
          show_communities: true
        },
        health_conditions: []
      };

      console.log('Inserting new profile:', newProfile);

      const { data: profile, error: insertError } = await supabase
        .from(this.tableName)
        .insert(newProfile)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating profile:', insertError);
        throw insertError;
      }

      console.log('Successfully created profile:', profile);
      return profile;
    } catch (error) {
      console.error('Error in createProfile:', error);
      throw error;
    }
  }

  async ensureProfile(): Promise<Profile> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Error getting auth user in ensureProfile:', authError);
        throw authError;
      }

      if (!authUser) {
        throw new Error('No authenticated user found');
      }

      const profile = await this.getCurrentUser();
      if (!profile) {
        return this.createProfile(authUser.id);
      }

      return profile;
    } catch (error) {
      console.error('Error in ensureProfile:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  }

  async searchUsers(query: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10);
    
    return { data: data as Profile[], error };
  }
} 
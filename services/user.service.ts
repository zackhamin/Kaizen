import { supabase } from '@/lib/supabase';
import { BaseService } from './base.service';

export interface Profile {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
}

export class UserService extends BaseService {
  constructor() {
    super('profiles');
  }

  async ensureUserRecord(): Promise<Profile> {
    try {
      // Get the current session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      if (!session?.user) {
        throw new Error('No active session found');
      }

      const user = session.user;
      console.log('Ensuring user record for:', user.id);

      // Try to get existing profile first using the secure function
      const { data: existingProfile, error: fetchError } = await supabase
        .rpc('get_profile_by_user_id', { user_id: user.id });

      if (!fetchError && existingProfile) {
        console.log('Profile already exists:', existingProfile.id);
        return existingProfile as Profile;
      }

      // Profile doesn't exist or we can't access it, create it using secure function
      console.log('Creating new profile for user:', user.id);
      return await this.createProfile(user);

    } catch (error) {
      console.error('Error in ensureUserRecord:', error);
      throw error;
    }
  }

  private async createProfile(authUser: any): Promise<Profile> {
    try {
      console.log('Creating profile for user:', authUser.id);
      
      // Get additional user data from auth metadata if available
      const fullName = authUser.user_metadata?.full_name || 
                      authUser.email?.split('@')[0] || 
                      'User';

      console.log('Using secure function to create profile...');

      // Use the secure function to create the profile
      const { data, error } = await supabase.rpc('create_profile_for_user', {
        user_id: authUser.id,
        user_email: authUser.email!,
        user_full_name: fullName
      });

      if (error) {
        console.error('Error calling create_profile_for_user:', error);
        throw error;
      }

      console.log('Successfully created profile via function:', data);
      return data as Profile;
    } catch (error) {
      console.error('Error in createProfile:', error);
      throw error;
    }
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

      // Ensure profile exists and return it
      return await this.ensureUserRecord();
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
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
      .from('profiles')
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);
    
    return { data: data as Profile[], error };
  }
}
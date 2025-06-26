import { supabase } from '@/lib/supabase';

// Types
export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  alias?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  alias?: string;
  created_at: string;
  updated_at: string;
}

// Modern functional service
export const userService = {
  // Get current user profile
  async getCurrentUser(): Promise<Profile> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('UserService.getCurrentUser:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('UserService.updateProfile:', error);
      throw error;
    }
  },

  // Set user alias (anonymous username)
  async setAlias(alias: string): Promise<Profile> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      // Check if alias is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('alias', alias)
        .neq('id', user.id)
        .single();

      if (existingUser) {
        throw new Error('This username is already taken. Please choose another one.');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ alias: alias.trim() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('UserService.setAlias:', error);
      throw error;
    }
  },

  // Update user avatar
  async updateAvatar(avatarUrl: string): Promise<Profile> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('UserService.updateAvatar:', error);
      throw error;
    }
  },

  // Delete user account
  async deleteAccount(): Promise<void> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      // Delete user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Delete user from auth
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (authDeleteError) throw authDeleteError;
    } catch (error) {
      console.error('UserService.deleteAccount:', error);
      throw error;
    }
  },

  // Get user by ID (for admin purposes)
  async getUserById(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return data;
    } catch (error) {
      console.error('UserService.getUserById:', error);
      throw error;
    }
  },

  // Search users by alias (for admin purposes)
  async searchUsersByAlias(alias: string): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('alias', `%${alias}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('UserService.searchUsersByAlias:', error);
      throw error;
    }
  }
}; 
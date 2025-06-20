import { supabase } from '@/lib/supabase';
import { BaseService } from './base.service';
import { UserService } from './user.service';

export interface GratitudeEntry {
  id: string;
  user_id: string;
  content: string;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

export class GratitudeService extends BaseService {
  private userService: UserService;

  constructor() {
    super('gratitude_entries');
    this.userService = new UserService();
  }

  private async ensureUserRecord(): Promise<void> {
    try {
      await this.userService.ensureUserRecord();
    } catch (error) {
      console.error('Error ensuring user record:', error);
      throw error;
    }
  }

  async getCurrentUserGratitudeEntries(date?: string): Promise<GratitudeEntry[]> {
    try {
      await this.ensureUserRecord();
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_user_gratitude_entries', {
        p_user_id: user.id,
        p_entry_date: date || new Date().toISOString().split('T')[0]
      });

      if (error) {
        console.error('Error fetching gratitude entries:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCurrentUserGratitudeEntries:', error);
      throw error;
    }
  }

  async createGratitudeEntry(content: string, date?: string): Promise<GratitudeEntry> {
    try {
      await this.ensureUserRecord();
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('create_user_gratitude_entry', {
        p_user_id: user.id,
        p_content: content,
        p_entry_date: date || new Date().toISOString().split('T')[0]
      });

      if (error) {
        console.error('Error creating gratitude entry:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createGratitudeEntry:', error);
      throw error;
    }
  }

  async updateGratitudeEntry(id: string, content: string): Promise<GratitudeEntry> {
    try {
      await this.ensureUserRecord();
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('update_user_gratitude_entry', {
        entry_id: id,
        p_user_id: user.id,
        p_content: content
      });

      if (error) {
        console.error('Error updating gratitude entry:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateGratitudeEntry:', error);
      throw error;
    }
  }

  async deleteGratitudeEntry(id: string): Promise<void> {
    try {
      await this.ensureUserRecord();
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.rpc('delete_user_gratitude_entry', {
        entry_id: id,
        p_user_id: user.id
      });

      if (error) {
        console.error('Error deleting gratitude entry:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteGratitudeEntry:', error);
      throw error;
    }
  }

  async getGratitudeEntriesForDate(date: string): Promise<GratitudeEntry[]> {
    try {
      return await this.getCurrentUserGratitudeEntries(date);
    } catch (error) {
      console.error('Error in getGratitudeEntriesForDate:', error);
      throw error;
    }
  }
} 
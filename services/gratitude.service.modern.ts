import { supabase } from '@/lib/supabase';

// Types
export interface GratitudeEntry {
  id: string;
  user_id: string;
  content: string;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

// Modern functional service
export const gratitudeService = {
  // Get gratitude entries for current user for a specific date (defaults to today)
  async getCurrentUserGratitudeEntries(date?: string): Promise<GratitudeEntry[]> {
    try {
      console.log('gratitudeService: Getting entries for date:', date || 'today');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('get_user_gratitude_entries', {
        p_user_id: user.id,
        p_entry_date: date || new Date().toISOString().split('T')[0]
      });

      if (error) throw error;
      console.log('gratitudeService: Retrieved entries:', data);
      
      // Ensure we always return an array
      const entries = Array.isArray(data) ? data : (data ? [data] : []);
      return entries;
    } catch (error) {
      console.error('gratitudeService: Error fetching gratitude entries:', error);
      throw error;
    }
  },

  // Create a new gratitude entry
  async createGratitudeEntry(content: string, date?: string): Promise<GratitudeEntry> {
    try {
      console.log('gratitudeService: Creating entry:', content, 'for date:', date || 'today');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('create_user_gratitude_entry', {
        p_user_id: user.id,
        p_content: content.trim(),
        p_entry_date: date || new Date().toISOString().split('T')[0]
      });

      if (error) throw error;
      console.log('gratitudeService: Created entry:', data);
      
      // Handle case where RPC returns an array instead of single object
      const entry = Array.isArray(data) ? data[0] : data;
      return entry;
    } catch (error) {
      console.error('gratitudeService: Error creating gratitude entry:', error);
      throw error;
    }
  },

  // Update an existing gratitude entry
  async updateGratitudeEntry(id: string, content: string): Promise<GratitudeEntry> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('update_user_gratitude_entry', {
        entry_id: id,
        p_user_id: user.id,
        p_content: content.trim()
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('gratitudeService: Error updating gratitude entry:', error);
      throw error;
    }
  },

  // Delete a gratitude entry
  async deleteGratitudeEntry(id: string): Promise<void> {
    try {
      console.log('gratitudeService: Deleting entry:', id);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.rpc('delete_user_gratitude_entry', {
        entry_id: id,
        p_user_id: user.id
      });

      if (error) throw error;
      console.log('gratitudeService: Deleted entry successfully');
    } catch (error) {
      console.error('gratitudeService: Error deleting gratitude entry:', error);
      throw error;
    }
  },

  // Get gratitude entries for a specific date
  async getGratitudeEntriesForDate(date: string): Promise<GratitudeEntry[]> {
    try {
      return await this.getCurrentUserGratitudeEntries(date);
    } catch (error) {
      console.error('gratitudeService: Error in getGratitudeEntriesForDate:', error);
      throw error;
    }
  }
}; 
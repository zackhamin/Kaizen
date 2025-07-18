import { supabase } from '@/lib/supabase';

export interface DailyCheckin {
  id: string;
  user_id: string;
  checkin_date: string;
  energy_level: number;
  challenge_handling: number;
  focus_level: number;
  created_at: string;
  updated_at: string;
}

export interface DailyNote {
  id: string;
  user_id: string;
  note_text: string;
  note_date: string;
  created_at: string;
  updated_at: string;
}

// Modern functional service
export const dailyCheckinService = {
  // Get today's check-in for current user
  async getTodayCheckin(): Promise<DailyCheckin | null> {
    try {
      console.log('dailyCheckinService: Getting today\'s checkin');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().slice(0, 10);
      
      const { data, error } = await supabase.rpc('get_user_daily_checkin', {
        p_user_id: user.id,
        p_checkin_date: today
      });

      if (error) throw error;
      console.log('dailyCheckinService: Retrieved checkin:', data);
      
      // Handle case where RPC returns an array instead of single object
      const checkin = Array.isArray(data) ? data[0] : data;
      return checkin || null;
    } catch (error) {
      console.error('dailyCheckinService: Error fetching today checkin:', error);
      throw error;
    }
  },

  // Upsert a daily check-in
  async upsertCheckin(values: Omit<DailyCheckin, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DailyCheckin> {
    try {
      console.log('dailyCheckinService: Upserting checkin:', values);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('upsert_user_daily_checkin', {
        p_user_id: user.id,
        p_checkin_date: values.checkin_date,
        p_energy_level: values.energy_level,
        p_challenge_handling: values.challenge_handling,
        p_focus_level: values.focus_level
      });

      if (error) throw error;
      console.log('dailyCheckinService: Upserted checkin:', data);
      
      // Handle case where RPC returns an array instead of single object
      const checkin = Array.isArray(data) ? data[0] : data;
      return checkin;
    } catch (error) {
      console.error('dailyCheckinService: Error upserting checkin:', error);
      throw error;
    }
  },

  // Get check-in for a specific date
  async getCheckinForDate(date: string): Promise<DailyCheckin | null> {
    try {
      console.log('dailyCheckinService: Getting checkin for date:', date);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('get_user_daily_checkin', {
        p_user_id: user.id,
        p_checkin_date: date
      });

      if (error) throw error;
      console.log('dailyCheckinService: Retrieved checkin for date:', data);
      
      // Handle case where RPC returns an array instead of single object
      const checkin = Array.isArray(data) ? data[0] : data;
      return checkin || null;
    } catch (error) {
      console.error('dailyCheckinService: Error fetching checkin for date:', error);
      throw error;
    }
  }
};

// Daily Notes Service
export const dailyNotesService = {
  // Get today's notes for current user
  async getTodayNotes(): Promise<DailyNote[]> {
    try {
      console.log('dailyNotesService: Getting today\'s notes');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().slice(0, 10);
      
      const { data, error } = await supabase
        .from('daily_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('note_date', today)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('dailyNotesService: Retrieved notes:', data);
      return data || [];
    } catch (error) {
      console.error('dailyNotesService: Error fetching today notes:', error);
      throw error;
    }
  },

  // Create a new daily note
  async createNote(noteText: string): Promise<DailyNote> {
    try {
      console.log('dailyNotesService: Creating note:', noteText);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().slice(0, 10);
      
      const { data, error } = await supabase
        .from('daily_notes')
        .insert({
          user_id: user.id,
          note_text: noteText.trim(),
          note_date: today
        })
        .select()
        .single();

      if (error) throw error;
      console.log('dailyNotesService: Created note:', data);
      return data;
    } catch (error) {
      console.error('dailyNotesService: Error creating note:', error);
      throw error;
    }
  },

  // Get notes for a specific date
  async getNotesForDate(date: string): Promise<DailyNote[]> {
    try {
      console.log('dailyNotesService: Getting notes for date:', date);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('note_date', date)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('dailyNotesService: Retrieved notes for date:', data);
      return data || [];
    } catch (error) {
      console.error('dailyNotesService: Error fetching notes for date:', error);
      throw error;
    }
  },

  // Delete a note
  async deleteNote(noteId: string): Promise<void> {
    try {
      console.log('dailyNotesService: Deleting note:', noteId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('daily_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;
      console.log('dailyNotesService: Deleted note:', noteId);
    } catch (error) {
      console.error('dailyNotesService: Error deleting note:', error);
      throw error;
    }
  }
};

// Export individual functions for hooks
export const getTodayCheckin = dailyCheckinService.getTodayCheckin;
export const upsertCheckin = dailyCheckinService.upsertCheckin;
export const getCheckinForDate = dailyCheckinService.getCheckinForDate;

export type { DailyCheckin as DailyCheckins };

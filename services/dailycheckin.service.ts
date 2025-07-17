import { supabase } from '@/lib/supabase';

export interface DailyCheckin {
  id: string;
  user_id: string;
  checkin_date: string;
  energy_level: number;
  challenge_handling: number;
  focus_level: number;
  notes?: string;
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
        p_focus_level: values.focus_level,
        p_notes: values.notes
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

// Export individual functions for hooks
export const getTodayCheckin = dailyCheckinService.getTodayCheckin;
export const upsertCheckin = dailyCheckinService.upsertCheckin;
export const getCheckinForDate = dailyCheckinService.getCheckinForDate;

export type { DailyCheckin as DailyCheckins };

import { supabase } from '../lib/supabase';
import { BaseService } from './base.service';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export class UserService extends BaseService {
  constructor() {
    super('users');
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return { data: null, error };

    return this.getById<User>(user.id);
  }

  async updateProfile(userId: string, profileData: Partial<User>) {
    return this.update<User>(userId, profileData);
  }

  async searchUsers(query: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10);
    
    return { data: data as User[], error };
  }
} 
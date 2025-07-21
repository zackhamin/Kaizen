import { supabase } from '../lib/supabase';

// Types
export interface Task {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  type: 'everyday' | 'today';
  task_date?: string | null;
}

export const taskService = {

// Create a new everyday task
async createTask(text: string): Promise<Task> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('create_user_task', {
      p_user_id: user.id,
      task_text: text.trim()
    });

    if (error) throw error;
    return data[0]; // RPC returns array, get first item
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
},

  // Get all everyday tasks for current user
  async getEverydayTasks(): Promise<Task[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const today = new Date().toISOString().slice(0, 10);

      const { data, error } = await supabase.rpc('get_user_everyday_tasks_with_completion', {
        p_user_id: user.id,
        p_date: today
      });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching everyday tasks:', error);
      throw error;
    }
  },

// Toggle task completion
async toggleTask(id: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const today = new Date().toISOString().slice(0, 10);

    const { error } = await supabase.rpc('toggle_task_completion', {
      p_user_id: user.id,
      p_task_id: id,
      p_date: today
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error toggling task:', error);
    throw error;
  }
},

  // Soft delete a task
  async softDeleteTask(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.rpc('delete_user_task', {
        task_id: id,
        p_user_id: user.id
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Update task text
  async updateTaskText(id: string, text: string): Promise<Task> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('update_user_task', {
        task_id: id,
        p_user_id: user.id,
        updates: { text: text.trim() }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }
}; 
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

// Modern functional service using RPC functions
export const taskService = {
  // Get all tasks for current user
  async getCurrentUserTasks(): Promise<Task[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('get_user_tasks', {
        p_user_id: user.id
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Get all everyday tasks for current user
  async getEverydayTasks(): Promise<Task[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'everyday')
        .is('deleted_at', null)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching everyday tasks:', error);
      throw error;
    }
  },

  // Get all today's tasks for current user
  async getTodayTasks(): Promise<Task[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'today')
        .eq('task_date', today)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching today tasks:', error);
      throw error;
    }
  },

  // Create a new task (with type and optional task_date)
  async createTask(text: string, type: 'everyday' | 'today' = 'today', task_date?: string): Promise<Task> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const insertData: any = {
        user_id: user.id,
        text: text.trim(),
        type,
      };
      if (type === 'today') {
        insertData.task_date = task_date || new Date().toISOString().slice(0, 10);
      }
      const { data, error } = await supabase
        .from('tasks')
        .insert([insertData])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Toggle task completion
  async toggleTask(id: string): Promise<Task> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First get the current task to toggle its completed status
      const tasks = await this.getCurrentUserTasks();
      const currentTask = tasks.find(task => task.id === id);
      
      if (!currentTask) {
        throw new Error('Task not found');
      }

      const { data, error } = await supabase.rpc('update_user_task', {
        task_id: id,
        p_user_id: user.id,
        updates: { completed: !currentTask.completed }
      });

      if (error) throw error;
      return data;
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
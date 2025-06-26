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

  // Create a new task
  async createTask(text: string): Promise<Task> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('create_user_task', {
        p_user_id: user.id,
        task_text: text.trim()
      });

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
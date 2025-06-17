import { supabase } from '@/lib/supabase';
import { BaseService } from './base.service';
import { UserService } from './user.service';

export interface Task {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export class TaskService extends BaseService {
  private userService: UserService;

  constructor() {
    super('tasks');
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

  async getCurrentUserTasks(): Promise<Task[]> {
    try {
      await this.ensureUserRecord();
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_user_tasks', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCurrentUserTasks:', error);
      throw error;
    }
  }

  async createTask(text: string): Promise<Task> {
    try {
      await this.ensureUserRecord();
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('create_user_task', {
        p_user_id: user.id,
        task_text: text
      });

      if (error) {
        console.error('Error creating task:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createTask:', error);
      throw error;
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      await this.ensureUserRecord();
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('update_user_task', {
        task_id: id,
        p_user_id: user.id,
        updates: updates
      });

      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateTask:', error);
      throw error;
    }
  }

  async toggleTask(id: string): Promise<Task> {
    try {
      await this.ensureUserRecord();
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

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

      if (error) {
        console.error('Error toggling task:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in toggleTask:', error);
      throw error;
    }
  }

  async softDeleteTask(id: string): Promise<void> {
    try {
      await this.ensureUserRecord();
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('delete_user_task', {
        task_id: id,
        p_user_id: user.id
      });

      if (error) {
        console.error('Error soft deleting task:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in softDeleteTask:', error);
      throw error;
    }
  }

  async getRemainingTasksCount(): Promise<number> {
    try {
      const tasks = await this.getCurrentUserTasks();
      return tasks.filter(task => !task.completed).length;
    } catch (error) {
      console.error('Error in getRemainingTasksCount:', error);
      return 0;
    }
  }
}
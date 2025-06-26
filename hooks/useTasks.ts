import { supabase } from '@/lib/supabase';
import { Task, taskService } from '@/services/task.service.modern';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

// Query keys
export const queryKeys = {
  tasks: ['tasks'] as const,
};

// Hook for fetching tasks
export function useTasks() {
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: async () => {
      console.log('useTasks: Fetching tasks...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('useTasks: No user found, skipping fetch');
        throw new Error('User not authenticated');
      }
      console.log('useTasks: User authenticated, fetching tasks for:', user.id);
      const tasks = await taskService.getCurrentUserTasks();
      console.log('useTasks: Fetched tasks:', tasks.length);
      return tasks;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if user is not authenticated
      if (error?.message === 'User not authenticated') {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook for creating a task
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (text: string) => taskService.createTask(text),
    onSuccess: (newTask) => {
      // Optimistically add to tasks list
      queryClient.setQueryData(
        queryKeys.tasks,
        (oldData: Task[] | undefined) => {
          if (!oldData) return [newTask];
          return [newTask, ...oldData];
        }
      );
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
}

// Hook for toggling a task
export function useToggleTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => taskService.toggleTask(id),
    onSuccess: (updatedTask) => {
      // Update in tasks list
      queryClient.setQueryData(
        queryKeys.tasks,
        (oldData: Task[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((task: Task) => 
            task.id === updatedTask.id ? updatedTask : task
          );
        }
      );
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
}

// Hook for deleting a task
export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => taskService.softDeleteTask(id),
    onSuccess: (_, deletedId) => {
      // Remove from tasks list
      queryClient.setQueryData(
        queryKeys.tasks,
        (oldData: Task[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter((task: Task) => task.id !== deletedId);
        }
      );
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
}

// Hook for updating task text
export function useUpdateTaskText() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => 
      taskService.updateTaskText(id, text),
    onSuccess: (updatedTask) => {
      // Update in tasks list
      queryClient.setQueryData(
        queryKeys.tasks,
        (oldData: Task[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((task: Task) => 
            task.id === updatedTask.id ? updatedTask : task
          );
        }
      );
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
}

// Legacy hook for backward compatibility
export const useTasksLegacy = () => {
  const { data: tasks = [], isLoading: loading, error, refetch } = useTasks();
  const createMutation = useCreateTask();
  const toggleMutation = useToggleTask();
  const deleteMutation = useDeleteTask();
  const updateMutation = useUpdateTaskText();

  const addTask = useCallback(async (text: string) => {
    try {
      await createMutation.mutateAsync(text);
    } catch (err) {
      console.error('Error adding task:', err);
      throw err;
    }
  }, [createMutation]);

  const toggleTask = useCallback(async (id: string) => {
    try {
      await toggleMutation.mutateAsync(id);
    } catch (err) {
      console.error('Error toggling task:', err);
      throw err;
    }
  }, [toggleMutation]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  }, [deleteMutation]);

  const updateTaskText = useCallback(async (id: string, text: string) => {
    try {
      await updateMutation.mutateAsync({ id, text });
    } catch (err) {
      console.error('Error updating task text:', err);
      throw err;
    }
  }, [updateMutation]);

  const refreshTasks = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    tasks,
    loading,
    error: error?.message || null,
    addTask,
    toggleTask,
    deleteTask,
    updateTaskText,
    refreshTasks,
  };
}; 
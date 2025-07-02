import { Task, taskService } from '@/services/task.service.modern';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

// Query keys
export const queryKeys = {
  everydayTasks: ['tasks', 'everyday'] as const,
  todayTasks: ['tasks', 'today'] as const,
};

// Hook for fetching everyday tasks
export function useEverydayTasks() {
  return useQuery({
    queryKey: queryKeys.everydayTasks,
    queryFn: () => taskService.getEverydayTasks(),
    staleTime: 1000 * 60 * 2,
  });
}

// Hook for fetching today's tasks
export function useTodayTasks() {
  return useQuery({
    queryKey: queryKeys.todayTasks,
    queryFn: () => taskService.getTodayTasks(),
    staleTime: 1000 * 60 * 2,
  });
}

// Hook for creating an everyday task
export function useCreateEverydayTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => taskService.createTask(text, 'everyday'),
    onSuccess: (newTask) => {
      queryClient.setQueryData(
        queryKeys.everydayTasks,
        (oldData: Task[] | undefined) => {
          if (!oldData) return [newTask];
          return [newTask, ...oldData];
        }
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.everydayTasks });
    },
  });
}

// Hook for creating a today task
export function useCreateTodayTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => taskService.createTask(text, 'today'),
    onSuccess: (newTask) => {
      queryClient.setQueryData(
        queryKeys.todayTasks,
        (oldData: Task[] | undefined) => {
          if (!oldData) return [newTask];
          return [newTask, ...oldData];
        }
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTasks });
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
        queryKeys.everydayTasks,
        (oldData: Task[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((task: Task) => 
            task.id === updatedTask.id ? updatedTask : task
          );
        }
      );
      
      queryClient.setQueryData(
        queryKeys.todayTasks,
        (oldData: Task[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((task: Task) => 
            task.id === updatedTask.id ? updatedTask : task
          );
        }
      );
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.everydayTasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTasks });
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
        queryKeys.everydayTasks,
        (oldData: Task[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter((task: Task) => task.id !== deletedId);
        }
      );
      
      queryClient.setQueryData(
        queryKeys.todayTasks,
        (oldData: Task[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter((task: Task) => task.id !== deletedId);
        }
      );
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.everydayTasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTasks });
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
        queryKeys.everydayTasks,
        (oldData: Task[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((task: Task) => 
            task.id === updatedTask.id ? updatedTask : task
          );
        }
      );
      
      queryClient.setQueryData(
        queryKeys.todayTasks,
        (oldData: Task[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((task: Task) => 
            task.id === updatedTask.id ? updatedTask : task
          );
        }
      );
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.everydayTasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTasks });
    },
  });
}

// Legacy hook for backward compatibility
export const useTasksLegacy = () => {
  const { data: everydayTasks = [], isLoading: loadingEveryday, error: errorEveryday, refetch: refetchEveryday } = useEverydayTasks();
  const { data: todayTasks = [], isLoading: loadingToday, error: errorToday, refetch: refetchToday } = useTodayTasks();
  const createTodayMutation = useCreateTodayTask();
  const toggleMutation = useToggleTask();
  const deleteMutation = useDeleteTask();
  const updateMutation = useUpdateTaskText();

  const addTask = useCallback(async (text: string) => {
    try {
      await createTodayMutation.mutateAsync(text);
    } catch (err) {
      console.error('Error adding today task:', err);
      throw err;
    }
  }, [createTodayMutation]);

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
    await refetchEveryday();
    await refetchToday();
  }, [refetchEveryday, refetchToday]);

  return {
    everydayTasks,
    todayTasks,
    loading: loadingEveryday || loadingToday,
    error: errorEveryday?.message || errorToday?.message || null,
    addTask,
    toggleTask,
    deleteTask,
    updateTaskText,
    refreshTasks,
  };
}; 
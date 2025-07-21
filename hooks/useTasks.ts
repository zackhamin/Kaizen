import { Task, taskService } from '@/services/task.service.modern';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query keys
export const queryKeys = {
  everydayTasks: ['tasks', 'everyday'] as const,
};

export function useEverydayTasks() {
  return useQuery({
    queryKey: queryKeys.everydayTasks,
    queryFn: () => taskService.getEverydayTasks(),
    staleTime: 1000 * 60 * 2,
  });
}

// Hook for creating an everyday task
export function useCreateEverydayTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => taskService.createTask(text),
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

// Hook for toggling a task
export function useToggleTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => taskService.toggleTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.everydayTasks });
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
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.everydayTasks });
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

      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.everydayTasks });
    },
  });
}

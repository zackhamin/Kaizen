import { supabase } from '@/lib/supabase';
import { GratitudeEntry, gratitudeService } from '@/services/gratitude.service.modern';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query keys
export const queryKeys = {
  gratitudeEntries: ['gratitude', 'entries'] as const,
  gratitudeEntriesForDate: (date: string) => ['gratitude', 'entries', 'date', date] as const,
};

// Hook for fetching gratitude entries
export function useGratitudeEntries(date?: string) {
  return useQuery({
    queryKey: date ? queryKeys.gratitudeEntriesForDate(date) : queryKeys.gratitudeEntries,
    queryFn: async () => {
      console.log('useGratitudeEntries: Fetching gratitude entries...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('useGratitudeEntries: No user found, skipping fetch');
        throw new Error('User not authenticated');
      }
      console.log('useGratitudeEntries: User authenticated, fetching entries for:', user.id);
      const entries = await gratitudeService.getCurrentUserGratitudeEntries(date);
      console.log('useGratitudeEntries: Fetched entries:', entries.length);
      return entries;
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

// Hook for creating a gratitude entry
export function useCreateGratitudeEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ content, date }: { content: string; date?: string }) => 
      gratitudeService.createGratitudeEntry(content, date),
    onSuccess: (newEntry) => {
      // Ensure we have a single entry object, not an array
      const entry = Array.isArray(newEntry) ? newEntry[0] : newEntry;
      
      // Update the main gratitude entries list
      queryClient.setQueryData(
        queryKeys.gratitudeEntries,
        (oldData: GratitudeEntry[] | undefined) => {
          if (!oldData) return [entry];
          return [entry, ...oldData];
        }
      );
      
      // Update the date-specific query if it exists
      if (entry.created_at) {
        const entryDate = new Date(entry.created_at).toISOString().split('T')[0];
        queryClient.setQueryData(
          queryKeys.gratitudeEntriesForDate(entryDate),
          (oldData: GratitudeEntry[] | undefined) => {
            if (!oldData) return [entry];
            return [entry, ...oldData];
          }
        );
      }
      
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.gratitudeEntries });
    },
  });
}

// Hook for updating a gratitude entry
export function useUpdateGratitudeEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => 
      gratitudeService.updateGratitudeEntry(id, content),
    onSuccess: (updatedEntry) => {
      // Update in all gratitude entry queries
      queryClient.setQueryData(
        queryKeys.gratitudeEntries,
        (oldData: GratitudeEntry[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((entry: GratitudeEntry) => 
            entry.id === updatedEntry.id ? updatedEntry : entry
          );
        }
      );
      
      // Update in date-specific queries
      if (updatedEntry.created_at) {
        const entryDate = new Date(updatedEntry.created_at).toISOString().split('T')[0];
        queryClient.setQueryData(
          queryKeys.gratitudeEntriesForDate(entryDate),
          (oldData: GratitudeEntry[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map(entry => 
              entry.id === updatedEntry.id ? updatedEntry : entry
            );
          }
        );
      }
      
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.gratitudeEntries });
    },
  });
}

// Hook for deleting a gratitude entry
export function useDeleteGratitudeEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => gratitudeService.deleteGratitudeEntry(id),
    onSuccess: (_, deletedId) => {
      // Remove from all gratitude entry queries
      queryClient.setQueryData(
        queryKeys.gratitudeEntries,
        (oldData: GratitudeEntry[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter(entry => entry.id !== deletedId);
        }
      );
      
      // Remove from date-specific queries
      queryClient.invalidateQueries({ queryKey: queryKeys.gratitudeEntries });
    },
  });
}

// Hook for getting gratitude entries for a specific date
export function useGratitudeEntriesForDate(date: string) {
  return useQuery({
    queryKey: queryKeys.gratitudeEntriesForDate(date),
    queryFn: () => gratitudeService.getGratitudeEntriesForDate(date),
    enabled: !!date,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
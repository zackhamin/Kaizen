import { DailyCheckin, dailyCheckinService } from '@/services/dailycheckin.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const queryKeys = {
  todayCheckin: ['dailyCheckin', 'today'] as const,
  // checkinsForDate: (date: string) => ['dailyCheckin', 'date', date] as const,
};

export function useTodayCheckin() {
  return useQuery({
    queryKey: queryKeys.todayCheckin,
    queryFn: () => dailyCheckinService.getTodayCheckin(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpsertDailyCheckin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: Omit<DailyCheckin, 'id' | 'user_id' | 'created_at' | 'updated_at'>) =>
      dailyCheckinService.upsertCheckin(values),
    onSuccess: (newCheckin) => {
      queryClient.setQueryData(queryKeys.todayCheckin, newCheckin);
      // Optionally invalidate other queries if needed
    },
  });
}

// Hook for creating a daily note
export function useCreateDailyNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notes: string) => dailyCheckinService.createDailyNote(notes),
    onSuccess: (newNote) => {
      // Invalidate the today checkin query to refetch with new data
      queryClient.invalidateQueries({ queryKey: queryKeys.todayCheckin });
    },
  });
}

// export function useDailyCheckinsForDate(date: string) {
//   return useQuery({
//     queryKey: queryKeys.checkinsForDate(date),
//     queryFn: () => dailyCheckinService.getCheckinsForDate(date),
//     enabled: !!date,
//     staleTime: 1000 * 60 * 2,
//   });
// } 
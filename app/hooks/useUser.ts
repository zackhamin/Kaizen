import { supabase } from '@/lib/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Profile, userService } from '../../services/user.service.modern';

// Query keys
export const queryKeys = {
  currentUser: ['user', 'current'] as const,
  userById: (userId: string) => ['user', userId] as const,
  usersByAlias: (alias: string) => ['users', 'search', alias] as const,
};

// Hook for fetching current user
export function useCurrentUser() {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => userService.getCurrentUser(),
    staleTime: 1000 * 30, // 30 seconds - more aggressive for user data
    gcTime: 1000 * 60 * 2, // 2 minutes cache time
    retry: 2,
    refetchOnWindowFocus: true, // Refetch when app comes back to focus
  });

  // Monitor authentication state changes to invalidate user cache
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('useCurrentUser: Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        console.log('useCurrentUser: Invalidating user cache due to auth change');
        // Invalidate user cache when auth state changes
        queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
        queryClient.removeQueries({ queryKey: queryKeys.currentUser });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return query;
}

// Hook for fetching user by ID
export function useUserById(userId: string) {
  return useQuery({
    queryKey: queryKeys.userById(userId),
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

// Hook for searching users by alias
export function useUsersByAlias(alias: string) {
  return useQuery({
    queryKey: queryKeys.usersByAlias(alias),
    queryFn: () => userService.searchUsersByAlias(alias),
    enabled: !!alias && alias.length >= 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
  });
}

// Hook for updating user profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Partial<Profile>) => userService.updateProfile(updates),
    onSuccess: (updatedProfile) => {
      // Update current user cache
      queryClient.setQueryData(queryKeys.currentUser, updatedProfile);
      
      // Update user by ID cache if it exists
      queryClient.setQueryData(queryKeys.userById(updatedProfile.id), updatedProfile);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

// Hook for setting user alias
export function useSetAlias() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (alias: string) => userService.setAlias(alias),
    onSuccess: (updatedProfile) => {
      // Update current user cache
      queryClient.setQueryData(queryKeys.currentUser, updatedProfile);
      
      // Update user by ID cache if it exists
      queryClient.setQueryData(queryKeys.userById(updatedProfile.id), updatedProfile);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

// Hook for updating user avatar
export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (avatarUrl: string) => userService.updateAvatar(avatarUrl),
    onSuccess: (updatedProfile) => {
      // Update current user cache
      queryClient.setQueryData(queryKeys.currentUser, updatedProfile);
      
      // Update user by ID cache if it exists
      queryClient.setQueryData(queryKeys.userById(updatedProfile.id), updatedProfile);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

// Hook for deleting user account
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => userService.deleteAccount(),
    onSuccess: () => {
      // Clear all user-related cache
      queryClient.removeQueries({ queryKey: ['user'] });
      queryClient.removeQueries({ queryKey: ['users'] });
    },
  });
} 
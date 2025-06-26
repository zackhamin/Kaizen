import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../app/context/AuthContext';
import { UserProfile, userService } from '../services/user.service.modern';

// Query keys
export const queryKeys = {
  currentUser: ['user', 'current'] as const,
  userById: (userId: string) => ['user', userId] as const,
  usersByAlias: (alias: string) => ['users', 'search', alias] as const,
};

// Hook for fetching current user
export function useCurrentUser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      console.log('useCurrentUser: User authenticated, fetching profile for:', user.id);
      return userService.getCurrentUser(user);
    },
    staleTime: 1000 * 30, // 30 seconds - more aggressive for user data
    gcTime: 1000 * 60 * 2, // 2 minutes cache time
    retry: 2,
    refetchOnWindowFocus: true, // Refetch when app comes back to focus
    enabled: !!user, // Only enabled when user exists
  });

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Partial<UserProfile>) => {
      if (!user) throw new Error('User not authenticated');
      return userService.updateProfile(user, updates);
    },
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (alias: string) => {
      if (!user) throw new Error('User not authenticated');
      return userService.setAlias(user, alias);
    },
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (avatarUrl: string) => {
      if (!user) throw new Error('User not authenticated');
      return userService.updateAvatar(user, avatarUrl);
    },
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => {
      if (!user) throw new Error('User not authenticated');
      return userService.deleteAccount(user);
    },
    onSuccess: () => {
      // Clear all user-related cache
      queryClient.removeQueries({ queryKey: ['user'] });
      queryClient.removeQueries({ queryKey: ['users'] });
    },
  });
} 
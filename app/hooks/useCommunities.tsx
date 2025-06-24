import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChatReply, ChatThread, Community, CommunityService } from '../../services/community.service';

const communityService = new CommunityService();

// Query keys
export const queryKeys = {
  communities: ['communities'] as const,
  communityThreads: (communityId: string) => ['communities', communityId, 'threads'] as const,
  threadDetail: (threadId: string) => ['threads', threadId] as const,
  threadReplies: (threadId: string) => ['threads', threadId, 'replies'] as const,
};

// Hook for fetching communities
export function useCommunities() {
  return useQuery({
    queryKey: queryKeys.communities,
    queryFn: () => communityService.getCommunities(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook for fetching community threads
export function useCommunityThreads(communityId: string) {
  return useQuery({
    queryKey: queryKeys.communityThreads(communityId),
    queryFn: () => communityService.getCommunityThreads(communityId),
    enabled: !!communityId,
    staleTime: 1000 * 60, // 1 minute - less aggressive
    retry: 2, // Limit retries
    retryDelay: 1000, // Wait 1 second between retries
  });
}

// Hook for fetching thread detail
export function useThreadDetail(threadId: string) {
  return useQuery({
    queryKey: queryKeys.threadDetail(threadId),
    queryFn: () => communityService.getThreadDetail(threadId),
    enabled: !!threadId,
    staleTime: 1000 * 60, // 1 minute - less aggressive
    retry: 2, // Limit retries
    retryDelay: 1000, // Wait 1 second between retries
  });
}

// Hook for creating a new thread
export function useCreateThread() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ communityId, title, content }: { 
      communityId: string; 
      title: string; 
      content: string; 
    }) => communityService.createThread(communityId, title, content),
    onSuccess: (newThread, { communityId }) => {
      // Optimistically update the community threads list
      queryClient.setQueryData(
        queryKeys.communityThreads(communityId),
        (oldData: ChatThread[] | undefined) => {
          if (!oldData) return [newThread];
          
          // Add new thread at the top (unless there are pinned threads)
          const pinnedThreads = oldData.filter(t => t.is_pinned);
          const regularThreads = oldData.filter(t => !t.is_pinned);
          
          return [...pinnedThreads, newThread, ...regularThreads];
        }
      );
      
      // Update community thread count
      queryClient.setQueryData(
        queryKeys.communities,
        (oldData: Community[] | undefined) => {
          if (!oldData) return oldData;
          
          return oldData.map(community => 
            community.id === communityId
              ? { ...community, thread_count: (community.thread_count || 0) + 1 }
              : community
          );
        }
      );
      
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.communityThreads(communityId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.communities });
    },
  });
}

// Hook for creating a reply
export function useCreateReply() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ threadId, content, parentReplyId }: { 
      threadId: string; 
      content: string; 
      parentReplyId?: string; 
    }) => communityService.createReply(threadId, content, parentReplyId),
    onSuccess: (newReply, { threadId }) => {
      // Optimistically update the thread replies
      queryClient.setQueryData(
        queryKeys.threadReplies(threadId),
        (oldData: ChatReply[] | undefined) => {
          if (!oldData) return [newReply];
          return [...oldData, newReply];
        }
      );
      
      // Update thread reply count
      queryClient.setQueryData(
        queryKeys.threadDetail(threadId),
        (oldData: { thread: ChatThread; replies: ChatReply[] } | undefined) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            thread: {
              ...oldData.thread,
              reply_count: (oldData.thread.reply_count || 0) + 1,
              latest_reply: {
                created_at: newReply.created_at,
                alias_username: newReply.alias_username
              }
            }
          };
        }
      );
      
      // Update the specific community threads to reflect the new reply
      // We need to find which community this thread belongs to
      const allCommunities = queryClient.getQueryData(queryKeys.communities) as Community[] | undefined;
      if (allCommunities) {
        // Find the community that contains this thread
        for (const community of allCommunities) {
          const communityThreads = queryClient.getQueryData(queryKeys.communityThreads(community.id)) as ChatThread[] | undefined;
          if (communityThreads) {
            const threadIndex = communityThreads.findIndex(t => t.id === threadId);
            if (threadIndex !== -1) {
              // Update the specific thread in this community
              const updatedThreads = [...communityThreads];
              updatedThreads[threadIndex] = {
                ...updatedThreads[threadIndex],
                reply_count: (updatedThreads[threadIndex].reply_count || 0) + 1,
                latest_reply: {
                  created_at: newReply.created_at,
                  alias_username: newReply.alias_username
                }
              };
              
              queryClient.setQueryData(queryKeys.communityThreads(community.id), updatedThreads);
              break; // Found the community, no need to check others
            }
          }
        }
      }
      
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.threadReplies(threadId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.threadDetail(threadId) });
    },
  });
}

// Hook for adding reactions
export function useAddReaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contentType, contentId, reactionType }: { 
      contentType: 'thread' | 'reply'; 
      contentId: string; 
      reactionType: string; 
    }) => communityService.addReaction(contentType, contentId, reactionType),
    onSuccess: (_, { contentType, contentId }) => {
      // Optimistically update reaction counts
      if (contentType === 'thread') {
        queryClient.setQueryData(
          queryKeys.threadDetail(contentId),
          (oldData: { thread: ChatThread; replies: ChatReply[] } | undefined) => {
            if (!oldData) return oldData;
            
            return {
              ...oldData,
              thread: {
                ...oldData.thread,
                reaction_count: (oldData.thread.reaction_count || 0) + 1
              }
            };
          }
        );
        
        // Also update the thread in community lists
        const allCommunities = queryClient.getQueryData(queryKeys.communities) as Community[] | undefined;
        if (allCommunities) {
          for (const community of allCommunities) {
            const communityThreads = queryClient.getQueryData(queryKeys.communityThreads(community.id)) as ChatThread[] | undefined;
            if (communityThreads) {
              const threadIndex = communityThreads.findIndex(t => t.id === contentId);
              if (threadIndex !== -1) {
                const updatedThreads = [...communityThreads];
                updatedThreads[threadIndex] = {
                  ...updatedThreads[threadIndex],
                  reaction_count: (updatedThreads[threadIndex].reaction_count || 0) + 1
                };
                
                queryClient.setQueryData(queryKeys.communityThreads(community.id), updatedThreads);
                break;
              }
            }
          }
        }
      } else {
        // For reply reactions, we need to update the specific reply
        // This is more complex and might require refetching
        queryClient.invalidateQueries({ queryKey: queryKeys.threadDetail(contentId) });
      }
    },
  });
}

// Hook for removing reactions
export function useRemoveReaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contentType, contentId, reactionType }: { 
      contentType: 'thread' | 'reply'; 
      contentId: string; 
      reactionType: string; 
    }) => communityService.removeReaction(contentType, contentId, reactionType),
    onSuccess: (_, { contentType, contentId }) => {
      // Optimistically update reaction counts
      if (contentType === 'thread') {
        queryClient.setQueryData(
          queryKeys.threadDetail(contentId),
          (oldData: { thread: ChatThread; replies: ChatReply[] } | undefined) => {
            if (!oldData) return oldData;
            
            return {
              ...oldData,
              thread: {
                ...oldData.thread,
                reaction_count: Math.max(0, (oldData.thread.reaction_count || 0) - 1)
              }
            };
          }
        );
        
        // Also update the thread in community lists
        const allCommunities = queryClient.getQueryData(queryKeys.communities) as Community[] | undefined;
        if (allCommunities) {
          for (const community of allCommunities) {
            const communityThreads = queryClient.getQueryData(queryKeys.communityThreads(community.id)) as ChatThread[] | undefined;
            if (communityThreads) {
              const threadIndex = communityThreads.findIndex(t => t.id === contentId);
              if (threadIndex !== -1) {
                const updatedThreads = [...communityThreads];
                updatedThreads[threadIndex] = {
                  ...updatedThreads[threadIndex],
                  reaction_count: Math.max(0, (updatedThreads[threadIndex].reaction_count || 0) - 1)
                };
                
                queryClient.setQueryData(queryKeys.communityThreads(community.id), updatedThreads);
                break;
              }
            }
          }
        }
      } else {
        // For reply reactions, invalidate to refetch
        queryClient.invalidateQueries({ queryKey: queryKeys.threadDetail(contentId) });
      }
    },
  });
} 
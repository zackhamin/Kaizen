import { supabase } from '@/lib/supabase';
import { useEffect, useRef, useState } from 'react';
import { ChatReply, ChatThread, Community } from '../../services/community.service';

// Test function to check if real-time is working
export async function testRealtimeConnection() {
  console.log('Testing real-time connection...');
  
  try {
    const channel = supabase
      .channel('test-connection')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'communities'
      }, (payload) => {
        console.log('✅ Real-time test successful - received payload:', payload);
      })
      .subscribe((status) => {
        console.log('🔌 Real-time test subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time is working!');
        } else if (status === 'CLOSED') {
          console.log('❌ Real-time connection closed');
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Real-time channel error');
        } else if (status === 'TIMED_OUT') {
          console.log('❌ Real-time connection timed out');
        }
      });

    // Clean up after 5 seconds
    setTimeout(() => {
      console.log('🧹 Cleaning up test connection');
      supabase.removeChannel(channel);
    }, 5000);

    return true;
  } catch (error) {
    console.error('❌ Real-time test failed:', error);
    return false;
  }
}

// Hook for real-time communities
export function useRealtimeCommunities(initialCommunities: Community[] = []) {
  const [communities, setCommunities] = useState<Community[]>(initialCommunities);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Setting up real-time subscription for communities');
    setCommunities(initialCommunities);
    setConnectionError(null);

    // Create a unique channel name
    const channelName = 'communities-list';
    
    // Remove any existing channel first
    const existingChannel = supabase.getChannels().find(ch => ch.topic === channelName);
    if (existingChannel) {
      console.log('Removing existing channel:', channelName);
      supabase.removeChannel(existingChannel);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'communities'
        },
        (payload) => {
          console.log('✅ New community received:', payload.new);
          const newCommunity = payload.new as Community;
          
          setCommunities(prevCommunities => {
            // Check if community already exists to avoid duplicates
            const exists = prevCommunities.some(c => c.id === newCommunity.id);
            if (exists) return prevCommunities;
            
            return [...prevCommunities, newCommunity];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'communities'
        },
        (payload) => {
          console.log('✅ Community updated:', payload.new);
          const updatedCommunity = payload.new as Community;
          
          setCommunities(prevCommunities =>
            prevCommunities.map(community =>
              community.id === updatedCommunity.id 
                ? { ...community, ...updatedCommunity }
                : community
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'communities'
        },
        (payload) => {
          console.log('✅ Community deleted:', payload.old);
          setCommunities(prevCommunities =>
            prevCommunities.filter(community => community.id !== payload.old.id)
          );
        }
      )
      // Listen for thread updates to update community thread counts
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_threads'
        },
        (payload) => {
          console.log('✅ New thread received, updating community counts');
          const newThread = payload.new as any;
          
          setCommunities(prevCommunities =>
            prevCommunities.map(community => {
              if (community.id === newThread.community_id) {
                return {
                  ...community,
                  thread_count: (community.thread_count || 0) + 1
                };
              }
              return community;
            })
          );
        }
      )
      .subscribe((status) => {
        console.log('🔌 Communities subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Communities real-time subscription successful');
          setConnectionError(null);
        } else if (status === 'CLOSED') {
          console.log('❌ Communities real-time subscription closed');
          setConnectionError('Connection closed');
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Communities real-time channel error');
          setConnectionError('Channel error');
        } else if (status === 'TIMED_OUT') {
          console.log('❌ Communities real-time connection timed out');
          setConnectionError('Connection timed out');
        }
      });

    return () => {
      console.log('🧹 Cleaning up communities subscription:', channelName);
      supabase.removeChannel(channel);
      setIsConnected(false);
      setConnectionError(null);
    };
  }, []);

  // Update communities when initialCommunities change
  useEffect(() => {
    setCommunities(initialCommunities);
  }, [initialCommunities]);

  return { communities, isConnected, connectionError };
}

// Hook for real-time community threads
export function useRealtimeCommunityThreads(communityId: string, initialThreads: ChatThread[] = []) {
  const [threads, setThreads] = useState<ChatThread[]>(initialThreads);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    // Don't set up subscription if communityId is empty or invalid
    if (!communityId || communityId.trim() === '') {
      console.log('No community ID provided, skipping subscription');
      setThreads(initialThreads);
      setIsConnected(false);
      setConnectionError(null);
      return;
    }

    console.log('Setting up real-time subscription for community:', communityId);
    setThreads(initialThreads);
    setConnectionError(null);

    // Create a unique channel name
    const channelName = `community-threads-${communityId}`;
    
    // Clean up any existing subscription first
    if (subscriptionRef.current) {
      console.log('Cleaning up existing subscription before creating new one');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    // Remove any existing channel first
    const existingChannel = supabase.getChannels().find(ch => ch.topic === channelName);
    if (existingChannel) {
      console.log('Removing existing channel:', channelName);
      supabase.removeChannel(existingChannel);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_threads',
          filter: `community_id=eq.${communityId}`
        },
        (payload) => {
          console.log('✅ New thread received:', payload.new);
          const newThread = payload.new as ChatThread;
          
          // Add optimistic counts
          newThread.reply_count = 0;
          newThread.reaction_count = 0;
          newThread.latest_reply = null;
          
          setThreads(prevThreads => {
            // Check if thread already exists to avoid duplicates
            const exists = prevThreads.some(t => t.id === newThread.id);
            if (exists) return prevThreads;
            
            // Add new thread at the top (unless there are pinned threads)
            const pinnedThreads = prevThreads.filter(t => t.is_pinned);
            const regularThreads = prevThreads.filter(t => !t.is_pinned);
            
            return [...pinnedThreads, newThread, ...regularThreads];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_threads',
          filter: `community_id=eq.${communityId}`
        },
        (payload) => {
          console.log('✅ Thread updated:', payload.new);
          const updatedThread = payload.new as ChatThread;
          
          setThreads(prevThreads =>
            prevThreads.map(thread =>
              thread.id === updatedThread.id 
                ? { ...thread, ...updatedThread }
                : thread
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_threads',
          filter: `community_id=eq.${communityId}`
        },
        (payload) => {
          console.log('✅ Thread deleted:', payload.old);
          setThreads(prevThreads =>
            prevThreads.filter(thread => thread.id !== payload.old.id)
          );
        }
      )
      // Listen for reply updates to update thread counts
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_replies'
        },
        async (payload) => {
          console.log('✅ New reply received, updating thread counts');
          const newReply = payload.new as ChatReply;
          
          // Update the thread's reply count and latest reply
          setThreads(prevThreads =>
            prevThreads.map(thread => {
              if (thread.id === newReply.thread_id) {
                return {
                  ...thread,
                  reply_count: (thread.reply_count || 0) + 1,
                  latest_reply: {
                    created_at: newReply.created_at,
                    alias_username: newReply.alias_username
                  }
                };
              }
              return thread;
            })
          );
        }
      )
      // Listen for reaction updates
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_reactions'
        },
        (payload) => {
          console.log('✅ New reaction received:', payload.new);
          const newReaction = payload.new as any;
          
          setThreads(prevThreads =>
            prevThreads.map(thread => {
              if (thread.id === newReaction.thread_id) {
                return {
                  ...thread,
                  reaction_count: (thread.reaction_count || 0) + 1
                };
              }
              return thread;
            })
          );
        }
      )
      .subscribe((status) => {
        console.log('🔌 Community subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Community real-time subscription successful');
          setConnectionError(null);
          subscriptionRef.current = channel;
        } else if (status === 'CLOSED') {
          console.log('❌ Community real-time subscription closed');
          setConnectionError('Connection closed');
          subscriptionRef.current = null;
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Community real-time channel error');
          setConnectionError('Channel error');
          subscriptionRef.current = null;
        } else if (status === 'TIMED_OUT') {
          console.log('❌ Community real-time connection timed out');
          setConnectionError('Connection timed out');
          subscriptionRef.current = null;
        }
      });

    return () => {
      console.log('🧹 Cleaning up community subscription:', channelName);
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      setIsConnected(false);
      setConnectionError(null);
    };
  }, [communityId]);

  // Update threads when initialThreads change
  useEffect(() => {
    setThreads(initialThreads);
  }, [initialThreads]);

  return { threads, isConnected, connectionError };
}

// Hook for real-time thread replies
export function useRealtimeThreadReplies(threadId: string, initialReplies: ChatReply[] = []) {
  const [replies, setReplies] = useState<ChatReply[]>(initialReplies);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    // Don't set up subscription if threadId is empty or invalid
    if (!threadId || threadId.trim() === '') {
      console.log('No thread ID provided, skipping subscription');
      setReplies(initialReplies);
      setIsConnected(false);
      setConnectionError(null);
      return;
    }

    console.log('Setting up real-time subscription for thread:', threadId);
    setReplies(initialReplies);
    setConnectionError(null);

    // Create a unique channel name
    const channelName = `thread-replies-${threadId}`;
    
    // Clean up any existing subscription first
    if (subscriptionRef.current) {
      console.log('Cleaning up existing subscription before creating new one');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    
    // Remove any existing channel first
    const existingChannel = supabase.getChannels().find(ch => ch.topic === channelName);
    if (existingChannel) {
      console.log('Removing existing channel:', channelName);
      supabase.removeChannel(existingChannel);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_replies',
          filter: `thread_id=eq.${threadId}`
        },
        (payload) => {
          console.log('✅ New reply received:', payload.new);
          const newReply = payload.new as ChatReply;
          
          // Add optimistic reaction count
          newReply.reaction_count = 0;
          
          setReplies(prevReplies => {
            // Check if reply already exists to avoid duplicates
            const exists = prevReplies.some(r => r.id === newReply.id);
            if (exists) return prevReplies;
            
            return [...prevReplies, newReply];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_replies',
          filter: `thread_id=eq.${threadId}`
        },
        (payload) => {
          console.log('✅ Reply updated:', payload.new);
          const updatedReply = payload.new as ChatReply;
          
          setReplies(prevReplies =>
            prevReplies.map(reply =>
              reply.id === updatedReply.id 
                ? { ...reply, ...updatedReply }
                : reply
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_replies',
          filter: `thread_id=eq.${threadId}`
        },
        (payload) => {
          console.log('✅ Reply deleted:', payload.old);
          setReplies(prevReplies =>
            prevReplies.filter(reply => reply.id !== payload.old.id)
          );
        }
      )
      // Listen for reaction updates on replies
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_reactions'
        },
        (payload) => {
          console.log('✅ New reply reaction received:', payload.new);
          const newReaction = payload.new as any;
          
          setReplies(prevReplies =>
            prevReplies.map(reply => {
              if (reply.id === newReaction.reply_id) {
                return {
                  ...reply,
                  reaction_count: (reply.reaction_count || 0) + 1
                };
              }
              return reply;
            })
          );
        }
      )
      .subscribe((status) => {
        console.log('🔌 Thread replies subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Thread replies real-time subscription successful');
          setConnectionError(null);
          subscriptionRef.current = channel;
        } else if (status === 'CLOSED') {
          console.log('❌ Thread replies real-time subscription closed');
          setConnectionError('Connection closed');
          subscriptionRef.current = null;
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Thread replies real-time channel error');
          setConnectionError('Channel error');
          subscriptionRef.current = null;
        } else if (status === 'TIMED_OUT') {
          console.log('❌ Thread replies real-time connection timed out');
          setConnectionError('Connection timed out');
          subscriptionRef.current = null;
        }
      });

    return () => {
      console.log('🧹 Cleaning up thread replies subscription:', channelName);
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      setIsConnected(false);
      setConnectionError(null);
    };
  }, [threadId]);

  // Update replies when initialReplies change
  useEffect(() => {
    setReplies(initialReplies);
  }, [initialReplies]);

  return { replies, isConnected, connectionError };
}

// Hook for real-time reaction updates
export function useRealtimeReactions(contentType: 'thread' | 'reply', contentId: string) {
  const [reactionCount, setReactionCount] = useState(0);
  const [userReactions, setUserReactions] = useState<string[]>([]);

  useEffect(() => {
    if (!contentId) return;

    const channel = supabase
      .channel(`reactions-${contentType}-${contentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_reactions',
          filter: `${contentType}_id=eq.${contentId}`
        },
        (payload) => {
          console.log('New reaction:', payload.new);
          setReactionCount(prev => prev + 1);
          
          // Check if it's current user's reaction
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user && payload.new.user_id === user.id) {
              setUserReactions(prev => [...prev, payload.new.reaction_type]);
            }
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_reactions',
          filter: `${contentType}_id=eq.${contentId}`
        },
        (payload) => {
          console.log('Reaction removed:', payload.old);
          setReactionCount(prev => Math.max(0, prev - 1));
          
          // Check if it's current user's reaction
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user && payload.old.user_id === user.id) {
              setUserReactions(prev => prev.filter(r => r !== payload.old.reaction_type));
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contentType, contentId]);

  return { reactionCount, userReactions };
}

// Hook for connection status
export function useRealtimeStatus() {
  const [isConnected, setIsConnected] = useState(true); // Default to connected
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('connected');

  useEffect(() => {
    // In React Native, we'll monitor Supabase connection status instead of browser online/offline
    // For now, we'll assume connected and let individual subscriptions handle their own status
    
    // You could integrate with NetInfo for actual network status in React Native:
    // import NetInfo from '@react-native-netinfo/netinfo';
    
    setIsConnected(true);
    setConnectionState('connected');

    // Optional: Add NetInfo integration here
    // const unsubscribe = NetInfo.addEventListener(state => {
    //   setIsConnected(state.isConnected ?? false);
    //   setConnectionState(state.isConnected ? 'connected' : 'disconnected');
    // });
    
    // return () => {
    //   unsubscribe();
    // };
  }, []);

  return { isConnected, connectionState };
}
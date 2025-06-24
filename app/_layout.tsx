// app/_layout.tsx - Add community routes
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router, Stack, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../constants/theme';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    console.log('Setting up auth listener...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting initial session:', error);
      } else if (session) {
        console.log('Found existing session for:', session.user.email);
      } else {
        console.log('No existing session found');
      }
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      setIsLoading(false);
    });

    return () => {
      console.log('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inCommunityPage = segments[0] === 'community' || segments[0] === 'thread';
    const inOtherPages = segments[0] === 'communities' || segments[0] === 'gratitude' || segments[0] === 'settings' || segments[0] === 'create-thread';
    
    console.log('Navigation check:', {
      hasUser: !!session?.user,
      inAuthGroup,
      inTabsGroup,
      inCommunityPage,
      inOtherPages,
      segments
    });

    // Only redirect if user is not authenticated and not already in auth group
    if (!session?.user && !inAuthGroup) {
      console.log('No user, redirecting to auth');
      router.replace('/(auth)/sign-in');
    } 
    // Only redirect to main app if user is authenticated but in auth group
    else if (session?.user && inAuthGroup) {
      console.log('User found in auth group, redirecting to main app');
      router.replace('/(tabs)');
    }
    // Don't redirect if user is authenticated and on any valid page
    // This prevents the app from resetting when auth state refreshes
  }, [session, segments, isLoading]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: colors.background.light
          }}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        </GestureHandlerRootView>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colors.background.light,
            },
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="gratitude" options={{ headerShown: false }} />
          
          {/* Community Routes */}
          <Stack.Screen name="communities" options={{ headerShown: false }} />
          <Stack.Screen name="community/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="thread/[id]" options={{ headerShown: false }} />
          
          {/* Modal screens */}
          <Stack.Screen 
            name="create-thread" 
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              headerShown: true,
              headerTitle: 'Create Post',
              headerStyle: {
                backgroundColor: colors.background.light,
              },
              headerTitleStyle: {
                color: colors.text.primary.dark,
                fontSize: 18,
                fontWeight: '600',
              },
              headerLeft: () => null,
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{ paddingRight: 16 }}
                >
                  <Text style={{ 
                    color: colors.primary.main, 
                    fontSize: 16,
                    fontWeight: '500' 
                  }}>Cancel</Text>
                </TouchableOpacity>
              ),
            }} 
          />
          
          <Stack.Screen 
            name="create-community" 
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              headerShown: true,
              headerTitle: 'Create Community',
              headerStyle: {
                backgroundColor: colors.background.light,
              },
              headerTitleStyle: {
                color: colors.text.primary.dark,
                fontSize: 18,
                fontWeight: '600',
              },
              headerLeft: () => null,
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{ paddingRight: 16 }}
                >
                  <Text style={{ 
                    color: colors.primary.main, 
                    fontSize: 16,
                    fontWeight: '500' 
                  }}>Cancel</Text>
                </TouchableOpacity>
              ),
            }} 
          />
          
          <Stack.Screen 
            name="settings" 
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              headerShown: true,
              headerTitle: 'Settings',
              headerStyle: {
                backgroundColor: colors.background.light,
              },
              headerTitleStyle: {
                color: colors.text.primary.dark,
                fontSize: 18,
                fontWeight: '600',
              },
            }} 
          />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
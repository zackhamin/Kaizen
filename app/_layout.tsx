import { GratitudeProvider } from '@/app/context/GratitudeContext';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router, Stack, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SplashScreen } from '../components/Layout/SplashScreen';
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

  // Handle basic navigation based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    console.log('Navigation check:', {
      hasUser: !!session?.user,
      inAuthGroup,
      segments
    });

    // Only redirect to auth if user is not authenticated and not already in auth group
    if (!session?.user && !inAuthGroup) {
      console.log('No user, redirecting to auth');
      router.replace('/(auth)/sign-in');
    }
  }, [session, segments, isLoading]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <QueryClientProvider client={queryClient}>
        <GratitudeProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SplashScreen 
              isReady={false}
              onReady={() => {}}
            />
          </GestureHandlerRootView>
        </GratitudeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GratitudeProvider>
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
      </GratitudeProvider>
    </QueryClientProvider>
  );
}
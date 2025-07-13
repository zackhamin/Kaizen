import { AuthProvider } from '@/app/context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Root layout with providers
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="gratitude" options={{ headerShown: false }} />
            <Stack.Screen name="vision-board" options={{ headerShown: false }} />
            <Stack.Screen name="create-thread" options={{ headerShown: false }} />
            <Stack.Screen name="community/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="communities" options={{ headerShown: false }} />
            <Stack.Screen name="thread/[id]" options={{ headerShown: false }} />
          </Stack>
        </GestureHandlerRootView>
      </AuthProvider>
    </QueryClientProvider>
  );
}
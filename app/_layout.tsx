import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      const inAuthGroup = segments[0] === '(auth)';
      
      if (!session && !inAuthGroup) {
        // Redirect to sign-in if not authenticated
        router.replace('/sign-in');
      } else if (session && inAuthGroup) {
        // Redirect to home if authenticated
        router.replace('/(tabs)');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const inAuthGroup = segments[0] === '(auth)';
      
      if (!session && !inAuthGroup) {
        router.replace('/sign-in');
      } else if (session && inAuthGroup) {
        router.replace('/(tabs)');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

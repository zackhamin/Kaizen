import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../constants/theme';

export default function RootLayout() {
  useEffect(() => {
    // Handle auth state changes if needed
  }, []);

  return (
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
      
      {/* Modal screens */}
      <Stack.Screen 
        name="create-post" 
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
    );
}
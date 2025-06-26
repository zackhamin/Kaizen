import { useCurrentUser } from '@/app/hooks/useUser';
import GradientBackground from '@/components/Layout/GradientBackground';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Use modern hook for current user
  const { data: user, isLoading, error } = useCurrentUser();

  const handleLogout = async () => {
    // Show confirmation dialog
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? You will need to sign in again to access your account.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('User signing out...');
              
              // Clear all React Query cache
              console.log('Clearing React Query cache...');
              queryClient.clear();
              
              // Sign out from Supabase (this automatically clears the stored token)
              const { error: signOutError } = await supabase.auth.signOut();
              
              if (signOutError) {
                console.error('Sign out error:', signOutError);
                Alert.alert('Error', 'Failed to sign out. Please try again.');
                return;
              }
              
              console.log('User signed out successfully');
              
              // Navigate to sign-in screen
              router.replace('/(auth)/sign-in');
              
            } catch (error) {
              console.error('Unexpected error during sign out:', error);
              Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <GradientBackground>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </GradientBackground>
    );
  }

  if (error) {
    return (
      <GradientBackground>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Could not load user info.</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      {user ? (
        <View style={styles.profileSection}>
          <Ionicons name="person-circle" size={80} color="#007AFF" style={styles.avatar} />
          <Text style={styles.name}>{user.full_name || user.username || user.email}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
        </View>
      ) : (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Could not load user info.</Text>
        </View>
      )}
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  closeButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  avatar: {
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginHorizontal: 24,
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 24,
    marginTop: 'auto',
    marginBottom: 32,
    justifyContent: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
  },
}); 
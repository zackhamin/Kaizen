import GradientBackground from '@/components/Layout/GradientBackground';
import { colors, theme } from '@/constants/theme';
import { useCurrentUser } from '@/hooks/useUser';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

const NAV_OPTIONS = [
  {
    label: 'Account Details',
    icon: 'person-outline',
    onPress: () => {/* TODO: Navigate to Account Details */},
  },
  {
    label: 'Achievements',
    icon: 'trophy-outline',
    onPress: () => {/* TODO: Navigate to Achievements */},
  },
  {
    label: 'Contact Us',
    icon: 'mail-outline',
    onPress: () => {/* TODO: Navigate to Contact Us */},
  },
];

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const { data: user, isLoading, error } = useCurrentUser();

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? You will need to sign in again to access your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              queryClient.clear();
              await signOut();
              router.replace('/(auth)/sign-in');
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <GradientBackground showHeader={false}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent.copper} />
        </View>
      </GradientBackground>
    );
  }

  if (error || !user) {
    return (
      <GradientBackground showHeader={false}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Could not load user info.</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground showHeader={false}>
      <View style={styles.container}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Ionicons name="person-circle" size={90} color={colors.accent.copper} style={styles.avatar} />
          <Text style={styles.name}>{user.full_name || user.username || user.email}</Text>
          {user.alias ? (
            <Text style={styles.alias}>@{user.alias}</Text>
          ) : null}
          <Text style={styles.email}>{user.email}</Text>
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
        </View>

        {/* Navigation List */}
        <View style={styles.navListCard}>
          {NAV_OPTIONS.map((opt, idx) => (
            <TouchableOpacity
              key={opt.label}
              style={styles.navRow}
              onPress={opt.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.navRowLeft}>
                <Ionicons name={opt.icon as any} size={22} color={colors.accent.copper} style={{ marginRight: 14 }} />
                <Text style={styles.navLabel}>{opt.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.glass.text.secondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={colors.accent.white} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,  
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 36,
    paddingBottom: 24,
    justifyContent: 'flex-start',
  },
  profileCard: {
    backgroundColor: colors.glass.overlay,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.glass.text.primary,
    marginBottom: 2,
    textAlign: 'center',
  },
  alias: {
    fontSize: 15,
    color: colors.accent.copper,
    marginBottom: 2,
    textAlign: 'center',
    fontWeight: '500',
  },
  email: {
    fontSize: 15,
    color: colors.glass.text.secondary,
    marginBottom: 6,
    textAlign: 'center',
  },
  bio: {
    fontSize: 14,
    color: colors.glass.text.primary,
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.8,
  },
  navListCard: {
    backgroundColor: colors.glass.overlay,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
    paddingVertical: 2,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.overlayBorder,
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 16,
    color: colors.glass.text.primary,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.copper,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.large,
    marginHorizontal: 0,
    marginBottom: 8,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutText: {
    color: colors.accent.white,
    fontSize: 16,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error.main,
    fontSize: 16,
    textAlign: 'center',
  },
}); 
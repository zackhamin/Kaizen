import { colors, theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GradientBackground from './GradientBackground';

interface StackScreenProps {
  title: string;
  rightActions?: React.ReactNode;
  children: React.ReactNode;
}

export const StackScreen: React.FC<StackScreenProps> = ({ title, rightActions, children }) => {
  const router = useRouter();

  return (
    <GradientBackground showHeader={false}>
      <View style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.glass.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={styles.rightActions}>{rightActions}</View>
        </View>
        <View style={styles.content}>{children}</View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.xl : theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    minHeight: 48,
    borderRadius: theme.borderRadius.large,
    // Optionally add a glass background for the header:
    // backgroundColor: colors.glass.overlay,
    // borderWidth: 1,
    // borderColor: colors.glass.overlayBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.large,
    backgroundColor: colors.glass.buttonDefault,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.glass.text.primary,
    textAlign: 'center',
    marginRight: 40, // To balance the back button
  },
  rightActions: {
    position: 'absolute',
    right: 0,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  content: {
    flex: 1,
  },
}); 
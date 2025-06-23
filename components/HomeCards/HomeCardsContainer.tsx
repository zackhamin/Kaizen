import { useGratitudeData } from '@/app/context/GratitudeContext';
import { colors, theme } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { HomeCard } from './HomeCard';

export const HomeCardsContainer: React.FC = () => {
  const { gratitudeCount, tasksCount, completedTasksCount, isLoading } = useGratitudeData();
  const router = useRouter();

  const handleGratitudePress = () => {
    router.push('/gratitude');
  };

  const handleTasksPress = () => {
    router.push('/(tabs)/wins');
  };

  const handleCBTPress = () => {
    router.push('/(tabs)/cbt');
  };

  const handleMoodPress = () => {
    // Placeholder for mood tracking feature
    console.log('Mood tracking coming soon!');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.glass.text.primary} />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Today's Goals</Text>
      
      <View style={styles.grid}>
        <View style={styles.row}>
          <HomeCard
            title="Gratitude"
            subtitle="Three things you're grateful for"
            count={gratitudeCount}
            maxCount={3}
            onPress={handleGratitudePress}
            style={styles.card}
          />
          <HomeCard
            title="Small Wins"
            subtitle="What will you achieve today?"
            count={completedTasksCount}
            maxCount={tasksCount || 1}
            onPress={handleTasksPress}
            style={styles.card}
          />
        </View>
        
        <View style={styles.row}>
          <HomeCard
            title="Group Chat"
            subtitle="Anonymous group chat"
            onPress={handleCBTPress}
            style={styles.card}
          />
          <HomeCard
            title="Coming soon"
            subtitle=""
            onPress={handleMoodPress}
            style={styles.card}
            disabled={true}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.glass.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  grid: {
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 120,
  },
  card: {
    flex: 1,
    minWidth: 0, // This prevents cards from expanding beyond their container
  },
  loadingContainer: {
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    fontSize: 16,
    color: colors.glass.text.secondary,
  },
});
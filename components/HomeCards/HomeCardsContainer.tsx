import { colors, theme } from '@/constants/theme';
import { useGratitudeEntries } from '@/hooks/useGratitude';
import { useTasks } from '@/hooks/useTasks';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { HomeCard } from './HomeCard';

export const HomeCardsContainer: React.FC = () => {
  const { data: gratitudeEntries = [], isLoading: gratitudeLoading } = useGratitudeEntries();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  
  const gratitudeCount = gratitudeEntries.length;
  const tasksCount = tasks.length;
  const completedTasksCount = tasks.filter(task => task.completed).length;
  const isLoading = gratitudeLoading || tasksLoading;
  
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

  const handleGroupChatPress = () => {
    router.push('/communities');
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
      
      <View style={styles.grid}>
        <View style={styles.row}>
          <HomeCard
            title="Appreciations"
            subtitle="What makes today worth your energy."
            count={gratitudeCount}
            maxCount={3}
            onPress={handleGratitudePress}
            style={styles.card}
          />
          <HomeCard
            title="Daily targets"
            subtitle="What will you tackle today?"
            count={completedTasksCount}
            maxCount={tasksCount || 1}
            onPress={handleTasksPress}
            style={styles.card}
          />
        </View>
        
        <View style={styles.row}>
          <HomeCard
            title="Brotherhood"
            subtitle="Anonymous group chat"
            onPress={handleGroupChatPress}

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


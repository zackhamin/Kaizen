import { DailyCheckinContainer, DailyNotes } from '@/components/DailyCheckins';
import { colors, theme } from '@/constants/theme';
import { useTodayCheckin, useUpsertDailyCheckin } from '@/hooks/useDailyCheckins';
import { useGratitudeEntries } from '@/hooks/useGratitude';
import { useTodayTasks } from '@/hooks/useTasks';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HomeCard } from './HomeCard';

export const HomeCardsContainer: React.FC = () => {
  const { data: gratitudeEntries = [], isLoading: gratitudeLoading } = useGratitudeEntries();
  const { data: tasks = [], isLoading: tasksLoading } = useTodayTasks();
  const { data: checkin } = useTodayCheckin();
  const upsertMutation = useUpsertDailyCheckin();
  const [selectedTab, setSelectedTab] = React.useState<'daily' | 'challenges' | 'support'>('daily');
  
  const gratitudeCount = gratitudeEntries.length;
  const tasksCount = tasks.length;
  const completedTasksCount = tasks.filter(task => task.completed).length;
  const isLoading = gratitudeLoading || tasksLoading;
  
  const router = useRouter();

  const handleGratitudePress = () => {
    router.push('/gratitude');
  };

  const handleTasksPress = () => {
    router.push('/(tabs)/targets');
  };

  const handleMoodPress = () => {
    // Placeholder for mood tracking feature
    console.log('Mood tracking coming soon!');
  };

  const handleGroupChatPress = () => {
    router.push('/communities');
  };

  const handleVisionBoardPress = () => {
    router.push('/vision-board');
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
      {/* Capsule Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: theme.spacing.md }}
      >
        <View style={styles.capsuleBar}>
          <TouchableOpacity
            style={[styles.capsule, selectedTab === 'daily' && styles.capsuleSelected]}
            onPress={() => setSelectedTab('daily')}
            activeOpacity={0.8}
          >
            <Text style={[styles.capsuleText, selectedTab === 'daily' && styles.capsuleTextSelected]}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.capsule, selectedTab === 'challenges' && styles.capsuleSelected]}
            onPress={() => setSelectedTab('challenges')}
            activeOpacity={0.8}
          >
            <Text style={[styles.capsuleText, selectedTab === 'challenges' && styles.capsuleTextSelected]}>Challenges</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.capsule, selectedTab === 'support' && styles.capsuleSelected]}
            onPress={() => setSelectedTab('support')}
            activeOpacity={0.8}
          >
            <Text style={[styles.capsuleText, selectedTab === 'support' && styles.capsuleTextSelected]}>Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Only render grid for 'Daily' for now */}
      {selectedTab === 'daily' && (
        <View style={styles.grid}>
          <View style={styles.row}>
            <HomeCard
              title="Appreciations"
              subtitle="Gratitude, Brother."
              count={gratitudeCount}
              maxCount={3}
              onPress={handleGratitudePress}
              style={styles.card}
            />
            <HomeCard
              title="Daily Targets"
              subtitle="You can do it."
              count={completedTasksCount}
              maxCount={tasksCount || 1}
              onPress={handleTasksPress}
              style={styles.card}
            />
          </View>
          <View>
            <DailyCheckinContainer />
          </View>
          <View>
            <DailyNotes
              checkin={checkin ?? null}
              isSaving={upsertMutation.isPending}
              onSave={notes => {
                if (!checkin) return;
                upsertMutation.mutate({
                  checkin_date: checkin.checkin_date,
                  energy_level: checkin.energy_level,
                  challenge_handling: checkin.challenge_handling,
                  focus_level: checkin.focus_level,
                  notes,
                });
              }}
            />
          </View>
        </View>
      )}
      {selectedTab === 'challenges' && (
        <View style={styles.grid}>
          <View style={styles.row}>

            <HomeCard
              title="Coming soon"
              subtitle=""
              onPress={handleMoodPress}
              style={styles.card}
              disabled={true}
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
      )}
      {selectedTab === 'support' && (
        <View style={styles.grid}>
          <View style={styles.row}>
            <HomeCard
              title="Vision Board"
              subtitle="This Is Why."
              onPress={handleVisionBoardPress}
              style={styles.card}
            />
          </View>
        </View>
      )}
      {/* You can add a grid for 'challenges' here in the future */}
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
  capsuleBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  capsule: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  capsuleSelected: {
    backgroundColor: colors.accent.copper,
    borderColor: colors.accent.copper,
  },
  capsuleText: {
    color: colors.glass.text.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  capsuleTextSelected: {
    color: colors.accent.white,
  },
});  


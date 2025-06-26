import { useGratitudeData } from '@/app/context/GratitudeContext';
import { colors, theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface DailyGoal {
  id: string;
  text: string;
  isCompleted: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}

export const DailyGoals: React.FC = () => {
  const { gratitudeCount, completedTasksCount, isLoading } = useGratitudeData();

  // Debug logging
  useEffect(() => {
    console.log('DailyGoals: Received context update - gratitudeCount:', gratitudeCount, 'completedTasksCount:', completedTasksCount, 'isLoading:', isLoading);
  }, [gratitudeCount, completedTasksCount, isLoading]);

  const goals: DailyGoal[] = [
    {
      id: 'gratitude',
      text: 'Fill out your appreciations',
      isCompleted: gratitudeCount >= 3,
      icon: 'heart'
    },
    {
      id: 'task',
      text: 'Complete 1 daily target',
      isCompleted: completedTasksCount >= 1,
      icon: 'checkmark-circle'
    }
  ];

  console.log('DailyGoals: Rendering with goals:', goals.map(g => ({ id: g.id, isCompleted: g.isCompleted })));

  const renderGoal = (goal: DailyGoal) => (
    <View key={goal.id} style={styles.goalItem}>
      <View style={styles.goalContent}>
        <Text style={[
          styles.goalText,
          goal.isCompleted && styles.goalTextCompleted
        ]}>
          {goal.text}
        </Text>
      </View>
      {goal.isCompleted && (
        <Ionicons 
          name="checkmark-circle" 
          size={20} 
          color={colors.accent.copper} 
        />
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Daily Training</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.glass.text.secondary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Training</Text>
      <View style={styles.goalsList}>
        {goals.map(renderGoal)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glass.overlay,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.overlayBorder,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.glass.text.primary,
    marginBottom: theme.spacing.md,
  },
  goalsList: {
    gap: theme.spacing.md,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalText: {
    fontSize: 16,
    color: colors.glass.text.primary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  goalTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.glass.text.secondary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.glass.text.secondary,
    marginLeft: theme.spacing.sm,
  },
}); 
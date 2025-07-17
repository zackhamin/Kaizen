import CollapsibleCard from '@/components/Cards/CollapsibleCard';
import { NumberScale } from '@/components/Scales/NumberScale';
import { colors, theme } from '@/constants/theme';
import { useTodayCheckin, useUpsertDailyCheckin } from '@/hooks/useDailyCheckins';
import { DailyCheckin } from '@/services/dailycheckin.service';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

const questions = [
  { key: 'energy_level', label: "How's your energy level today?" },
  { key: 'challenge_handling', label: "How well are you handling today's challenges?" },
  { key: 'focus_level', label: "How focused and on-track do you feel?" },
];

const DailyCheckinContainer: React.FC = () => {
  const { data: checkin, isLoading, error, isError } = useTodayCheckin();
  const upsertMutation = useUpsertDailyCheckin();

  const handleChange = (key: string, value: number) => {
    console.log('DailyCheckinContainer: handleChange:', { key, value });
    console.log('DailyCheckinContainer: current checkin:', checkin);
    
    const payload = {
      ...(checkin || {}),
      [key]: value,
      checkin_date: new Date().toISOString().slice(0, 10),
      notes: checkin?.notes || null,
    } as Omit<DailyCheckin, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
    
    console.log('DailyCheckinContainer: mutation payload:', payload);
    upsertMutation.mutate(payload);
  };

  if (isLoading) {
    console.log('DailyCheckinContainer: showing loading state');
    return (
      <View style={[styles.card, { alignItems: 'center', justifyContent: 'center', minHeight: 120 }]}> 
        <ActivityIndicator color={colors.glass.text.primary} />
        <Text style={styles.loadingText}>Loading check-ins...</Text>
      </View>
    );
  }

  if (isError) {
    console.log('DailyCheckinContainer: showing error state:', error);
    return (
      <View style={[styles.card, { alignItems: 'center', justifyContent: 'center', minHeight: 120 }]}> 
        <Text style={styles.errorText}>Error loading check-ins</Text>
        <Text style={styles.errorDetails}>{error?.message || 'Unknown error'}</Text>
      </View>
    );
  }

  return (
    <CollapsibleCard title="Daily Check-in">
      {checkin ? (
        <Text style={styles.subtitle}>Today's responses loaded</Text>
      ) : (
        <Text style={styles.subtitle}>First time today? Start checking in!</Text>
      )}
      
      {questions.map(q => (
        <View key={q.key} style={styles.questionBlock}>
          <Text style={styles.question}>{q.label}</Text>
          <Text style={styles.currentValue}>
            Current: {checkin?.[q.key as keyof typeof checkin] || 0}
          </Text>
          <NumberScale
            value={Number(checkin?.[q.key as keyof typeof checkin] ?? 0)}
            onChange={v => handleChange(q.key, v)}
            min={0}
            max={6}
            disabled={upsertMutation.isPending}
          />
        </View>
      ))}
      
      {upsertMutation.isError && (
        <View style={styles.mutationError}>
          <Text style={styles.errorText}>Update failed: {upsertMutation.error?.message}</Text>
        </View>
      )}
    </CollapsibleCard>
  );
};

export { DailyCheckinContainer };

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass.overlay,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.glass.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.glass.text.secondary,
    marginBottom: theme.spacing.md,
  },
  questionBlock: {
    marginBottom: theme.spacing.lg,
  },
  question: {
    fontSize: 16,
    color: colors.glass.text.primary,
    marginBottom: theme.spacing.sm,
  },
  currentValue: {
    fontSize: 12,
    color: colors.glass.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  loadingText: {
    fontSize: 14,
    color: colors.glass.text.secondary,
    marginTop: theme.spacing.sm,
  },
  errorText: {
    fontSize: 14,
    color: colors.error.main,
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 12,
    color: colors.glass.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  mutationError: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: theme.borderRadius.medium,
  },
});
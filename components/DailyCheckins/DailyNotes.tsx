import CollapsibleCard from '@/components/Cards/CollapsibleCard';
import { colors, theme } from '@/constants/theme';
import { DailyCheckin } from '@/services/dailycheckin.service';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

interface DailyNotesProps {
  checkin: DailyCheckin | null;
  isSaving: boolean;
  onSave: (notes: string) => void;
}

export const DailyNotes: React.FC<DailyNotesProps> = ({ checkin, isSaving, onSave }) => {
  const [notes, setNotes] = useState(checkin?.notes || '');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setNotes(checkin?.notes || '');
    setDirty(false);
  }, [checkin?.notes]);

  const handleSave = () => {
    onSave(notes);
    setDirty(false);
  };

  return (
    <CollapsibleCard title="Notes for Today">
      <Text style={styles.label}>Write your thoughts, reminders, or anything else for today.</Text>
      <TextInput
        style={styles.input}
        value={notes}
        onChangeText={text => { setNotes(text); setDirty(true); }}
        placeholder="Type your notes..."
        placeholderTextColor={colors.glass.text.placeholder}
        multiline
        numberOfLines={4}
        editable={!isSaving}
      />
      <TouchableOpacity
        style={[styles.saveButton, (!dirty || isSaving) && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!dirty || isSaving}
        activeOpacity={0.8}
      >
        {isSaving ? (
          <ActivityIndicator color={colors.accent.white} />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </TouchableOpacity>
    </CollapsibleCard>
  );
};

const styles = StyleSheet.create({
  label: {
    color: colors.glass.text.secondary,
    fontSize: 14,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: colors.glass.overlay,
    color: colors.glass.text.primary,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    fontSize: 16,
    minHeight: 80,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.conversationBorder,
  },
  saveButton: {
    backgroundColor: colors.accent.copper,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.glass.buttonDisabled,
  },
  saveButtonText: {
    color: colors.accent.white,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default DailyNotes; 
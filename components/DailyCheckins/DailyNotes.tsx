import CollapsibleCard from '@/components/Cards/CollapsibleCard';
import { colors, theme } from '@/constants/theme';
import { useCreateDailyNote, useDeleteDailyNote, useTodayNotes } from '@/hooks/useDailyCheckins';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export const DailyNotes: React.FC = () => {
  const [notes, setNotes] = useState('');
  const [dirty, setDirty] = useState(false);
  
  const { data: todayNotes = [], isLoading: isLoadingNotes } = useTodayNotes();
  const createNoteMutation = useCreateDailyNote();
  const deleteNoteMutation = useDeleteDailyNote();

  const isSaving = createNoteMutation.isPending;
  const isDeleting = deleteNoteMutation.isPending;

  const handleSave = () => {
    if (!notes.trim()) return; // Don't save empty notes
    createNoteMutation.mutate(notes.trim());
    setDirty(false);
    setNotes(''); // Clear the text input after save
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNoteMutation.mutate(noteId);
  };

  return (
    <CollapsibleCard title="Notes for Today">
      <Text style={styles.label}>Write your thoughts, reminders, or anything else for today.</Text>
      
      {/* Input section */}
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
        style={[styles.saveButton, (!dirty || isSaving || !notes.trim()) && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!dirty || isSaving || !notes.trim()}
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
    marginBottom: theme.spacing.lg,
  },
  saveButtonDisabled: {
    backgroundColor: colors.glass.buttonDisabled,
  },
  saveButtonText: {
    color: colors.accent.white,
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: colors.glass.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: colors.glass.conversationBorder,
    paddingTop: theme.spacing.md,
  },
  notesSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.glass.text.primary,
    marginBottom: theme.spacing.md,
  },
  notesList: {
    gap: theme.spacing.sm,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: colors.glass.overlay,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.conversationBorder,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: colors.glass.text.primary,
    lineHeight: 20,
  },
  deleteButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
});

export default DailyNotes; 
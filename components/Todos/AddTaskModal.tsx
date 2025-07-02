import { colors, theme } from '@/constants/theme';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (_taskType: 'everyday', text: string) => Promise<void>;
  isSaving?: boolean;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ visible, onClose, onSave, isSaving }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!text.trim()) {
      setError('Please enter a task');
      return;
    }
    setError('');
    try {
      await onSave('everyday', text.trim());
      setText('');
      onClose();
    } catch (e) {
      setError('Failed to add task');
    }
  };

  const handleClose = () => {
    setText('');
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Everyday Task</Text>
          <TextInput
            style={styles.input}
            placeholder={'Go for a walk ...'}
            placeholderTextColor={colors.glass.text.secondary}
            value={text}
            onChangeText={setText}
            editable={!isSaving}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isSaving}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, (!text.trim() || isSaving) && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={!text.trim() || isSaving}
            >
              <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: colors.glass.conversationCard,
    borderRadius: theme.borderRadius.large,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.glass.text.primary,
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    color: colors.glass.text.primary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: 14,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  saveButton: {
    backgroundColor: colors.accent.copper,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.glass.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
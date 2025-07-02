import GradientBackground from '@/components/Layout/GradientBackground';
import { colors } from '@/constants/theme';
import {
  useCreateEverydayTask,
  useDeleteTask,
  useEverydayTasks,
  useToggleTask,
} from '@/hooks/useTasks';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { AddTaskModal } from './AddTaskModal';

const { width: screenWidth } = Dimensions.get('window');

export const Todos: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Everyday Tasks
  const {
    data: everydayTasks = [],
    isLoading: loadingEveryday,
    refetch: refetchEveryday,
  } = useEverydayTasks();

  const createEverydayTaskMutation = useCreateEverydayTask();
  const toggleTaskMutation = useToggleTask();
  const deleteTaskMutation = useDeleteTask();

  const handleToggleTask = async (id: string): Promise<void> => {
    try {
      await toggleTaskMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error toggling task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleDeleteTask = async (id: string): Promise<void> => {
    Alert.alert(
      'Delete Task',
      'Delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTaskMutation.mutateAsync(id);
              refetchEveryday();
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  // Handler for modal save
  const handleModalSave = async (_taskType: 'everyday', text: string) => {
    setIsSaving(true);
    try {
      await createEverydayTaskMutation.mutateAsync(text);
      refetchEveryday();
      setModalVisible(false);
    } catch (e) {
      // Error handled in modal
    } finally {
      setIsSaving(false);
    }
  };

  const renderEverydayTask = ({ item }: { item: any }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity
        style={[styles.checkbox, item.completed && styles.checkboxChecked]}
        onPress={() => handleToggleTask(item.id)}
        activeOpacity={0.7}
      >
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <Text
        style={[
          styles.taskText,
          item.completed && styles.taskTextCompleted,
        ]}
        numberOfLines={0}
      >
        {item.text}
      </Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteTask(item.id)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="delete" size={22} color={colors.accent.white} />
      </TouchableOpacity>
    </View>
  );

  if (loadingEveryday) {
    return (
      <GradientBackground showHeader={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.white} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground showHeader={false}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.content}>
          {/* Everyday Tasks Section */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Everyday Tasks</Text>
            <TouchableOpacity
              style={styles.addButtonInline}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.addButtonInlineText}>Add</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.emptyText}>Building a routine is a great way to improve your mental health.
            Here you can add your non-negotiable daily tasks. These will untick everyday at midnight.</Text>
          <FlatList
            data={everydayTasks}
            renderItem={renderEverydayTask}
            keyExtractor={(item) => item.id}
            style={styles.taskList}
            contentContainerStyle={styles.taskListContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </KeyboardAvoidingView>
      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleModalSave}
        isSaving={isSaving}
      />
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.accent.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 70,
    width: '100%',
    maxWidth: screenWidth,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.accent.white,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 18,
    borderRadius: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'center',
    width: '100%',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    color: colors.accent.white,
    minHeight: 44,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  addButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  addButtonText: {
    fontSize: 24,
    color: colors.accent.white,
    fontWeight: 'bold',
  },
  taskList: {
    flexGrow: 0,
  },
  taskListContent: {
    paddingBottom: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.accent.copper,
    borderColor: colors.accent.copper,
  },
  checkmark: {
    color: colors.accent.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: colors.accent.white,
    lineHeight: 22,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  deleteButtonText: {
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  remainingText: {
    fontSize: 16,
    color: colors.accent.white,
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.8,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    marginBottom: 10,
    textAlign: 'left',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  addButtonInline: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    width: 56,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonInlineText: {
    color: colors.accent.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
}); 
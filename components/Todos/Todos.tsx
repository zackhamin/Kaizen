import { useGratitudeData } from '@/app/context/GratitudeContext';
import { useTasks } from '@/app/hooks/useTasks';
import { colors } from '@/constants/theme';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import GradientBackground from '../Layout/GradientBackground';

const { width: screenWidth } = Dimensions.get('window');

const Todos: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [addingTask, setAddingTask] = useState(false);

  // Use the modern hook
  const { 
    tasks: todos, 
    loading, 
    error, 
    addTask, 
    toggleTask, 
    deleteTask, 
    refreshTasks 
  } = useTasks();

  // Get context methods to update daily goals
  const { updateTaskCounts } = useGratitudeData();

  // Update context when tasks change
  useEffect(() => {
    const completedCount = todos.filter(task => task.completed).length;
    updateTaskCounts(todos.length, completedCount);
  }, [todos, updateTaskCounts]);

  const handleAddTodo = async (): Promise<void> => {
    if (!inputText.trim()) return;

    try {
      setAddingTask(true);
      await addTask(inputText.trim());
      setInputText('');
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task');
    } finally {
      setAddingTask(false);
    }
  };

  const handleToggleTodo = async (id: string): Promise<void> => {
    try {
      await toggleTask(id);
    } catch (error) {
      console.error('Error toggling task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleDeleteTodo = async (id: string): Promise<void> => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(id);
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          }
        }
      ]
    );
  };

  const remainingTasks = todos.filter(task => !task.completed).length;

  const renderTaskItem = ({ item }: { item: any }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity
        style={[styles.checkbox, item.completed && styles.checkboxChecked]}
        onPress={() => handleToggleTodo(item.id)}
        activeOpacity={0.7}
      >
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <Text 
        style={[
          styles.taskText, 
          item.completed && styles.taskTextCompleted
        ]}
        numberOfLines={0}
      >
        {item.text}
      </Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteTodo(item.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
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
          <Text style={styles.title}>Small Wins For Today</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add new task"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleAddTodo}
              returnKeyType="done"
              multiline={false}
              editable={!addingTask}
            />
            <TouchableOpacity 
              style={[styles.addButton, addingTask && styles.addButtonDisabled]} 
              onPress={handleAddTodo}
              activeOpacity={0.8}
              disabled={addingTask}
            >
              {addingTask ? (
                <ActivityIndicator size="small" color={colors.accent.white} />
              ) : (
                <Text style={styles.addButtonText}>+</Text>
              )}
            </TouchableOpacity>
          </View>

          <FlatList
            data={todos}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item.id}
            style={styles.taskList}
            contentContainerStyle={styles.taskListContent}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={refreshTasks}
          />

          <Text style={styles.remainingText}>
            Your remaining tasks: {remainingTasks}
          </Text>
        </View>
      </KeyboardAvoidingView>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: colors.accent.white,
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
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
    flex: 1,
  },
  taskListContent: {
    paddingBottom: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
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
    marginTop: 20,
    opacity: 0.8,
  },
});

export default Todos; 
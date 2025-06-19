import { colors } from '@/constants/theme';
import { Task, TaskService } from '@/services/task.service';
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

const taskService = new TaskService();

const Todos: React.FC = () => {
  const [todos, setTodos] = useState<Task[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const tasks = await taskService.getCurrentUserTasks();
      setTodos(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (): Promise<void> => {
    if (!inputText.trim()) return;

    try {
      setAddingTask(true);
      const newTask = await taskService.createTask(inputText.trim());
      setTodos([newTask, ...todos]);
      setInputText('');
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task');
    } finally {
      setAddingTask(false);
    }
  };

  const toggleTodo = async (id: string): Promise<void> => {
    try {
      const updatedTask = await taskService.toggleTask(id);
      setTodos(todos.map(todo =>
        todo.id === id ? updatedTask : todo
      ));
    } catch (error) {
      console.error('Error toggling task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const deleteTodo = async (id: string): Promise<void> => {
    try {
      await taskService.softDeleteTask(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  const remainingTodos: number = todos.filter(todo => !todo.completed).length;

  const renderTodoItem = ({ item }: { item: Task }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={[styles.checkbox, item.completed && styles.checkboxChecked]}
        onPress={() => toggleTodo(item.id)}
        activeOpacity={0.7}
      >
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <Text 
        style={[
          styles.todoText, 
          item.completed && styles.todoTextCompleted
        ]}
        numberOfLines={0}
      >
        {item.text}
      </Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTodo(item.id)}
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
              onSubmitEditing={addTodo}
              returnKeyType="done"
              multiline={false}
              editable={!addingTask}
            />
            <TouchableOpacity 
              style={[styles.addButton, addingTask && styles.addButtonDisabled]} 
              onPress={addTodo}
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
            renderItem={renderTodoItem}
            keyExtractor={(item) => item.id}
            style={styles.todoList}
            contentContainerStyle={styles.todoListContent}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={loadTasks}
          />

          <Text style={styles.remainingText}>
            Your remaining todos: {remainingTodos}
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
    color: colors.accent.white,
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  todoList: {
    flex: 1,
    width: '100%',
  },
  todoListContent: {
    paddingBottom: 20,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  checkmark: {
    color: colors.accent.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    color: colors.accent.white,
    lineHeight: 24,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: colors.accent.white,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  remainingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default Todos;
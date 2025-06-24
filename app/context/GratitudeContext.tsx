import { useFocusEffect } from '@react-navigation/native';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useGratitude } from '../hooks/useGratitude';
import { useTasks } from '../hooks/useTasks';

interface GratitudeData {
  gratitudeCount: number;
  tasksCount: number;
  completedTasksCount: number;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  updateGratitudeCount: (count: number) => void;
  updateTaskCounts: (total: number, completed: number) => void;
}

const GratitudeContext = createContext<GratitudeData | undefined>(undefined);

export const useGratitudeData = () => {
  const context = useContext(GratitudeContext);
  if (!context) {
    throw new Error('useGratitudeData must be used within a GratitudeProvider');
  }
  return context;
};

interface GratitudeProviderProps {
  children: React.ReactNode;
}

export const GratitudeProvider: React.FC<GratitudeProviderProps> = ({ children }) => {
  const [gratitudeCount, setGratitudeCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Use the modern hooks
  const { gratitudeEntries, loading: gratitudeLoading, refreshGratitudeEntries } = useGratitude();
  const { tasks, loading: tasksLoading, refreshTasks } = useTasks();

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Refresh both gratitude and tasks data
      await Promise.all([
        refreshGratitudeEntries(),
        refreshTasks()
      ]);
      
      // Update counts from the hooks' state
      setGratitudeCount(gratitudeEntries.length);
      setTasksCount(tasks.length);
      setCompletedTasksCount(tasks.filter(task => task.completed).length);
    } catch (error) {
      console.error('Error loading gratitude data:', error);
      // Set default values on error
      setGratitudeCount(0);
      setTasksCount(0);
      setCompletedTasksCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const updateGratitudeCount = (count: number) => {
    setGratitudeCount(count);
  };

  const updateTaskCounts = (total: number, completed: number) => {
    setTasksCount(total);
    setCompletedTasksCount(completed);
  };

  // Update counts when hooks data changes
  useEffect(() => {
    console.log('GratitudeContext: Updating gratitude count from hook data:', gratitudeEntries.length);
    setGratitudeCount(gratitudeEntries.length);
  }, [gratitudeEntries]);

  useEffect(() => {
    console.log('GratitudeContext: Updating task counts from hook data:', tasks.length, 'completed:', tasks.filter(task => task.completed).length);
    setTasksCount(tasks.length);
    setCompletedTasksCount(tasks.filter(task => task.completed).length);
  }, [tasks]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Home screen focused, refreshing gratitude data');
      loadData();
    }, [])
  );

  useEffect(() => {
    console.log('GratitudeContext: Initial load triggered');
    loadData();
  }, []);

  // Debug effect to log context value changes
  useEffect(() => {
    console.log('GratitudeContext: Context value updated - gratitudeCount:', gratitudeCount, 'tasksCount:', tasksCount, 'completedTasksCount:', completedTasksCount);
  }, [gratitudeCount, tasksCount, completedTasksCount]);

  const value: GratitudeData = {
    gratitudeCount,
    tasksCount,
    completedTasksCount,
    isLoading: isLoading || gratitudeLoading || tasksLoading,
    refreshData,
    updateGratitudeCount,
    updateTaskCounts,
  };

  return (
    <GratitudeContext.Provider value={value}>
      {children}
    </GratitudeContext.Provider>
  );
}; 
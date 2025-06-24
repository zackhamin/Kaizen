import { GratitudeService } from '@/services/gratitude.service';
import { TaskService } from '@/services/task.service';
import { useFocusEffect } from '@react-navigation/native';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

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

  const gratitudeService = new GratitudeService();
  const taskService = new TaskService();

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load gratitude entries for today
      const gratitudeEntries = await gratitudeService.getCurrentUserGratitudeEntries();
      setGratitudeCount(gratitudeEntries.length);
      
      // Load tasks
      const tasks = await taskService.getCurrentUserTasks();
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

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Home screen focused, refreshing gratitude data');
      loadData();
    }, [])
  );

  useEffect(() => {
    loadData();
  }, []);

  const value: GratitudeData = {
    gratitudeCount,
    tasksCount,
    completedTasksCount,
    isLoading,
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
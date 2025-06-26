import { useFocusEffect } from '@react-navigation/native';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useGratitudeEntries } from '../hooks/useGratitude';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  console.log('GratitudeProvider: Component rendering...');

  // Check auth state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      console.log('GratitudeProvider: Auth state checked, user:', !!user);
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      console.log('GratitudeProvider: Auth state changed:', event, !!session?.user);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Use React Query hooks - enable them when user is authenticated
  const { 
    data: gratitudeEntries = [], 
    isLoading: gratitudeLoading, 
    refetch: refreshGratitudeEntries,
    error: gratitudeError 
  } = useGratitudeEntries(undefined, isAuthenticated);
  
  const { 
    data: tasks = [], 
    isLoading: tasksLoading, 
    refetch: refreshTasks 
  } = useTasks(isAuthenticated);

  console.log('GratitudeProvider: Hooks initialized - gratitudeEntries:', gratitudeEntries.length, 'tasks:', tasks.length, 'gratitudeError:', gratitudeError, 'isAuthenticated:', isAuthenticated);

  const loadData = useCallback(async () => {
    try {
      console.log('GratitudeProvider: loadData called');
      setIsLoading(true);
      
      // Only refresh if user is authenticated
      if (isAuthenticated) {
        await Promise.all([
          refreshGratitudeEntries(),
          refreshTasks()
        ]);
      }
      
    } catch (error) {
      console.error('Error loading gratitude data:', error);
      // Set default values on error
      setGratitudeCount(0);
      setTasksCount(0);
      setCompletedTasksCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [refreshGratitudeEntries, refreshTasks, isAuthenticated]);

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
    console.log('GratitudeProvider: Gratitude entries changed:', gratitudeEntries.length);
    setGratitudeCount(gratitudeEntries.length);
  }, [gratitudeEntries]);

  useEffect(() => {
    console.log('GratitudeProvider: Tasks changed:', tasks.length);
    setTasksCount(tasks.length);
    setCompletedTasksCount(tasks.filter(task => task.completed).length);
  }, [tasks]);

  // Load data immediately on mount
  useEffect(() => {
    console.log('GratitudeProvider: Component mounted, calling loadData');
    loadData();
  }, [loadData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('GratitudeProvider: Screen focused, calling loadData');
      loadData();
    }, [loadData])
  );

  const value: GratitudeData = {
    gratitudeCount,
    tasksCount,
    completedTasksCount,
    isLoading: isLoading || gratitudeLoading || tasksLoading,
    refreshData,
    updateGratitudeCount,
    updateTaskCounts,
  };

  console.log('GratitudeProvider: Rendering with value:', {
    gratitudeCount,
    tasksCount,
    completedTasksCount,
    isLoading: value.isLoading,
    gratitudeLoading,
    tasksLoading,
    isAuthenticated
  });

  return (
    <GratitudeContext.Provider value={value}>
      {children}
    </GratitudeContext.Provider>
  );
}; 
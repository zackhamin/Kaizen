import { supabase } from '@/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';
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
  const [session, setSession] = useState<Session | null>(null);

  const { gratitudeEntries, loading: gratitudeLoading, refreshGratitudeEntries } = useGratitude();
  const { tasks, loading: tasksLoading, refreshTasks } = useTasks();

  const loadData = useCallback(async () => {
    try {
      console.log('GratitudeContext: Loading data...');
      setIsLoading(true);
      
      // Refresh both gratitude and tasks data
      await Promise.all([
        refreshGratitudeEntries(),
        refreshTasks()
      ]);
      
      console.log('GratitudeContext: Data loaded successfully');
    } catch (error) {
      console.error('Error loading gratitude data:', error);
      // Set default values on error
      setGratitudeCount(0);
      setTasksCount(0);
      setCompletedTasksCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [refreshGratitudeEntries, refreshTasks]);

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

  // Monitor authentication state changes
  useEffect(() => {
    console.log('GratitudeContext: Setting up auth listener...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting initial session:', error);
      } else {
        console.log('GratitudeContext: Initial session:', session?.user?.email);
        setSession(session);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('GratitudeContext: Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('GratitudeContext: User signed in, refreshing data...');
        // Small delay to ensure the session is fully established
        setTimeout(() => {
          loadData();
        }, 500);
      } else if (event === 'SIGNED_OUT') {
        console.log('GratitudeContext: User signed out, clearing data...');
        // Clear all cached data when user signs out
        setGratitudeCount(0);
        setTasksCount(0);
        setCompletedTasksCount(0);
        setIsLoading(false);
      }
      
      setSession(session);
    });

    return () => {
      console.log('GratitudeContext: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [loadData]);

  // Load data immediately on mount
  useEffect(() => {
    console.log('GratitudeContext: Initial load triggered');
    loadData();
  }, [loadData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Home screen focused, refreshing gratitude data');
      loadData();
    }, [loadData])
  );

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
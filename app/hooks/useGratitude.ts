import { useCallback, useEffect, useState } from 'react';
import { GratitudeEntry, gratitudeService } from '../../services/gratitude.service.modern';

interface UseGratitudeReturn {
  gratitudeEntries: GratitudeEntry[];
  loading: boolean;
  error: string | null;
  addGratitudeEntry: (content: string, date?: string) => Promise<void>;
  updateGratitudeEntry: (id: string, content: string) => Promise<void>;
  deleteGratitudeEntry: (id: string) => Promise<void>;
  refreshGratitudeEntries: () => Promise<void>;
  getGratitudeEntriesForDate: (date: string) => Promise<GratitudeEntry[]>;
}

export const useGratitude = (date?: string): UseGratitudeReturn => {
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGratitudeEntries = useCallback(async () => {
    try {
      console.log('useGratitude: Loading gratitude entries...');
      setLoading(true);
      setError(null);
      const data = await gratitudeService.getCurrentUserGratitudeEntries(date);
      console.log('useGratitude: Loaded entries:', data);
      setGratitudeEntries(data);
    } catch (err) {
      console.error('useGratitude: Error loading gratitude entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load gratitude entries');
    } finally {
      setLoading(false);
    }
  }, [date]);

  const addGratitudeEntry = useCallback(async (content: string, entryDate?: string) => {
    try {
      console.log('useGratitude: Adding gratitude entry:', content);
      setError(null);
      const newEntry = await gratitudeService.createGratitudeEntry(content, entryDate);
      console.log('useGratitude: Added entry:', newEntry);
      
      // Ensure we have a single entry object, not an array
      const entry = Array.isArray(newEntry) ? newEntry[0] : newEntry;
      
      setGratitudeEntries(prev => {
        const updated = [entry, ...prev];
        console.log('useGratitude: Updated entries state:', updated);
        return updated;
      });
    } catch (err) {
      console.error('useGratitude: Error adding gratitude entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to add gratitude entry');
      throw err;
    }
  }, []);

  const updateGratitudeEntry = useCallback(async (id: string, content: string) => {
    try {
      setError(null);
      const updatedEntry = await gratitudeService.updateGratitudeEntry(id, content);
      setGratitudeEntries(prev => prev.map(entry => 
        entry.id === id ? updatedEntry : entry
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update gratitude entry');
      console.error('Error updating gratitude entry:', err);
      throw err;
    }
  }, []);

  const deleteGratitudeEntry = useCallback(async (id: string) => {
    try {
      console.log('useGratitude: Deleting gratitude entry:', id);
      setError(null);
      await gratitudeService.deleteGratitudeEntry(id);
      setGratitudeEntries(prev => {
        const updated = prev.filter(entry => entry.id !== id);
        console.log('useGratitude: Updated entries after delete:', updated);
        return updated;
      });
    } catch (err) {
      console.error('useGratitude: Error deleting gratitude entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete gratitude entry');
      throw err;
    }
  }, []);

  const refreshGratitudeEntries = useCallback(async () => {
    console.log('useGratitude: Refreshing gratitude entries...');
    await loadGratitudeEntries();
  }, [loadGratitudeEntries]);

  const getGratitudeEntriesForDate = useCallback(async (targetDate: string) => {
    try {
      return await gratitudeService.getGratitudeEntriesForDate(targetDate);
    } catch (err) {
      console.error('Error getting gratitude entries for date:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    console.log('useGratitude: useEffect triggered, loading entries...');
    loadGratitudeEntries();
  }, [loadGratitudeEntries]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('useGratitude: State updated - entries:', gratitudeEntries.length, 'loading:', loading, 'error:', error);
  }, [gratitudeEntries, loading, error]);

  return {
    gratitudeEntries,
    loading,
    error,
    addGratitudeEntry,
    updateGratitudeEntry,
    deleteGratitudeEntry,
    refreshGratitudeEntries,
    getGratitudeEntriesForDate,
  };
}; 
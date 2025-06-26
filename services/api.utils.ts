import { supabase } from '../lib/supabase';

// Generic API utility functions
export const apiUtils = {
  // Get all records from a table
  async getAll<T>(tableName: string, query?: { [key: string]: any }) {
    let queryBuilder = supabase.from(tableName).select('*');
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });
    }

    const { data, error } = await queryBuilder;
    return { data: data as T[], error };
  },

  // Get a single record by ID
  async getById<T>(tableName: string, id: string) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    return { data: data as T, error };
  },

  // Create a new record
  async create<T>(tableName: string, data: Partial<T>) {
    const { data: newData, error } = await supabase
      .from(tableName)
      .insert(data)
      .select()
      .single();
    
    return { data: newData as T, error };
  },

  // Update an existing record
  async update<T>(tableName: string, id: string, data: Partial<T>) {
    const { data: updatedData, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    return { data: updatedData as T, error };
  },

  // Delete a record
  async delete(tableName: string, id: string) {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    return { error };
  },

  // Soft delete (mark as deleted)
  async softDelete(tableName: string, id: string) {
    const { error } = await supabase
      .from(tableName)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    return { error };
  }
}; 
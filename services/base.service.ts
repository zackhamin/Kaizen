import { supabase } from '../lib/supabase';

export class BaseService {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected async getAll<T>(query?: { [key: string]: any }) {
    let queryBuilder = supabase.from(this.tableName).select('*');
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });
    }

    const { data, error } = await queryBuilder;
    return { data: data as T[], error };
  }

  protected async getById<T>(id: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    return { data: data as T, error };
  }

  protected async create<T>(data: Partial<T>) {
    const { data: newData, error } = await supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();
    
    return { data: newData as T, error };
  }

  protected async update<T>(id: string, data: Partial<T>) {
    const { data: updatedData, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    return { data: updatedData as T, error };
  }

  protected async delete(id: string) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    return { error };
  }
} 
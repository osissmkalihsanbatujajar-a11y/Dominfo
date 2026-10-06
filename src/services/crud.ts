import { supabase } from '@/supabase/client';

const NO_PERMISSION = { code: '42501' };

/** Service CRUD generik. Hak akses sebenarnya ditegakkan oleh RLS di database. */
export function makeCrud<T>(table: string, idColumn: string) {
  return {
    async getById(id: string): Promise<T | null> {
      const { data, error } = await supabase.from(table).select('*').eq(idColumn, id).maybeSingle();
      if (error) throw error;
      return (data as T) ?? null;
    },
    async create(values: Record<string, unknown>): Promise<T> {
      const { data, error } = await supabase.from(table).insert(values).select().single();
      if (error) throw error;
      return data as T;
    },
    async update(id: string, values: Record<string, unknown>): Promise<T> {
      const { data, error } = await supabase.from(table).update(values).eq(idColumn, id).select().maybeSingle();
      if (error) throw error;
      if (!data) throw NO_PERMISSION;
      return data as T;
    },
    async remove(id: string): Promise<void> {
      const { data, error } = await supabase.from(table).delete().eq(idColumn, id).select(idColumn);
      if (error) throw error;
      if (!data || data.length === 0) throw NO_PERMISSION;
    },
  };
}

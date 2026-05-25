import { supabase } from './supabase';

export async function loadTable<T>(table: string, localKey: string, fallback: T[]): Promise<T[]> {
  if (supabase) {
    const { data } = await supabase.from(table).select('*').order('id', { ascending: false });
    if (data) {
      localStorage.setItem(localKey, JSON.stringify(data));
      return data as T[];
    }
  }
  const local = localStorage.getItem(localKey);
  return local ? (JSON.parse(local) as T[]) : fallback;
}

export async function saveTable<T extends { id: number }>(table: string, localKey: string, rows: T[]) {
  localStorage.setItem(localKey, JSON.stringify(rows));
  if (supabase) {
    await supabase.from(table).upsert(rows);
  }
}

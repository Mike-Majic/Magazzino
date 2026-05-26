import { supabase } from './supabase';

export async function loadTable<T extends { id: number }>(table: string, localKey: string, fallback: T[]): Promise<T[]> {
  const localRaw = localStorage.getItem(localKey);
  const localRows = localRaw ? (JSON.parse(localRaw) as T[]) : [];

  if (supabase) {
    const { data } = await supabase.from(table).select('*').order('id', { ascending: false });

    if (data && data.length > 0) {
      localStorage.setItem(localKey, JSON.stringify(data));
      return data as T[];
    }

    if (localRows.length > 0) {
      await supabase.from(table).upsert(localRows);
      return localRows;
    }

    if (fallback.length > 0) {
      localStorage.setItem(localKey, JSON.stringify(fallback));
      await supabase.from(table).upsert(fallback);
      return fallback;
    }

    return [];
  }

  if (localRows.length > 0) return localRows;
  return fallback;
}

export async function saveTable<T extends { id: number }>(table: string, localKey: string, rows: T[]) {
  localStorage.setItem(localKey, JSON.stringify(rows));
  if (!supabase) return;

  const ids = rows.map((r) => r.id);

  if (ids.length > 0) {
    await supabase.from(table).delete().not('id', 'in', `(${ids.join(',')})`);
    await supabase.from(table).upsert(rows);
    return;
  }

  await supabase.from(table).delete().gte('id', 0);
}

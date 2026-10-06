import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/supabase/client';
import { toMessage } from '@/services/errors';

export interface ListQuery {
  table: string;
  select?: string;
  search?: string;
  searchColumns?: string[];
  /** Kolom bertipe date yang ikut dicari jika input berformat YYYY-MM-DD. */
  searchDateColumns?: string[];
  eq?: Record<string, string | undefined>;
  ilike?: Record<string, string | undefined>;
  gte?: Record<string, string | undefined>;
  lte?: Record<string, string | undefined>;
  /** Kolom array yang harus memuat nilai tertentu. */
  cs?: Record<string, string | undefined>;
  /** Format "kolom:asc" atau "kolom:desc". */
  sort: string;
  page?: number;
  pageSize?: number;
}

export const parseSort = (s: string) => {
  const [column, dir] = s.split(':');
  return { column, ascending: dir !== 'desc' };
};

/** Buang karakter yang bisa merusak sintaks filter PostgREST. */
export const cleanSearch = (s: string) => s.replace(/[,()%*\\:]/g, ' ').replace(/\s+/g, ' ').trim();

export function useList<T>(q: ListQuery) {
  const [data, setData] = useState<T[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const reqId = useRef(0);
  const key = JSON.stringify(q);

  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query: any = supabase.from(q.table).select(q.select ?? '*', { count: 'exact' });

      const s = cleanSearch(q.search ?? '');
      if (s && q.searchColumns?.length) {
        const parts = q.searchColumns.map((c) => `${c}.ilike.%${s}%`);
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) q.searchDateColumns?.forEach((c) => parts.push(`${c}.eq.${s}`));
        query = query.or(parts.join(','));
      }
      Object.entries(q.eq ?? {}).forEach(([k, v]) => { if (v) query = query.eq(k, v); });
      Object.entries(q.ilike ?? {}).forEach(([k, v]) => { if (v && cleanSearch(v)) query = query.ilike(k, `%${cleanSearch(v)}%`); });
      Object.entries(q.gte ?? {}).forEach(([k, v]) => { if (v) query = query.gte(k, v); });
      Object.entries(q.cs ?? {}).forEach(([k, v]) => { if (v) query = query.contains(k, [v]); });
      Object.entries(q.lte ?? {}).forEach(([k, v]) => { if (v) query = query.lte(k, v); });

      const { column, ascending } = parseSort(q.sort);
      query = query.order(column, { ascending, nullsFirst: false });
      if (q.pageSize) {
        const from = ((q.page ?? 1) - 1) * q.pageSize;
        query = query.range(from, from + q.pageSize - 1);
      }

      const res = await query;
      if (id !== reqId.current) return; // abaikan respons usang
      if (res.error) {
        setError(toMessage(res.error));
        setData([]);
        setCount(0);
      } else {
        setError(null);
        setData((res.data ?? []) as T[]);
        setCount(res.count ?? 0);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, count, loading, error, reload };
}

/** Jika halaman saat ini kosong (mis. setelah hapus data), mundur satu halaman. */
export function useClampPage(page: number, total: number, pageSize: number, loading: boolean, setPage: (p: number) => void) {
  useEffect(() => {
    if (!loading && page > 1 && total > 0 && (page - 1) * pageSize >= total) {
      setPage(Math.max(1, Math.ceil(total / pageSize)));
    }
  }, [page, total, pageSize, loading, setPage]);
}

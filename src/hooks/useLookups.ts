import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/supabase/client';
import type { Member, CategoryScope, Option } from '@/types';
import { ASSET_CATEGORIES, DOC_CATEGORIES } from '@/lib/constants';

export function useMembers(onlyActive = true) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    let q = supabase.from('members').select('*').order('name');
    if (onlyActive) q = q.eq('status', 'Active');
    q.then(({ data }) => {
      if (alive) {
        setMembers((data ?? []) as Member[]);
        setLoading(false);
      }
    });
    return () => { alive = false; };
  }, [onlyActive]);
  return { members, loading };
}

const FALLBACK: Record<CategoryScope, readonly string[]> = {
  documentation: DOC_CATEGORIES,
  asset: ASSET_CATEGORIES,
  content: ['Kegiatan', 'Pengumuman', 'Edukasi', 'Other'],
};

/** Daftar nama kategori dari tabel categories (fallback ke bawaan jika kosong). */
export function useCategoryNames(scope: CategoryScope): string[] {
  const [names, setNames] = useState<string[]>([...FALLBACK[scope]]);
  useEffect(() => {
    let alive = true;
    supabase.from('categories').select('name').eq('scope', scope).order('name').then(({ data }) => {
      if (alive && data && data.length) setNames(data.map((d) => d.name as string));
    });
    return () => { alive = false; };
  }, [scope]);
  return names;
}

/** Opsi dokumentasi (id + nama) untuk dropdown backup. */
export function useDocumentOptions() {
  const [options, setOptions] = useState<Option[]>([]);
  const load = useCallback(() => {
    supabase
      .from('documentation')
      .select('documentation_id,event_name,event_date')
      .order('event_date', { ascending: false })
      .limit(500)
      .then(({ data }) =>
        setOptions((data ?? []).map((d) => ({ value: d.documentation_id as string, label: `${d.event_name} (${d.event_date})` }))),
      );
  }, []);
  useEffect(load, [load]);
  return options;
}

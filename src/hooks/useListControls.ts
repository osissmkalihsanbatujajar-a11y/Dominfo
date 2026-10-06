import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from './useDebounce';

/** State search + filter + sort + halaman yang dipakai semua halaman daftar. */
export function useListControls<F extends Record<string, string>>(initialFilters: F, defaultSort: string, initialSearch = '') {
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState<F>(initialFilters);
  const [sort, setSort] = useState(defaultSort);
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [debouncedSearch, filters, sort]);

  const setFilter = useCallback(<K extends keyof F>(key: K, value: F[K]) => setFilters((f) => ({ ...f, [key]: value })), []);
  const activeCount = useMemo(
    () => Object.entries(filters).filter(([k, v]) => v !== initialFilters[k]).length + (search ? 1 : 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters, search],
  );
  const reset = useCallback(() => {
    setSearch('');
    setFilters(initialFilters);
    setSort(defaultSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { search, setSearch, debouncedSearch, filters, setFilter, sort, setSort, page, setPage, activeCount, reset };
}

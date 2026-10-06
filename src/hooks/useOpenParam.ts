import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Membaca ?open=<id> dari URL (dipakai hasil pencarian global), lalu membersihkannya. */
export function useOpenParam(onOpen: (id: string) => void) {
  const [params, setParams] = useSearchParams();
  const ref = useRef(onOpen);
  ref.current = onOpen;
  const open = params.get('open');
  useEffect(() => {
    if (!open) return;
    ref.current(open);
    const next = new URLSearchParams(params);
    next.delete('open');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

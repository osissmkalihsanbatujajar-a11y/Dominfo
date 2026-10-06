import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Camera, Boxes, Search, Users, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { supabase } from '@/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';
import { cleanSearch } from '@/hooks/useList';
import { formatDate, cn } from '@/lib/utils';

interface Hit { key: string; group: string; title: string; subtitle: string; to: string; icon: typeof Search }

const orFilter = (cols: string[], dateCols: string[], s: string) => {
  const parts = cols.map((c) => `${c}.ilike.%${s}%`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) dateCols.forEach((c) => parts.push(`${c}.eq.${s}`));
  return parts.join(',');
};

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 250);
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setHits([]);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    const s = cleanSearch(dq);
    if (!open || s.length < 2) { setHits([]); return; }
    let alive = true;
    setLoading(true);
    (async () => {
      const [docs, content, members, assets] = await Promise.all([
        supabase.from('documentation').select('documentation_id,event_name,event_date,category').or(orFilter(['event_name', 'category', 'location'], ['event_date'], s)).limit(5),
        supabase.from('content_calendar').select('content_id,title,scheduled_date,category').or(orFilter(['title', 'category', 'caption'], ['scheduled_date', 'deadline'], s)).limit(5),
        supabase.from('members').select('member_id,name,roles').or(orFilter(['name', 'division'], [], s)).limit(5),
        supabase.from('assets').select('asset_id,name,category,version').or(orFilter(['name', 'category', 'file_type'], [], s)).limit(5),
      ]);
      if (!alive) return;
      const out: Hit[] = [];
      docs.data?.forEach((d) => out.push({ key: `d${d.documentation_id}`, group: 'Dokumentasi', title: d.event_name as string, subtitle: `${formatDate(d.event_date as string)} · ${d.category}`, to: `/dokumentasi?open=${d.documentation_id}`, icon: Camera }));
      content.data?.forEach((c) => out.push({ key: `c${c.content_id}`, group: 'Konten', title: c.title as string, subtitle: `${formatDate(c.scheduled_date as string)}${c.category ? ` · ${c.category}` : ''}`, to: `/kalender?open=${c.content_id}`, icon: CalendarDays }));
      members.data?.forEach((m) => out.push({ key: `m${m.member_id}`, group: 'Anggota', title: m.name as string, subtitle: (m.roles as string[]).join(', '), to: `/anggota?q=${encodeURIComponent(m.name as string)}`, icon: Users }));
      assets.data?.forEach((a) => out.push({ key: `a${a.asset_id}`, group: 'Aset', title: a.name as string, subtitle: `${a.category} · v${a.version}`, to: `/aset?open=${a.asset_id}`, icon: Boxes }));
      setHits(out);
      setActive(0);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [dq, open]);

  const go = (h: Hit) => { onClose(); navigate(h.to); };
  const grouped = useMemo(() => {
    const m = new Map<string, Hit[]>();
    hits.forEach((h) => m.set(h.group, [...(m.get(h.group) ?? []), h]));
    return [...m.entries()];
  }, [hits]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && hits[active]) go(hits[active]);
  };

  const searched = cleanSearch(dq).length >= 2;
  return (
    <Modal open={open} onClose={onClose} title="Pencarian global" description="Cari kegiatan, konten, anggota, aset, kategori, atau tanggal (YYYY-MM-DD).">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
        <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Ketik minimal 2 huruf…" aria-label="Kata kunci pencarian" className="field h-12 pl-9" />
        {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-400" aria-hidden />}
      </div>
      <div className="mt-4 min-h-24 space-y-4" aria-live="polite">
        {!searched && <p className="py-6 text-center text-sm text-ink-400">Mulai mengetik untuk mencari.</p>}
        {searched && !loading && hits.length === 0 && <p className="py-6 text-center text-sm text-ink-400">Tidak ada hasil untuk “{dq}”.</p>}
        {grouped.map(([group, items]) => (
          <div key={group}>
            <p className="mb-1 px-2 text-xs font-medium text-ink-400">{group}</p>
            <ul>
              {items.map((h) => {
                const Icon = h.icon;
                const isActive = hits[active]?.key === h.key;
                return (
                  <li key={h.key}>
                    <button onClick={() => go(h)} onMouseEnter={() => setActive(hits.findIndex((x) => x.key === h.key))}
                      className={cn('flex min-h-12 w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition', isActive ? 'bg-white/10' : 'hover:bg-white/5')}>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-iris-500/15 text-iris-300"><Icon className="h-4 w-4" aria-hidden /></span>
                      <span className="min-w-0"><span className="block truncate text-sm font-medium text-ink-100">{h.title}</span><span className="block truncate text-xs text-ink-400">{h.subtitle}</span></span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Modal>
  );
}

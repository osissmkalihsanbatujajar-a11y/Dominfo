import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/supabase/client';
import { cn, formatLongDate, formatMonth, monthGrid, toYMD, todayYMD, WEEKDAYS } from '@/lib/utils';

export function MiniCalendar({ refreshKey }: { refreshKey: number }) {
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(() => new Date());
  const [counts, setCounts] = useState<Record<string, number>>({});
  const days = monthGrid(anchor.getFullYear(), anchor.getMonth());
  const today = todayYMD();

  useEffect(() => {
    let alive = true;
    supabase.from('content_calendar').select('scheduled_date').gte('scheduled_date', toYMD(days[0])).lte('scheduled_date', toYMD(days[days.length - 1]))
      .then(({ data }) => {
        if (!alive) return;
        const m: Record<string, number> = {};
        (data ?? []).forEach((r) => { m[r.scheduled_date as string] = (m[r.scheduled_date as string] ?? 0) + 1; });
        setCounts(m);
      });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor, refreshKey]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium capitalize text-ink-100" aria-live="polite">{formatMonth(anchor)}</span>
        <div className="flex">
          <Button size="icon" variant="ghost" aria-label="Bulan sebelumnya" onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" aria-label="Bulan berikutnya" onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] text-ink-400">
        {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
        {days.map((d) => {
          const ymd = toYMD(d);
          const n = counts[ymd] ?? 0;
          return (
            <button key={ymd} onClick={() => navigate(`/kalender?date=${ymd}`)} aria-label={`${formatLongDate(d)}, ${n} konten`}
              className={cn('relative mx-auto grid h-9 w-9 place-items-center rounded-full text-xs transition hover:bg-white/10', d.getMonth() !== anchor.getMonth() && 'opacity-35', ymd === today ? 'bg-iris-500 text-white hover:bg-iris-400' : 'text-ink-200')}>
              {d.getDate()}
              {n > 0 && <i className={cn('absolute bottom-1 h-1 w-1 rounded-full', ymd === today ? 'bg-white' : 'bg-iris-400')} aria-hidden />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

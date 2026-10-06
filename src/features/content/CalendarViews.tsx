import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CONTENT_STATUS_STYLE, CONTENT_STATUSES } from '@/lib/constants';
import { addDays, cn, formatLongDate, monthGrid, startOfWeek, toYMD, todayYMD, WEEKDAYS } from '@/lib/utils';
import type { ContentItem } from '@/types';

type Grouped = Map<string, ContentItem[]>;
export const groupByDate = (items: ContentItem[]): Grouped => {
  const m: Grouped = new Map();
  items.forEach((i) => m.set(i.scheduled_date, [...(m.get(i.scheduled_date) ?? []), i]));
  return m;
};

const dotClass = (s: ContentItem['status']) => CONTENT_STATUS_STYLE[s]?.dot ?? 'bg-slate-400';

function Chip({ item, onOpen }: { item: ContentItem; onOpen: (c: ContentItem) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onOpen(item); }}
      title={`${item.title} · ${item.status}`}
      className="flex w-full items-center gap-1.5 rounded-md bg-white/[0.06] px-1.5 py-1 text-left text-xs text-ink-100 transition hover:bg-white/15"
    >
      <i className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotClass(item.status))} aria-hidden />
      <span className="truncate">{item.title}</span>
    </button>
  );
}

interface MonthProps {
  anchor: Date;
  items: ContentItem[];
  selected: string;
  onSelect: (ymd: string) => void;
  onOpen: (c: ContentItem) => void;
}

export function MonthView({ anchor, items, selected, onSelect, onOpen }: MonthProps) {
  const days = monthGrid(anchor.getFullYear(), anchor.getMonth());
  const by = groupByDate(items);
  const today = todayYMD();
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="grid grid-cols-7 border-b border-white/10 text-center text-xs text-ink-400">
        {WEEKDAYS.map((d) => <div key={d} className="py-2.5">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const ymd = toYMD(d);
          const list = by.get(ymd) ?? [];
          const inMonth = d.getMonth() === anchor.getMonth();
          return (
            <button
              key={ymd}
              type="button"
              onClick={() => onSelect(ymd)}
              aria-label={`${formatLongDate(d)}, ${list.length} konten`}
              aria-pressed={selected === ymd}
              className={cn(
                'flex min-h-[3.75rem] flex-col items-stretch gap-1 border-b border-r border-white/5 p-1.5 text-left transition hover:bg-white/[0.05] md:min-h-28',
                !inMonth && 'opacity-40',
                selected === ymd && 'bg-iris-500/10 ring-1 ring-inset ring-iris-400/40',
              )}
            >
              <span className={cn('grid h-6 w-6 place-items-center self-start rounded-full text-xs font-medium', ymd === today ? 'bg-iris-500 text-white' : 'text-ink-200')}>{d.getDate()}</span>
              <span className="hidden flex-col gap-1 md:flex">
                {list.slice(0, 3).map((i) => <Chip key={i.content_id} item={i} onOpen={onOpen} />)}
                {list.length > 3 && <span className="px-1 text-[11px] text-ink-400">+{list.length - 3} lagi</span>}
              </span>
              <span className="flex flex-wrap gap-0.5 md:hidden" aria-hidden>
                {list.slice(0, 4).map((i) => <i key={i.content_id} className={cn('h-1.5 w-1.5 rounded-full', dotClass(i.status))} />)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface WeekProps { anchor: Date; items: ContentItem[]; canWrite: boolean; onOpen: (c: ContentItem) => void; onAdd: (ymd: string) => void }

export function WeekView({ anchor, items, canWrite, onOpen, onAdd }: WeekProps) {
  const start = startOfWeek(anchor);
  const by = groupByDate(items);
  const today = todayYMD();
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
      {Array.from({ length: 7 }, (_, i) => {
        const d = addDays(start, i);
        const ymd = toYMD(d);
        const list = by.get(ymd) ?? [];
        return (
          <section key={ymd} aria-label={formatLongDate(d)} className={cn('glass rounded-2xl p-3 md:min-h-56', ymd === today && 'ring-iris-400/50')}>
            <header className="mb-2 flex items-center justify-between">
              <h3 className={cn('text-sm font-semibold', ymd === today ? 'text-iris-300' : 'text-ink-100')}>
                {WEEKDAYS[i]} <span className="font-normal text-ink-400">{d.getDate()}</span>
              </h3>
              {canWrite && (
                <button type="button" onClick={() => onAdd(ymd)} aria-label={`Tambah konten ${formatLongDate(d)}`} className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-white/10 hover:text-ink-100">
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </header>
            <div className="space-y-1.5">
              {list.length === 0 && <p className="py-2 text-xs text-ink-500">Tidak ada konten</p>}
              {list.map((i) => <Chip key={i.content_id} item={i} onOpen={onOpen} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function DayPanel({ ymd, items, canWrite, onOpen, onAdd }: { ymd: string; items: ContentItem[]; canWrite: boolean; onOpen: (c: ContentItem) => void; onAdd: (ymd: string) => void }) {
  const list = items.filter((i) => i.scheduled_date === ymd);
  const d = new Date(`${ymd}T00:00:00`);
  return (
    <section className="glass mt-4 rounded-2xl p-4" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink-100">{formatLongDate(d)}</h2>
        {canWrite && <Button size="sm" onClick={() => onAdd(ymd)}><Plus className="h-4 w-4" aria-hidden /> Tambah</Button>}
      </div>
      {list.length === 0 ? (
        <p className="mt-3 text-sm text-ink-400">Belum ada konten di tanggal ini.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {list.map((i) => (
            <li key={i.content_id}>
              <button onClick={() => onOpen(i)} className="flex min-h-12 w-full items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2 text-left ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.07]">
                <i className={cn('h-2.5 w-2.5 shrink-0 rounded-full', dotClass(i.status))} aria-hidden />
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-ink-100">{i.title}</span><span className="block text-xs text-ink-400">{i.platform} · {i.content_type}{i.member ? ` · ${i.member.name}` : ''}</span></span>
                <span className="text-xs text-ink-400">{i.status}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function StatusLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-400" aria-label="Legenda status">
      {CONTENT_STATUSES.map((s) => <li key={s} className="flex items-center gap-1.5"><i className={cn('h-2 w-2 rounded-full', CONTENT_STATUS_STYLE[s].dot)} aria-hidden />{s}</li>)}
    </ul>
  );
}

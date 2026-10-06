import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarClock, CloudOff, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Reminder } from './useReminders';

const icons = { overdue: AlertTriangle, deadline: Clock, unfinished: Clock, today: CalendarClock, backup: CloudOff } as const;
const tone = {
  danger: 'bg-rose-500/15 text-rose-300',
  warning: 'bg-amber-500/15 text-amber-300',
  info: 'bg-iris-500/15 text-iris-300',
} as const;

export function RemindersList({ reminders, limit, onNavigate }: { reminders: Reminder[]; limit?: number; onNavigate?: () => void }) {
  const list = limit ? reminders.slice(0, limit) : reminders;
  if (list.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 px-3 py-3 text-sm text-emerald-300">
        <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden /> Semua aman — tidak ada pengingat saat ini.
      </div>
    );
  }
  return (
    <ul className="space-y-1.5">
      {list.map((r) => {
        const Icon = icons[r.kind];
        return (
          <li key={r.id}>
            <Link to={r.href} onClick={onNavigate} className="flex min-h-12 items-start gap-3 rounded-xl px-2 py-2 transition hover:bg-white/5">
              <span className={cn('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg', tone[r.severity])}><Icon className="h-4 w-4" aria-hidden /></span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink-100">{r.title}</span>
                <span className="block text-xs text-ink-400">{r.detail}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

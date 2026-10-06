import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/supabase/client';
import { UNFINISHED_STATUSES } from '@/lib/constants';
import { addDays, daysUntil, toYMD, todayYMD } from '@/lib/utils';

export interface Reminder {
  id: string;
  kind: 'overdue' | 'deadline' | 'unfinished' | 'today' | 'backup';
  title: string;
  detail: string;
  severity: 'danger' | 'warning' | 'info';
  href: string;
}

const unfinished = (s: string) => (UNFINISHED_STATUSES as readonly string[]).includes(s);
const rank = { danger: 0, warning: 1, info: 2 } as const;

function when(d: number, noun: string) {
  if (d === 0) return `${noun} hari ini`;
  if (d === 1) return `${noun} besok`;
  return `${noun} ${d} hari lagi`;
}

/** Pengingat visual (tanpa push notification) dari konten & dokumentasi. */
export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const today = todayYMD();
    const soon = toYMD(addDays(new Date(), 3));
    const [content, docs] = await Promise.all([
      supabase
        .from('content_calendar')
        .select('content_id,title,status,deadline,scheduled_date')
        .not('status', 'in', '(Published,Cancelled)')
        .or(`deadline.lte.${soon},scheduled_date.lte.${soon}`)
        .order('scheduled_date', { ascending: true })
        .limit(60),
      supabase
        .from('documentation')
        .select('documentation_id,event_name,event_date,is_important')
        .eq('backup_status', 'Not Backed Up')
        .in('status', ['On Going', 'Completed'])
        .order('is_important', { ascending: false })
        .order('event_date', { ascending: false })
        .limit(20),
    ]);

    const out: Reminder[] = [];
    for (const c of content.data ?? []) {
      const href = `/kalender?open=${c.content_id}`;
      const open = unfinished(c.status as string);
      const dl = c.deadline ? daysUntil(c.deadline as string) : null;
      const sd = daysUntil(c.scheduled_date as string);
      if (open && dl !== null && dl < 0) {
        out.push({ id: `o-${c.content_id}`, kind: 'overdue', title: c.title as string, detail: `Deadline terlewat ${-dl} hari · ${c.status}`, severity: 'danger', href });
      } else if (open && dl !== null && dl <= 3) {
        out.push({ id: `d-${c.content_id}`, kind: 'deadline', title: c.title as string, detail: `${when(dl, 'Deadline')} · ${c.status}`, severity: dl <= 1 ? 'danger' : 'warning', href });
      } else if (open && sd < 0) {
        out.push({ id: `o-${c.content_id}`, kind: 'overdue', title: c.title as string, detail: `Jadwal tayang terlewat ${-sd} hari · ${c.status}`, severity: 'danger', href });
      } else if (open && sd >= 0 && sd <= 3) {
        out.push({ id: `u-${c.content_id}`, kind: 'unfinished', title: c.title as string, detail: `Belum selesai (${c.status}), ${when(sd, 'tayang')}`, severity: 'warning', href });
      }
      if ((c.scheduled_date as string) === today) {
        out.push({ id: `t-${c.content_id}`, kind: 'today', title: c.title as string, detail: `Agenda hari ini · ${c.status}`, severity: 'info', href });
      }
    }
    for (const d of docs.data ?? []) {
      out.push({
        id: `b-${d.documentation_id}`,
        kind: 'backup',
        title: d.event_name as string,
        detail: d.is_important ? 'Dokumentasi penting belum punya backup' : 'Belum punya backup',
        severity: d.is_important ? 'danger' : 'warning',
        href: '/backup',
      });
    }
    out.sort((a, b) => rank[a.severity] - rank[b.severity]);
    setReminders(out);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  return { reminders, loading, reload: load };
}

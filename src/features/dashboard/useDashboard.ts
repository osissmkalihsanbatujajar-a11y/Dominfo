import { useEffect, useState } from 'react';
import { supabase } from '@/supabase/client';
import { UNFINISHED_STATUSES } from '@/lib/constants';
import { toYMD, todayYMD } from '@/lib/utils';
import { countRows, fetchActivity } from '@/services';
import { toMessage } from '@/services/errors';
import type { ActivityLog, ContentItem, DocumentationItem } from '@/types';

export interface DashboardData {
  loading: boolean;
  error: string | null;
  totalDocs: number;
  docsThisMonth: number;
  upcomingCount: number;
  unfinished: number;
  totalAssets: number;
  upcoming: ContentItem[];
  recent: DocumentationItem[];
  monthCounts: Record<string, number>;
  logs: ActivityLog[];
}

const EMPTY: DashboardData = {
  loading: true, error: null, totalDocs: 0, docsThisMonth: 0, upcomingCount: 0, unfinished: 0, totalAssets: 0,
  upcoming: [], recent: [], monthCounts: {}, logs: [],
};

/**
 * @param includeCalendar false untuk Viewer: kalender OSIS privat, jadi tidak ada satu pun
 *                        query ke content_calendar yang dikirim (RLS di database juga memblokirnya).
 */
export function useDashboard(tick: number, includeCalendar: boolean): DashboardData {
  const [state, setState] = useState<DashboardData>(EMPTY);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const now = new Date();
        const today = todayYMD();
        const mStart = toYMD(new Date(now.getFullYear(), now.getMonth(), 1));
        const mEnd = toYMD(new Date(now.getFullYear(), now.getMonth() + 1, 0));

        const calendarQueries = includeCalendar
          ? Promise.all([
              countRows('content_calendar', (q) => q.in('status', [...UNFINISHED_STATUSES])),
              supabase.from('content_calendar').select('*', { count: 'exact' })
                .gte('scheduled_date', today).not('status', 'in', '(Published,Cancelled)').order('scheduled_date').limit(6),
              supabase.from('content_calendar').select('status').gte('scheduled_date', mStart).lte('scheduled_date', mEnd),
            ])
          : Promise.resolve(null);

        const [totalDocs, docsThisMonth, totalAssets, recent, logs, calendar] = await Promise.all([
          countRows('documentation'),
          countRows('documentation', (q) => q.gte('event_date', mStart).lte('event_date', mEnd)),
          countRows('assets'),
          supabase.from('documentation').select('*').order('created_at', { ascending: false }).limit(5),
          fetchActivity(8, { hideContent: !includeCalendar }),
          calendarQueries,
        ]);
        if (!alive) return;

        const monthCounts: Record<string, number> = {};
        let unfinished = 0;
        let upcomingCount = 0;
        let upcoming: ContentItem[] = [];
        if (calendar) {
          const [unfinishedCount, upcomingRes, monthRes] = calendar;
          unfinished = unfinishedCount;
          upcomingCount = upcomingRes.count ?? 0;
          upcoming = (upcomingRes.data ?? []) as unknown as ContentItem[];
          (monthRes.data ?? []).forEach((r) => { monthCounts[r.status as string] = (monthCounts[r.status as string] ?? 0) + 1; });
        }

        setState({
          loading: false, error: null, totalDocs, docsThisMonth, unfinished, totalAssets,
          upcomingCount, upcoming,
          recent: (recent.data ?? []) as DocumentationItem[],
          monthCounts, logs,
        });
      } catch (e) {
        if (alive) setState((s) => ({ ...s, loading: false, error: toMessage(e) }));
      }
    })();
    return () => { alive = false; };
  }, [tick, includeCalendar]);

  return state;
}

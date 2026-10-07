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

export function useDashboard(tick: number): DashboardData {
  const [state, setState] = useState<DashboardData>(EMPTY);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const now = new Date();
        const today = todayYMD();
        const mStart = toYMD(new Date(now.getFullYear(), now.getMonth(), 1));
        const mEnd = toYMD(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        const [totalDocs, docsThisMonth, unfinished, totalAssets, upcoming, recent, month, logs] = await Promise.all([
          countRows('documentation'),
          countRows('documentation', (q) => q.gte('event_date', mStart).lte('event_date', mEnd)),
          countRows('content_calendar', (q) => q.in('status', [...UNFINISHED_STATUSES])),
          countRows('assets'),
          supabase.from('content_calendar').select('*', { count: 'exact' })
            .gte('scheduled_date', today).not('status', 'in', '(Published,Cancelled)').order('scheduled_date').limit(6),
          supabase.from('documentation').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('content_calendar').select('status').gte('scheduled_date', mStart).lte('scheduled_date', mEnd),
          fetchActivity(8),
        ]);
        if (!alive) return;
        const monthCounts: Record<string, number> = {};
        (month.data ?? []).forEach((r) => { monthCounts[r.status as string] = (monthCounts[r.status as string] ?? 0) + 1; });
        setState({
          loading: false, error: null, totalDocs, docsThisMonth, unfinished, totalAssets,
          upcomingCount: upcoming.count ?? 0,
          upcoming: (upcoming.data ?? []) as unknown as ContentItem[],
          recent: (recent.data ?? []) as DocumentationItem[],
          monthCounts, logs,
        });
      } catch (e) {
        if (alive) setState((s) => ({ ...s, loading: false, error: toMessage(e) }));
      }
    })();
    return () => { alive = false; };
  }, [tick]);

  return state;
}

import { Activity } from 'lucide-react';
import { relativeTime } from '@/lib/utils';
import type { ActivityLog } from '@/types';

const VERB = { create: 'menambahkan', update: 'mengubah', delete: 'menghapus' } as const;
const TARGET: Record<string, string> = { content: 'konten', documentation: 'dokumentasi', asset: 'aset', backup: 'backup', member: 'anggota', category: 'kategori' };

export function ActivityFeed({ logs }: { logs: ActivityLog[] }) {
  if (logs.length === 0) return <p className="py-6 text-center text-sm text-ink-400">Belum ada aktivitas tercatat.</p>;
  return (
    <ul className="space-y-1">
      {logs.map((l) => (
        <li key={l.log_id} className="flex items-start gap-3 rounded-xl px-2 py-2">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-ink-300"><Activity className="h-4 w-4" aria-hidden /></span>
          <p className="min-w-0 flex-1 text-sm text-ink-300">
            <span className="font-medium text-ink-100">{l.user_name}</span> {VERB[l.action]} {TARGET[l.target_type] ?? l.target_type}{' '}
            <span className="font-medium text-ink-100">{l.target_name ?? '—'}</span>
            <span className="block text-xs text-ink-400"><time dateTime={l.created_at}>{relativeTime(l.created_at)}</time></span>
          </p>
        </li>
      ))}
    </ul>
  );
}

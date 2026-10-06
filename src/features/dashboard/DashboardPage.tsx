import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Boxes, CalendarClock, Camera, Plus, ShieldPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Thumbnail } from '@/components/ui/Thumbnail';
import { Avatar } from '@/components/ui/Avatar';
import { BackupBadge, ContentStatusBadge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { CONTENT_STATUS_STYLE, CONTENT_STATUSES } from '@/lib/constants';
import { cn, daysUntil, formatDate, formatLongDate } from '@/lib/utils';
import { RemindersList } from '@/features/reminders/RemindersList';
import { useReminders } from '@/features/reminders/useReminders';
import { ContentFormModal } from '@/features/content/ContentFormModal';
import { DocumentationFormModal } from '@/features/documentation/DocumentationFormModal';
import { AssetFormModal } from '@/features/assets/AssetFormModal';
import { BackupFormModal } from '@/features/backup/BackupFormModal';
import { ActivityFeed } from './ActivityFeed';
import { MiniCalendar } from './MiniCalendar';
import { useDashboard } from './useDashboard';

function Card({ title, to, children, className }: { title: string; to?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('glass rounded-2xl p-4 sm:p-5', className)}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-100">{title}</h2>
        {to && <Link to={to} className="inline-flex min-h-9 items-center gap-1 text-xs font-medium text-iris-300 hover:underline">Lihat semua <ArrowUpRight className="h-3 w-3" aria-hidden /></Link>}
      </div>
      {children}
    </section>
  );
}

type Modal = 'content' | 'doc' | 'asset' | 'backup' | null;

export default function DashboardPage() {
  const { profile, canWrite } = useAuth();
  const [tick, setTick] = useState(0);
  const [modal, setModal] = useState<Modal>(null);
  const d = useDashboard(tick);
  const { reminders, reload: reloadReminders } = useReminders();
  const refresh = () => { setTick((t) => t + 1); reloadReminders(); };
  const first = (profile?.full_name ?? '').split(' ')[0];
  const todayCount = reminders.filter((r) => r.kind === 'today').length;

  const stats = [
    { label: 'Total dokumentasi', value: d.totalDocs },
    { label: 'Dokumentasi bulan ini', value: d.docsThisMonth },
    { label: 'Konten akan datang', value: d.upcomingCount },
    { label: 'Konten belum selesai', value: d.unfinished },
    { label: 'Total aset', value: d.totalAssets },
  ];
  const monthTotal = Object.values(d.monthCounts).reduce((a, b) => a + b, 0);
  const published = d.monthCounts.Published ?? 0;
  const pct = monthTotal ? Math.round((published / monthTotal) * 100) : 0;

  const quick = [
    { label: 'Tambah Konten', icon: CalendarClock, modal: 'content' as const },
    { label: 'Tambah Dokumentasi', icon: Camera, modal: 'doc' as const },
    { label: 'Tambah Aset', icon: Boxes, modal: 'asset' as const },
    { label: 'Tambah Backup', icon: ShieldPlus, modal: 'backup' as const },
  ];

  return (
    <>
      <header className="mb-5">
        <p className="text-sm capitalize text-ink-400">{formatLongDate(new Date())}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">{first ? `Halo, ${first}` : 'Halo'}</h1>
        <p className="mt-1 text-sm text-ink-300">
          {todayCount > 0 ? `Ada ${todayCount} agenda konten hari ini.` : 'Tidak ada agenda konten hari ini.'}
        </p>
      </header>

      {d.error && <p role="alert" className="mb-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{d.error}</p>}

      <section aria-label="Ringkasan" className="glass mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 lg:grid-cols-5">
        {stats.map((s, i) => (
          <div key={s.label} className={cn('bg-ink-900/90 p-4 sm:p-5', i === 4 && 'col-span-2 lg:col-span-1')}>
            {d.loading ? <Skeleton className="h-8 w-14" /> : <p className="text-3xl font-semibold tabular-nums text-ink-100">{s.value}</p>}
            <p className="mt-1 text-xs text-ink-400">{s.label}</p>
          </div>
        ))}
      </section>

      {canWrite && (
        <section aria-label="Aksi cepat" className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quick.map(({ label, icon: Icon, modal: m }) => (
            <Button key={m} onClick={() => setModal(m)} className="h-12 justify-start gap-3 px-4">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-iris-500/15 text-iris-300"><Icon className="h-4 w-4" aria-hidden /></span>
              <span className="truncate"><Plus className="mr-1 inline h-3.5 w-3.5 text-ink-400" aria-hidden />{label.replace('Tambah ', '')}</span>
            </Button>
          ))}
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card title="Upcoming Content" to="/kalender">
            {d.loading ? <Skeleton className="h-40 w-full" /> : d.upcoming.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-400">Tidak ada konten mendatang. {canWrite && 'Tambahkan rencana konten baru.'}</p>
            ) : (
              <ul className="space-y-1">
                {d.upcoming.map((c) => {
                  const n = daysUntil(c.scheduled_date);
                  return (
                    <li key={c.content_id}>
                      <Link to={`/kalender?open=${c.content_id}`} className="flex min-h-14 items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/5">
                        <span className="w-14 shrink-0 text-center"><span className="block text-lg font-semibold leading-none text-ink-100">{c.scheduled_date.slice(8, 10)}</span><span className="text-[11px] text-ink-400">{n === 0 ? 'Hari ini' : n === 1 ? 'Besok' : `${n} hari`}</span></span>
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-ink-100">{c.title}</span><span className="block text-xs text-ink-400">{c.platform} · {c.content_type}</span></span>
                        {c.member && <Avatar name={c.member.name} src={c.member.profile_photo} size="sm" className="hidden sm:grid" />}
                        <ContentStatusBadge status={c.status} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title="Recent Documentation" to="/dokumentasi">
            {d.loading ? <Skeleton className="h-32 w-full" /> : d.recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-400">Belum ada dokumentasi. {canWrite && 'Tambahkan dokumentasi kegiatan pertama.'}</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {d.recent.slice(0, 4).map((doc) => (
                  <li key={doc.documentation_id}>
                    <Link to={`/dokumentasi?open=${doc.documentation_id}`} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/5">
                      <Thumbnail src={doc.thumbnail_url} alt={doc.event_name} className="h-14 w-20 shrink-0 rounded-lg" />
                      <span className="min-w-0"><span className="block truncate text-sm font-medium text-ink-100">{doc.event_name}</span><span className="mb-1 block text-xs text-ink-400">{formatDate(doc.event_date)}</span><BackupBadge status={doc.backup_status} /></span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Aktivitas Terbaru">
            {d.loading ? <Skeleton className="h-40 w-full" /> : <ActivityFeed logs={d.logs} />}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Pengingat"><RemindersList reminders={reminders} limit={6} /></Card>
          <Card title="Agenda Terdekat"><MiniCalendar refreshKey={tick} /></Card>
          <Card title="Progress Konten Bulan Ini">
            {d.loading ? <Skeleton className="h-24 w-full" /> : monthTotal === 0 ? (
              <p className="py-4 text-center text-sm text-ink-400">Belum ada konten terjadwal bulan ini.</p>
            ) : (
              <>
                <div className="flex items-end justify-between"><p className="text-3xl font-semibold tabular-nums text-ink-100">{pct}%</p><p className="text-xs text-ink-400">{published} dari {monthTotal} terbit</p></div>
                <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-white/10" role="img" aria-label={`${pct}% konten bulan ini sudah terbit`}>
                  {CONTENT_STATUSES.filter((s) => d.monthCounts[s]).map((s) => <i key={s} className={CONTENT_STATUS_STYLE[s].dot} style={{ width: `${(d.monthCounts[s] / monthTotal) * 100}%` }} />)}
                </div>
                <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-ink-300">
                  {CONTENT_STATUSES.filter((s) => d.monthCounts[s]).map((s) => <li key={s} className="flex items-center gap-1.5"><i className={cn('h-2 w-2 rounded-full', CONTENT_STATUS_STYLE[s].dot)} aria-hidden />{s} <span className="ml-auto tabular-nums text-ink-100">{d.monthCounts[s]}</span></li>)}
                </ul>
              </>
            )}
          </Card>
        </div>
      </div>

      <ContentFormModal open={modal === 'content'} onClose={() => setModal(null)} onSaved={refresh} />
      <DocumentationFormModal open={modal === 'doc'} onClose={() => setModal(null)} onSaved={refresh} />
      <AssetFormModal open={modal === 'asset'} onClose={() => setModal(null)} onSaved={refresh} />
      <BackupFormModal open={modal === 'backup'} onClose={() => setModal(null)} onSaved={refresh} />
    </>
  );
}

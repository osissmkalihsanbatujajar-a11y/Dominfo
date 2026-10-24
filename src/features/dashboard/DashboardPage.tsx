import { useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Boxes, CalendarClock, CalendarDays, Camera, Clock, Lock, Plus, ShieldPlus, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Thumbnail } from '@/components/ui/Thumbnail';
import { Avatar } from '@/components/ui/Avatar';
import { BackupBadge, ContentStatusBadge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useMembers } from '@/hooks/useLookups';
import { CONTENT_STATUS_STYLE, CONTENT_STATUSES, ROLE_LABEL } from '@/lib/constants';
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

function Card({ title, to, icon: Icon, children, className, index = 0 }: { title: string; to?: string; icon?: LucideIcon; children: ReactNode; className?: string; index?: number }) {
  return (
    <section className={cn('glass animate-rise rounded-2xl p-4 sm:p-5', className)} style={{ '--i': index } as CSSProperties}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-100">
          {Icon && <span className="grid h-7 w-7 place-items-center rounded-lg bg-iris-500/15 text-iris-300"><Icon className="h-3.5 w-3.5" aria-hidden /></span>}
          {title}
        </h2>
        {to && <Link to={to} className="inline-flex min-h-9 items-center gap-1 text-xs font-medium text-iris-300 hover:underline">Lihat semua <ArrowUpRight className="h-3 w-3" aria-hidden /></Link>}
      </div>
      {children}
    </section>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

/** Pengganti widget kalender untuk Viewer: menjelaskan kenapa bagian ini tidak tersedia. */
function PrivateCalendarNotice() {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-iris-500/15 text-iris-300"><Lock className="h-5 w-5" aria-hidden /></span>
      <p className="mt-3 text-sm font-medium text-ink-100">Agenda OSIS bersifat privat</p>
      <p className="mt-1 max-w-[16rem] text-xs leading-relaxed text-ink-400">Rencana kegiatan hanya dapat dilihat oleh Admin dan Editor.</p>
    </div>
  );
}

type Modal = 'content' | 'doc' | 'asset' | 'backup' | null;

export default function DashboardPage() {
  const { profile, canWrite, canViewCalendar } = useAuth();
  const { members } = useMembers(false);
  const [tick, setTick] = useState(0);
  const [modal, setModal] = useState<Modal>(null);
  const d = useDashboard(tick, canViewCalendar);
  const { reminders, reload: reloadReminders } = useReminders(canViewCalendar);
  const refresh = () => { setTick((t) => t + 1); reloadReminders(); };
  const first = (profile?.full_name ?? '').split(' ')[0];
  const todayCount = reminders.filter((r) => r.kind === 'today').length;

  const stats: { label: string; value: number; icon: LucideIcon }[] = [
    { label: 'Total dokumentasi', value: d.totalDocs, icon: Camera },
    { label: 'Dokumentasi bulan ini', value: d.docsThisMonth, icon: CalendarDays },
    ...(canViewCalendar ? [
      { label: 'Konten akan datang', value: d.upcomingCount, icon: CalendarClock },
      { label: 'Konten belum selesai', value: d.unfinished, icon: Clock },
    ] : []),
    { label: 'Total aset', value: d.totalAssets, icon: Boxes },
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
      <header className="hero-surface animate-rise relative mb-4 overflow-hidden rounded-3xl p-5 sm:p-7">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm capitalize text-ink-300">{formatLongDate(new Date())}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">{first ? `${greeting()}, ${first}` : greeting()}</h1>
            <p className="mt-1.5 text-sm text-ink-300">
              {canViewCalendar
                ? (todayCount > 0 ? `Ada ${todayCount} agenda konten hari ini.` : 'Tidak ada agenda konten hari ini.')
                : 'Lihat dokumentasi kegiatan, bank aset, dan daftar anggota DOMINFO.'}
            </p>
          </div>
          {profile && (
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-ink-950/40 px-3 py-1.5 text-xs text-ink-200 ring-1 ring-inset ring-white/10">
              <i className={cn('h-1.5 w-1.5 rounded-full', profile.role === 'viewer' ? 'bg-slate-400' : 'bg-emerald-400')} aria-hidden />
              Masuk sebagai <span className="font-semibold text-ink-100">{ROLE_LABEL[profile.role]}</span>
            </span>
          )}
        </div>
      </header>

      {d.error && <p role="alert" className="mb-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{d.error}</p>}

      <section aria-label="Ringkasan" className={cn('glass animate-rise mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10', canViewCalendar ? 'lg:grid-cols-5' : 'lg:grid-cols-3')} style={{ '--i': 1 } as CSSProperties}>
        {stats.map((s, i) => (
          <div key={s.label} className={cn('bg-ink-900/90 p-4 transition hover:bg-ink-900 sm:p-5', i === stats.length - 1 && stats.length % 2 === 1 && 'col-span-2 lg:col-span-1')}>
            <div className="flex items-start justify-between">
              {d.loading ? <Skeleton className="h-8 w-14" /> : <p className="text-3xl font-semibold tabular-nums text-ink-100">{s.value}</p>}
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-iris-500/10 text-iris-300"><s.icon className="h-4 w-4" aria-hidden /></span>
            </div>
            <p className="mt-1 text-xs text-ink-400">{s.label}</p>
          </div>
        ))}
      </section>

      {canWrite && (
        <section aria-label="Aksi cepat" className="animate-rise mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4" style={{ '--i': 2 } as CSSProperties}>
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
          {canViewCalendar && (
          <Card title="Upcoming Content" to="/kalender" icon={CalendarClock} index={3}>
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
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-ink-100">{c.title}</span><span className="block text-xs text-ink-400">{c.platforms.join(', ')} · {c.content_types.join(', ')}</span></span>
                        {(() => { const m = members.find((x) => x.member_id === c.assignees[0]); return m ? <Avatar name={m.name} src={m.profile_photo} size="sm" className="hidden sm:grid" /> : null; })()}
                        <ContentStatusBadge status={c.status} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
          )}

          <Card title="Recent Documentation" to="/dokumentasi" icon={Camera} index={4}>
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

          <Card title="Aktivitas Terbaru" index={5}>
            {d.loading ? <Skeleton className="h-40 w-full" /> : <ActivityFeed logs={d.logs} />}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Pengingat" index={6}><RemindersList reminders={reminders} limit={6} /></Card>
          {canViewCalendar ? (
            <>
              <Card title="Agenda Terdekat" icon={CalendarDays} index={7}><MiniCalendar refreshKey={tick} /></Card>
            <Card title="Progress Konten Bulan Ini" icon={CalendarDays} index={8}>
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
            </>
          ) : (
            <Card title="Agenda OSIS" icon={Lock} index={7}><PrivateCalendarNotice /></Card>
          )}
        </div>
      </div>

      {canWrite && <ContentFormModal open={modal === 'content'} onClose={() => setModal(null)} onSaved={refresh} />}
      <DocumentationFormModal open={modal === 'doc'} onClose={() => setModal(null)} onSaved={refresh} />
      <AssetFormModal open={modal === 'asset'} onClose={() => setModal(null)} onSaved={refresh} />
      <BackupFormModal open={modal === 'backup'} onClose={() => setModal(null)} onSaved={refresh} />
    </>
  );
}

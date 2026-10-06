import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, CloudOff, ExternalLink, FileStack, Pencil, Plus, ShieldCheck, Star, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select, toOptions } from '@/components/ui/Input';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconAction } from '@/components/ui/IconAction';
import { NeutralBadge, Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useClampPage, useList } from '@/hooks/useList';
import { useListControls } from '@/hooks/useListControls';
import { useDocumentOptions } from '@/hooks/useLookups';
import { BACKUP_TYPES, PAGE_SIZE, STORAGE_PROVIDERS } from '@/lib/constants';
import { cn, formatDate, isSafeUrl } from '@/lib/utils';
import { backupService, countRows } from '@/services';
import { supabase } from '@/supabase/client';
import type { Backup } from '@/types';
import { BackupFormModal } from './BackupFormModal';

interface Stats { total: number; backedUp: number; notBacked: number; last: { date: string; name: string } | null }
interface Risk { documentation_id: string; event_name: string; event_date: string; is_important: boolean }

const SORTS = [
  { value: 'backup_date:desc', label: 'Tanggal backup terbaru' },
  { value: 'backup_date:asc', label: 'Tanggal backup terlama' },
  { value: 'created_at:desc', label: 'Terakhir ditambahkan' },
];
const FILTERS = { backup_type: '', storage_provider: '', verified: '', documentation_id: '' };

export default function BackupPage() {
  const { canWrite, isAdmin } = useAuth();
  const toast = useToast();
  const docOptions = useDocumentOptions();
  const c = useListControls(FILTERS, 'backup_date:desc');
  const f = c.filters;

  const { data, count, loading, error, reload } = useList<Backup>({
    table: 'backups',
    select: '*, documentation:documentation(event_name,is_important)',
    search: c.debouncedSearch,
    searchColumns: ['notes', 'backup_url', 'storage_provider', 'backup_type'],
    searchDateColumns: ['backup_date'],
    eq: { backup_type: f.backup_type, storage_provider: f.storage_provider, documentation_id: f.documentation_id, verified: f.verified },
    sort: c.sort,
    page: c.page,
    pageSize: PAGE_SIZE,
  });
  useClampPage(c.page, count, PAGE_SIZE, loading, c.setPage);

  const [stats, setStats] = useState<Stats | null>(null);
  const [risks, setRisks] = useState<Risk[]>([]);
  const loadStats = useCallback(async () => {
    const [total, notBacked, last, risk] = await Promise.all([
      countRows('documentation'),
      countRows('documentation', (q) => q.eq('backup_status', 'Not Backed Up')),
      supabase.from('backups').select('backup_date, documentation:documentation(event_name)').order('backup_date', { ascending: false }).limit(1),
      supabase.from('documentation').select('documentation_id,event_name,event_date,is_important').eq('backup_status', 'Not Backed Up').in('status', ['On Going', 'Completed'])
        .order('is_important', { ascending: false }).order('event_date', { ascending: false }).limit(8),
    ]);
    const row = last.data?.[0] as unknown as { backup_date: string; documentation: { event_name: string } | null } | undefined;
    setStats({ total, notBacked, backedUp: total - notBacked, last: row ? { date: row.backup_date, name: row.documentation?.event_name ?? '—' } : null });
    setRisks((risk.data ?? []) as Risk[]);
  }, []);
  useEffect(() => { loadStats(); }, [loadStats]);
  const refresh = () => { reload(); loadStats(); };

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Backup | null>(null);
  const [presetDoc, setPresetDoc] = useState<string | undefined>();
  const [deleting, setDeleting] = useState<Backup | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const openCreate = (docId?: string) => { setEditing(null); setPresetDoc(docId); setFormOpen(true); };
  const openEdit = (b: Backup) => { setEditing(b); setPresetDoc(undefined); setFormOpen(true); };

  async function toggleVerified(b: Backup) {
    setToggling(b.backup_id);
    try {
      await backupService.update(b.backup_id, { verified: !b.verified });
      toast.success(b.verified ? 'Verifikasi dibatalkan' : 'Backup terverifikasi');
      reload();
    } catch (e) {
      toast.error((e as { code?: string }).code === '42501' ? 'Anda tidak memiliki izin untuk melakukan aksi ini.' : 'Gagal memperbarui verifikasi.');
    } finally {
      setToggling(null);
    }
  }

  const addBtn = canWrite && <Button variant="primary" onClick={() => openCreate()}><Plus className="h-4 w-4" aria-hidden /> Tambah backup</Button>;
  const cards = [
    { label: 'Total dokumentasi', value: stats?.total, icon: FileStack, tone: 'text-iris-300 bg-iris-500/15' },
    { label: 'Sudah di-backup', value: stats?.backedUp, icon: CheckCircle2, tone: 'text-emerald-300 bg-emerald-500/15' },
    { label: 'Belum di-backup', value: stats?.notBacked, icon: CloudOff, tone: 'text-rose-300 bg-rose-500/15' },
  ];

  return (
    <>
      <PageHeader title="Backup" description="Pastikan dokumentasi penting punya salinan cadangan di penyimpanan lain." actions={addBtn} />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="glass rounded-2xl p-4">
            <span className={cn('grid h-9 w-9 place-items-center rounded-xl', tone)}><Icon className="h-[18px] w-[18px]" aria-hidden /></span>
            {value === undefined ? <Skeleton className="mt-3 h-7 w-12" /> : <p className="mt-3 text-2xl font-semibold tabular-nums text-ink-100">{value}</p>}
            <p className="text-xs text-ink-400">{label}</p>
          </div>
        ))}
        <div className="glass col-span-2 rounded-2xl p-4 lg:col-span-1">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-500/15 text-cyan-300"><ShieldCheck className="h-[18px] w-[18px]" aria-hidden /></span>
          {stats === null ? <Skeleton className="mt-3 h-7 w-28" /> : <p className="mt-3 truncate text-base font-semibold text-ink-100">{stats.last ? formatDate(stats.last.date) : 'Belum ada'}</p>}
          <p className="truncate text-xs text-ink-400">Backup terakhir{stats?.last ? ` · ${stats.last.name}` : ''}</p>
        </div>
      </div>

      {risks.length > 0 && (
        <section aria-label="Peringatan backup" className="mb-5 rounded-2xl bg-rose-500/10 p-4 ring-1 ring-inset ring-rose-400/25">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-rose-200"><AlertTriangle className="h-4 w-4" aria-hidden /> {stats?.notBacked} dokumentasi belum punya backup</h2>
          <ul className="mt-3 space-y-1.5">
            {risks.map((r) => (
              <li key={r.documentation_id} className="flex items-center justify-between gap-3 rounded-xl bg-black/20 px-3 py-2">
                <span className="min-w-0 text-sm text-ink-100">
                  <span className="block truncate font-medium">{r.event_name}{r.is_important && <Star className="ml-1.5 inline h-3.5 w-3.5 text-amber-300" aria-label="Penting" />}</span>
                  <span className="text-xs text-ink-400">{formatDate(r.event_date)}{r.is_important ? ' · Dokumentasi penting' : ''}</span>
                </span>
                {canWrite && <Button size="sm" onClick={() => openCreate(r.documentation_id)}>Tambah backup</Button>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="glass mb-5 space-y-3 rounded-2xl p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <SearchInput value={c.search} onChange={c.setSearch} placeholder="Cari catatan, URL, atau penyimpanan…" label="Cari backup" className="flex-1" />
          <Select className="lg:w-60" aria-label="Urutkan" value={c.sort} onChange={(e) => c.setSort(e.target.value)} options={SORTS} />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Select aria-label="Filter dokumentasi" value={f.documentation_id} onChange={(e) => c.setFilter('documentation_id', e.target.value)} placeholder="Semua dokumentasi" options={docOptions} className="col-span-2 md:col-span-1" />
          <Select aria-label="Filter tipe backup" value={f.backup_type} onChange={(e) => c.setFilter('backup_type', e.target.value)} placeholder="Semua tipe" options={toOptions(BACKUP_TYPES)} />
          <Select aria-label="Filter penyimpanan" value={f.storage_provider} onChange={(e) => c.setFilter('storage_provider', e.target.value)} placeholder="Semua penyimpanan" options={toOptions(STORAGE_PROVIDERS)} />
          <Select aria-label="Filter verifikasi" value={f.verified} onChange={(e) => c.setFilter('verified', e.target.value)} placeholder="Semua verifikasi" options={[{ value: 'true', label: 'Terverifikasi' }, { value: 'false', label: 'Belum diverifikasi' }]} />
        </div>
        {c.activeCount > 0 && <div className="flex justify-end"><Button size="sm" variant="ghost" onClick={c.reset}>Reset filter ({c.activeCount})</Button></div>}
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}

      {loading ? <ListSkeleton /> : data.length === 0 ? (
        c.activeCount > 0 ? (
          <EmptyState icon={ShieldCheck} title="Backup tidak ditemukan" description="Tidak ada backup yang cocok dengan pencarian atau filter Anda." action={<Button onClick={c.reset}>Reset filter</Button>} />
        ) : (
          <EmptyState icon={ShieldCheck} title="Belum ada backup" description="Catat backup pertama agar dokumentasi tidak hilang." action={addBtn || undefined} />
        )
      ) : (
        <ul className="space-y-3">
          {data.map((b) => (
            <li key={b.backup_id} className="glass flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-100">{b.documentation?.event_name ?? 'Dokumentasi dihapus'}{b.documentation?.is_important && <Star className="ml-1.5 inline h-3.5 w-3.5 text-amber-300" aria-label="Penting" />}</p>
                <p className="mt-0.5 text-xs text-ink-400">Dicadangkan {formatDate(b.backup_date)}{b.notes ? ` · ${b.notes}` : ''}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <NeutralBadge>{b.backup_type}</NeutralBadge>
                <NeutralBadge>{b.storage_provider}</NeutralBadge>
                {canWrite ? (
                  <button onClick={() => toggleVerified(b)} disabled={toggling === b.backup_id} aria-pressed={b.verified} aria-label={b.verified ? 'Batalkan verifikasi' : 'Tandai terverifikasi'} className="min-h-8 disabled:opacity-50">
                    <Badge className={b.verified ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/25' : 'bg-amber-500/15 text-amber-300 ring-amber-400/25'}>{b.verified ? 'Terverifikasi' : 'Belum diverifikasi'}</Badge>
                  </button>
                ) : (
                  <Badge className={b.verified ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/25' : 'bg-amber-500/15 text-amber-300 ring-amber-400/25'}>{b.verified ? 'Terverifikasi' : 'Belum diverifikasi'}</Badge>
                )}
              </div>
              <div className="flex items-center justify-end">
                {isSafeUrl(b.backup_url) && <IconAction label="Buka backup" icon={ExternalLink} href={b.backup_url} />}
                {canWrite && <IconAction label="Ubah backup" icon={Pencil} onClick={() => openEdit(b)} />}
                {isAdmin && <IconAction label="Hapus backup" icon={Trash2} danger onClick={() => setDeleting(b)} />}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={c.page} pageSize={PAGE_SIZE} total={count} onPageChange={c.setPage} />

      <BackupFormModal open={formOpen} onClose={() => setFormOpen(false)} item={editing} documentationId={presetDoc} onSaved={refresh} />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Hapus catatan backup?" message="Catatan backup ini akan dihapus. File backup di cloud storage tidak ikut terhapus, dan status backup dokumentasi akan dihitung ulang."
        onConfirm={async () => { await backupService.remove(deleting!.backup_id); toast.success('Backup dihapus'); refresh(); }} />
    </>
  );
}

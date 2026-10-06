import { useState } from 'react';
import { Camera, ExternalLink, Eye, FolderOpen, LayoutGrid, MapPin, Pencil, Plus, Star, Table2, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select, toOptions } from '@/components/ui/Input';
import { SearchInput } from '@/components/ui/SearchInput';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { GridSkeleton, ListSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconAction } from '@/components/ui/IconAction';
import { Thumbnail } from '@/components/ui/Thumbnail';
import { BackupBadge, DocStatusBadge, NeutralBadge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useClampPage, useList } from '@/hooks/useList';
import { useListControls } from '@/hooks/useListControls';
import { useCategoryNames } from '@/hooks/useLookups';
import { useOpenParam } from '@/hooks/useOpenParam';
import { BACKUP_STATUSES, DOC_STATUSES, GRID_PAGE_SIZE, PAGE_SIZE } from '@/lib/constants';
import { formatDate, isSafeUrl } from '@/lib/utils';
import { documentationService } from '@/services';
import type { DocumentationItem } from '@/types';
import { DocumentationDetail } from './DocumentationDetail';
import { DocumentationFormModal } from './DocumentationFormModal';

const SORTS = [
  { value: 'event_date:desc', label: 'Tanggal terbaru' },
  { value: 'event_date:asc', label: 'Tanggal terlama' },
  { value: 'event_name:asc', label: 'Nama A–Z' },
  { value: 'event_name:desc', label: 'Nama Z–A' },
  { value: 'created_at:desc', label: 'Terakhir ditambahkan' },
];
const FILTERS = { category: '', status: '', backup_status: '', location: '', from: '', to: '' };
const driveLink = (d: DocumentationItem) => [d.photo_link, d.video_link, d.document_link].find(isSafeUrl) ?? null;

export default function DocumentationPage() {
  const { canWrite, isAdmin } = useAuth();
  const toast = useToast();
  const categories = useCategoryNames('documentation');
  const [view, setView] = useState<'table' | 'gallery'>(() => (localStorage.getItem('doc-view') as 'table' | 'gallery') || 'table');
  const c = useListControls(FILTERS, 'event_date:desc');
  const pageSize = view === 'gallery' ? GRID_PAGE_SIZE : PAGE_SIZE;
  const f = c.filters;

  const { data, count, loading, error, reload } = useList<DocumentationItem>({
    table: 'documentation',
    search: c.debouncedSearch,
    searchColumns: ['event_name', 'location', 'category', 'description', 'photographer', 'videographer'],
    searchDateColumns: ['event_date'],
    eq: { category: f.category, status: f.status, backup_status: f.backup_status },
    ilike: { location: f.location },
    gte: { event_date: f.from },
    lte: { event_date: f.to },
    sort: c.sort,
    page: c.page,
    pageSize,
  });
  useClampPage(c.page, count, pageSize, loading, c.setPage);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentationItem | null>(null);
  const [detail, setDetail] = useState<DocumentationItem | null>(null);
  const [deleting, setDeleting] = useState<DocumentationItem | null>(null);

  useOpenParam((id) => { documentationService.getById(id).then((d) => d && setDetail(d)); });

  const changeView = (v: 'table' | 'gallery') => { setView(v); localStorage.setItem('doc-view', v); };
  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (d: DocumentationItem) => { setDetail(null); setEditing(d); setFormOpen(true); };

  const addButton = canWrite && <Button variant="primary" onClick={openCreate}><Plus className="h-4 w-4" aria-hidden /> Tambah dokumentasi</Button>;

  const actions = (d: DocumentationItem) => (
    <div className="flex items-center justify-end">
      <IconAction label={`Lihat ${d.event_name}`} icon={Eye} onClick={() => setDetail(d)} />
      {driveLink(d) && <IconAction label={`Buka Drive ${d.event_name}`} icon={ExternalLink} href={driveLink(d)!} />}
      {canWrite && <IconAction label={`Ubah ${d.event_name}`} icon={Pencil} onClick={() => openEdit(d)} />}
      {isAdmin && <IconAction label={`Hapus ${d.event_name}`} icon={Trash2} danger onClick={() => setDeleting(d)} />}
    </div>
  );

  return (
    <>
      <PageHeader title="Dokumentasi" description="Catatan seluruh dokumentasi kegiatan OSIS dan sekolah beserta link foto, video, dan backup-nya." actions={addButton} />

      <div className="glass mb-5 space-y-3 rounded-2xl p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <SearchInput value={c.search} onChange={c.setSearch} placeholder="Cari kegiatan, lokasi, fotografer…" label="Cari dokumentasi" className="flex-1" />
          <div className="flex items-center gap-3">
            <Select className="flex-1 lg:w-48" aria-label="Urutkan" value={c.sort} onChange={(e) => c.setSort(e.target.value)} options={SORTS} />
            <SegmentedControl label="Tampilan" value={view} onChange={changeView} options={[{ value: 'table', label: 'Tabel', icon: Table2 }, { value: 'gallery', label: 'Galeri', icon: LayoutGrid }]} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Select aria-label="Filter kategori" value={f.category} onChange={(e) => c.setFilter('category', e.target.value)} placeholder="Semua kategori" options={toOptions(categories)} />
          <Select aria-label="Filter status" value={f.status} onChange={(e) => c.setFilter('status', e.target.value)} placeholder="Semua status" options={toOptions(DOC_STATUSES)} />
          <Select aria-label="Filter backup" value={f.backup_status} onChange={(e) => c.setFilter('backup_status', e.target.value)} placeholder="Semua backup" options={toOptions(BACKUP_STATUSES)} />
          <Input aria-label="Filter lokasi" placeholder="Lokasi…" value={f.location} onChange={(e) => c.setFilter('location', e.target.value)} />
          <Input type="date" aria-label="Dari tanggal" value={f.from} onChange={(e) => c.setFilter('from', e.target.value)} />
          <Input type="date" aria-label="Sampai tanggal" value={f.to} onChange={(e) => c.setFilter('to', e.target.value)} />
        </div>
        {c.activeCount > 0 && <div className="flex justify-end"><Button size="sm" variant="ghost" onClick={c.reset}>Reset filter ({c.activeCount})</Button></div>}
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}

      {loading ? (view === 'gallery' ? <GridSkeleton /> : <ListSkeleton />)
        : data.length === 0 ? (
          c.activeCount > 0 ? (
            <EmptyState icon={FolderOpen} title="Tidak ada hasil" description="Tidak ada dokumentasi yang cocok dengan pencarian atau filter Anda." action={<Button onClick={c.reset}>Reset filter</Button>} />
          ) : (
            <EmptyState icon={Camera} title="Belum ada dokumentasi" description="Tambahkan dokumentasi kegiatan pertama." action={addButton || undefined} />
          )
        ) : view === 'gallery' ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.map((d) => (
              <li key={d.documentation_id} className="glass card-hover group overflow-hidden rounded-2xl">
                <button onClick={() => setDetail(d)} className="block w-full text-left" aria-label={`Lihat detail ${d.event_name}`}>
                  <Thumbnail src={d.thumbnail_url} alt={d.event_name} className="aspect-[16/10]" />
                </button>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-semibold text-ink-100">{d.event_name}</h3>
                    {d.is_important && <Star className="h-4 w-4 shrink-0 text-amber-300" aria-label="Penting" />}
                  </div>
                  <p className="text-xs text-ink-400">{formatDate(d.event_date)}</p>
                  <p className="flex items-center gap-1 text-xs text-ink-400"><MapPin className="h-3 w-3" aria-hidden />{d.location || 'Lokasi belum diisi'}</p>
                  <div className="flex flex-wrap gap-1.5"><NeutralBadge>{d.category}</NeutralBadge><BackupBadge status={d.backup_status} /></div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" className="flex-1" onClick={() => setDetail(d)}>Lihat</Button>
                    {driveLink(d) ? (
                      <a href={driveLink(d)!} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 text-sm font-medium text-ink-100 ring-1 ring-inset ring-white/10 hover:bg-white/10">
                        Buka Drive <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    ) : (
                      <Button size="sm" className="flex-1" disabled>Belum ada link</Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <div className="glass hidden overflow-x-auto rounded-2xl md:block">
              <table className="w-full min-w-[860px] text-left text-sm">
                <caption className="sr-only">Daftar dokumentasi kegiatan</caption>
                <thead className="border-b border-white/10 text-xs text-ink-400">
                  <tr>{['Event', 'Date', 'Location', 'Category', 'Photographer', 'Status', 'Backup', 'Actions'].map((h) => <th key={h} scope="col" className="px-4 py-3 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.map((d) => (
                    <tr key={d.documentation_id} className="transition hover:bg-white/[0.04]">
                      <td className="max-w-[220px] px-4 py-3">
                        <button onClick={() => setDetail(d)} className="flex items-center gap-1.5 text-left font-medium text-ink-100 hover:text-iris-300">
                          <span className="truncate">{d.event_name}</span>{d.is_important && <Star className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-label="Penting" />}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-300">{formatDate(d.event_date)}</td>
                      <td className="px-4 py-3 text-ink-300">{d.location || '—'}</td>
                      <td className="px-4 py-3"><NeutralBadge>{d.category}</NeutralBadge></td>
                      <td className="px-4 py-3 text-ink-300">{d.photographer || '—'}</td>
                      <td className="px-4 py-3"><DocStatusBadge status={d.status} /></td>
                      <td className="px-4 py-3"><BackupBadge status={d.backup_status} /></td>
                      <td className="px-4 py-2">{actions(d)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="space-y-3 md:hidden">
              {data.map((d) => (
                <li key={d.documentation_id} className="glass rounded-2xl p-4">
                  <button onClick={() => setDetail(d)} className="text-left text-sm font-semibold text-ink-100">{d.event_name}{d.is_important && <Star className="ml-1.5 inline h-3.5 w-3.5 text-amber-300" aria-label="Penting" />}</button>
                  <p className="mt-1 text-xs text-ink-400">{formatDate(d.event_date)} · {d.location || 'Lokasi belum diisi'}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5"><NeutralBadge>{d.category}</NeutralBadge><DocStatusBadge status={d.status} /><BackupBadge status={d.backup_status} /></div>
                  <div className="mt-2 border-t border-white/5 pt-2">{actions(d)}</div>
                </li>
              ))}
            </ul>
          </>
        )}

      <Pagination page={c.page} pageSize={pageSize} total={count} onPageChange={c.setPage} />

      <DocumentationFormModal open={formOpen} onClose={() => setFormOpen(false)} item={editing} onSaved={reload} />
      <DocumentationDetail item={detail} onClose={() => setDetail(null)} onEdit={openEdit} />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Hapus dokumentasi?"
        message={`“${deleting?.event_name}” beserta seluruh data backup-nya akan dihapus permanen. File di Google Drive tidak ikut terhapus.`}
        onConfirm={async () => { await documentationService.remove(deleting!.documentation_id); toast.success('Dokumentasi dihapus'); reload(); }} />
    </>
  );
}

import { useState } from 'react';
import { Boxes, ExternalLink, FileText, Film, FolderOpen, Image as ImageIcon, LayoutGrid, List, Pencil, Plus, Trash2, Type } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input, Select, toOptions } from '@/components/ui/Input';
import { SearchInput } from '@/components/ui/SearchInput';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { GridSkeleton, ListSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconAction } from '@/components/ui/IconAction';
import { Modal } from '@/components/ui/Modal';
import { Thumbnail } from '@/components/ui/Thumbnail';
import { NeutralBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useClampPage, useList } from '@/hooks/useList';
import { useListControls } from '@/hooks/useListControls';
import { useCategoryNames } from '@/hooks/useLookups';
import { useOpenParam } from '@/hooks/useOpenParam';
import { FILE_TYPES, GRID_PAGE_SIZE, PAGE_SIZE } from '@/lib/constants';
import { formatDate, isSafeUrl } from '@/lib/utils';
import { assetService } from '@/services';
import type { Asset } from '@/types';
import { AssetFormModal } from './AssetFormModal';

const SORTS = [
  { value: 'updated_at:desc', label: 'Terakhir diperbarui' },
  { value: 'created_at:desc', label: 'Terbaru ditambahkan' },
  { value: 'name:asc', label: 'Nama A–Z' },
  { value: 'name:desc', label: 'Nama Z–A' },
  { value: 'version:desc', label: 'Versi' },
];
const FILTERS = { category: '', file_type: '', version: '' };
const iconFor = (a: Asset) => (a.category === 'Font' ? Type : a.category === 'Video' ? Film : a.category === 'Document' ? FileText : ImageIcon);

export default function AssetsPage() {
  const { canWrite, isAdmin } = useAuth();
  const toast = useToast();
  const categories = useCategoryNames('asset');
  const [view, setView] = useState<'grid' | 'list'>(() => (localStorage.getItem('asset-view') as 'grid' | 'list') || 'grid');
  const c = useListControls(FILTERS, 'updated_at:desc');
  const f = c.filters;
  const pageSize = view === 'grid' ? GRID_PAGE_SIZE : PAGE_SIZE;

  const { data, count, loading, error, reload } = useList<Asset>({
    table: 'assets',
    search: c.debouncedSearch,
    searchColumns: ['name', 'description', 'category', 'file_type'],
    eq: { category: f.category, file_type: f.file_type },
    ilike: { version: f.version },
    sort: c.sort,
    page: c.page,
    pageSize,
  });
  useClampPage(c.page, count, pageSize, loading, c.setPage);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [detail, setDetail] = useState<Asset | null>(null);
  const [deleting, setDeleting] = useState<Asset | null>(null);

  useOpenParam((id) => { assetService.getById(id).then((a) => a && setDetail(a)); });

  const changeView = (v: 'grid' | 'list') => { setView(v); localStorage.setItem('asset-view', v); };
  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (a: Asset) => { setDetail(null); setEditing(a); setFormOpen(true); };
  const addBtn = canWrite && <Button variant="primary" onClick={openCreate}><Plus className="h-4 w-4" aria-hidden /> Tambah aset</Button>;

  const actions = (a: Asset) => (
    <div className="flex items-center justify-end">
      {isSafeUrl(a.file_url) && <IconAction label={`Buka ${a.name}`} icon={ExternalLink} href={a.file_url} />}
      {canWrite && <IconAction label={`Ubah ${a.name}`} icon={Pencil} onClick={() => openEdit(a)} />}
      {isAdmin && <IconAction label={`Hapus ${a.name}`} icon={Trash2} danger onClick={() => setDeleting(a)} />}
    </div>
  );

  return (
    <>
      <PageHeader title="Bank Aset" description="Logo, font, template, dan elemen grafis resmi DOMINFO — semua dalam satu tempat." actions={addBtn} />

      <div className="glass mb-5 space-y-3 rounded-2xl p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <SearchInput value={c.search} onChange={c.setSearch} placeholder="Cari nama, kategori, tipe file…" label="Cari aset" className="flex-1" />
          <div className="flex items-center gap-3">
            <Select className="flex-1 lg:w-52" aria-label="Urutkan" value={c.sort} onChange={(e) => c.setSort(e.target.value)} options={SORTS} />
            <SegmentedControl label="Tampilan" value={view} onChange={changeView} options={[{ value: 'grid', label: 'Grid', icon: LayoutGrid }, { value: 'list', label: 'Daftar', icon: List }]} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Select aria-label="Filter kategori" value={f.category} onChange={(e) => c.setFilter('category', e.target.value)} placeholder="Semua kategori" options={toOptions(categories)} />
          <Select aria-label="Filter tipe file" value={f.file_type} onChange={(e) => c.setFilter('file_type', e.target.value)} placeholder="Semua tipe file" options={toOptions(FILE_TYPES)} />
          <Input aria-label="Filter versi" placeholder="Versi, mis. 1.0" value={f.version} onChange={(e) => c.setFilter('version', e.target.value)} />
          {c.activeCount > 0 && <Button onClick={c.reset}>Reset filter ({c.activeCount})</Button>}
        </div>
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}

      {loading ? (view === 'grid' ? <GridSkeleton /> : <ListSkeleton />) : data.length === 0 ? (
        c.activeCount > 0 ? (
          <EmptyState icon={FolderOpen} title="Aset tidak ditemukan" description="Tidak ada aset yang cocok dengan pencarian atau filter Anda." action={<Button onClick={c.reset}>Reset filter</Button>} />
        ) : (
          <EmptyState icon={Boxes} title="Belum ada aset" description="Tambahkan logo, font, atau template pertama." action={addBtn || undefined} />
        )
      ) : view === 'grid' ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.map((a) => (
            <li key={a.asset_id} className="glass card-hover overflow-hidden rounded-2xl">
              <button onClick={() => setDetail(a)} className="block w-full" aria-label={`Lihat detail ${a.name}`}>
                <Thumbnail src={a.preview_url} alt={a.name} icon={iconFor(a)} className="aspect-[4/3]" />
              </button>
              <div className="space-y-2 p-4">
                <h3 className="truncate text-sm font-semibold text-ink-100">{a.name}</h3>
                <div className="flex flex-wrap items-center gap-1.5"><NeutralBadge>{a.category}</NeutralBadge><NeutralBadge>{a.file_type}</NeutralBadge><NeutralBadge>v{a.version}</NeutralBadge></div>
                <p className="text-xs text-ink-400">Diperbarui {formatDate(a.updated_at)}</p>
                <div className="flex gap-2 pt-1">
                  {isSafeUrl(a.file_url) && (
                    <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-iris-500 px-3 text-sm font-medium text-white hover:bg-iris-400">
                      Buka <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  )}
                  {canWrite && <IconAction label={`Ubah ${a.name}`} icon={Pencil} onClick={() => openEdit(a)} />}
                  {isAdmin && <IconAction label={`Hapus ${a.name}`} icon={Trash2} danger onClick={() => setDeleting(a)} />}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-2">
          {data.map((a) => (
            <li key={a.asset_id} className="glass flex flex-wrap items-center gap-3 rounded-2xl p-3">
              <button onClick={() => setDetail(a)} aria-label={`Lihat detail ${a.name}`} className="shrink-0"><Thumbnail src={a.preview_url} alt={a.name} icon={iconFor(a)} className="h-14 w-14 rounded-xl" /></button>
              <div className="min-w-0 flex-1 basis-40">
                <button onClick={() => setDetail(a)} className="block max-w-full truncate text-left text-sm font-semibold text-ink-100 hover:text-iris-300">{a.name}</button>
                <p className="text-xs text-ink-400">Diperbarui {formatDate(a.updated_at)}</p>
              </div>
              <div className="flex flex-wrap gap-1.5"><NeutralBadge>{a.category}</NeutralBadge><NeutralBadge>{a.file_type}</NeutralBadge><NeutralBadge>v{a.version}</NeutralBadge></div>
              {actions(a)}
            </li>
          ))}
        </ul>
      )}

      <Pagination page={c.page} pageSize={pageSize} total={count} onPageChange={c.setPage} />

      <AssetFormModal open={formOpen} onClose={() => setFormOpen(false)} item={editing} onSaved={reload} />
      {detail && (
        <Modal open onClose={() => setDetail(null)} title={detail.name} description={`${detail.category} · ${detail.file_type} · versi ${detail.version}`}>
          <Thumbnail src={detail.preview_url} alt={detail.name} icon={iconFor(detail)} className="aspect-[16/10] rounded-2xl" />
          {detail.description && <p className="mt-4 whitespace-pre-line text-sm text-ink-200">{detail.description}</p>}
          <p className="mt-3 text-xs text-ink-400">Dibuat {formatDate(detail.created_at)} · Diperbarui {formatDate(detail.updated_at)}</p>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {canWrite && <Button onClick={() => openEdit(detail)}><Pencil className="h-4 w-4" aria-hidden /> Ubah</Button>}
            {isSafeUrl(detail.file_url) && (
              <a href={detail.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-iris-500 px-4 text-sm font-medium text-white hover:bg-iris-400 sm:h-10">
                Buka / unduh <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            )}
          </div>
        </Modal>
      )}
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Hapus aset?" message={`“${deleting?.name}” akan dihapus dari bank aset. File asli di cloud storage tidak ikut terhapus.`}
        onConfirm={async () => { await assetService.remove(deleting!.asset_id); toast.success('Aset dihapus'); reload(); }} />
    </>
  );
}

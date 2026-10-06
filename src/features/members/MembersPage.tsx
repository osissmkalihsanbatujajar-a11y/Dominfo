import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select, toOptions } from '@/components/ui/Input';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconAction } from '@/components/ui/IconAction';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, NeutralBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useClampPage, useList } from '@/hooks/useList';
import { useListControls } from '@/hooks/useListControls';
import { MEMBER_ROLES, MEMBER_STATUSES, GRID_PAGE_SIZE } from '@/lib/constants';
import { memberService } from '@/services';
import type { Member } from '@/types';
import { MemberFormModal } from './MemberFormModal';

const SORTS = [
  { value: 'name:asc', label: 'Nama A–Z' },
  { value: 'name:desc', label: 'Nama Z–A' },
  { value: 'created_at:desc', label: 'Terbaru ditambahkan' },
];
const FILTERS = { role: '', status: '' };

export default function MembersPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [params] = useSearchParams();
  const c = useListControls(FILTERS, 'name:asc', params.get('q') ?? '');
  const f = c.filters;

  const { data, count, loading, error, reload } = useList<Member>({
    table: 'members',
    search: c.debouncedSearch,
    searchColumns: ['name', 'division', 'email'],
    eq: { status: f.status },
    cs: { roles: f.role },
    sort: c.sort,
    page: c.page,
    pageSize: GRID_PAGE_SIZE,
  });
  useClampPage(c.page, count, GRID_PAGE_SIZE, loading, c.setPage);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState<Member | null>(null);
  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const addBtn = isAdmin && <Button variant="primary" onClick={openCreate}><Plus className="h-4 w-4" aria-hidden /> Tambah anggota</Button>;

  return (
    <>
      <PageHeader title="Anggota DOMINFO" description={isAdmin ? 'Kelola anggota divisi. Hanya Admin yang dapat menambah, mengubah, atau menghapus.' : 'Daftar anggota divisi DOMINFO.'} actions={addBtn} />

      <div className="glass mb-5 space-y-3 rounded-2xl p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <SearchInput value={c.search} onChange={c.setSearch} placeholder="Cari nama, divisi, email…" label="Cari anggota" className="flex-1" />
          <Select className="lg:w-48" aria-label="Urutkan" value={c.sort} onChange={(e) => c.setSort(e.target.value)} options={SORTS} />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Select aria-label="Filter peran" value={f.role} onChange={(e) => c.setFilter('role', e.target.value)} placeholder="Semua peran" options={toOptions(MEMBER_ROLES)} />
          <Select aria-label="Filter status" value={f.status} onChange={(e) => c.setFilter('status', e.target.value)} placeholder="Semua status" options={toOptions(MEMBER_STATUSES)} />
          {c.activeCount > 0 && <Button onClick={c.reset}>Reset filter ({c.activeCount})</Button>}
        </div>
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}

      {loading ? <GridSkeleton items={6} /> : data.length === 0 ? (
        c.activeCount > 0 ? (
          <EmptyState icon={Users} title="Anggota tidak ditemukan" description="Tidak ada anggota yang cocok dengan pencarian atau filter Anda." action={<Button onClick={c.reset}>Reset filter</Button>} />
        ) : (
          <EmptyState icon={Users} title="Belum ada anggota" description="Tambahkan anggota DOMINFO pertama." action={addBtn || undefined} />
        )
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((m) => (
            <li key={m.member_id} className="glass flex items-start gap-3 rounded-2xl p-4">
              <Avatar name={m.name} src={m.profile_photo} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-ink-100">{m.name}</h3>
                <p className="text-xs text-ink-400">{m.division}</p>
                {m.email && <a href={`mailto:${m.email}`} className="mt-1 flex items-center gap-1.5 truncate text-xs text-iris-300 hover:underline"><Mail className="h-3 w-3 shrink-0" aria-hidden />{m.email}</a>}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.roles.map((r) => <NeutralBadge key={r}>{r}</NeutralBadge>)}
                  {m.status === 'Active' ? <Badge className="bg-emerald-500/15 text-emerald-300 ring-emerald-400/25">Aktif</Badge> : <NeutralBadge>Nonaktif</NeutralBadge>}
                </div>
              </div>
              {isAdmin && (
                <div className="flex shrink-0">
                  <IconAction label={`Ubah ${m.name}`} icon={Pencil} onClick={() => { setEditing(m); setFormOpen(true); }} />
                  <IconAction label={`Hapus ${m.name}`} icon={Trash2} danger onClick={() => setDeleting(m)} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <Pagination page={c.page} pageSize={GRID_PAGE_SIZE} total={count} onPageChange={c.setPage} />

      <MemberFormModal open={formOpen} onClose={() => setFormOpen(false)} item={editing} onSaved={reload} />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Hapus anggota?" message={`“${deleting?.name}” akan dihapus. Konten yang ditugaskan padanya akan menjadi “Belum ditentukan”.`}
        onConfirm={async () => { await memberService.remove(deleting!.member_id); toast.success('Anggota dihapus'); reload(); }} />
    </>
  );
}

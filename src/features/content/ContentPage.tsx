import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, CalendarRange, ChevronLeft, ChevronRight, List, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input, Select, toOptions } from '@/components/ui/Input';
import { SearchInput } from '@/components/ui/SearchInput';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconAction } from '@/components/ui/IconAction';
import { ContentStatusBadge, NeutralBadge, PriorityBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useClampPage, useList } from '@/hooks/useList';
import { useListControls } from '@/hooks/useListControls';
import { useMembers } from '@/hooks/useLookups';
import { useOpenParam } from '@/hooks/useOpenParam';
import { CONTENT_STATUSES, PAGE_SIZE, PLATFORMS, PRIORITIES } from '@/lib/constants';
import { addDays, formatDate, formatDateRange, formatMonth, monthGrid, parseYMD, startOfWeek, toYMD, todayYMD } from '@/lib/utils';
import { contentService } from '@/services';
import type { ContentItem } from '@/types';
import { ContentDetail } from './ContentDetail';
import { ContentFormModal } from './ContentFormModal';
import { DayPanel, MonthView, StatusLegend, WeekView } from './CalendarViews';

type View = 'month' | 'week' | 'list';
const SORTS = [
  { value: 'scheduled_date:asc', label: 'Tanggal publikasi (terdekat)' },
  { value: 'scheduled_date:desc', label: 'Tanggal publikasi (terjauh)' },
  { value: 'deadline:asc', label: 'Deadline terdekat' },
  { value: 'title:asc', label: 'Judul A–Z' },
  { value: 'created_at:desc', label: 'Terakhir dibuat' },
];
const FILTERS = { status: '', platform: '', priority: '', assignee: '', from: '', to: '' };

export default function ContentPage() {
  const { canWrite, isAdmin } = useAuth();
  const toast = useToast();
  const { members } = useMembers(false);
  const nameOf = (c: ContentItem) => c.assignees.map((id) => members.find((m) => m.member_id === id)?.name).filter(Boolean).join(', ');
  const [params] = useSearchParams();
  const startDate = params.get('date');

  const [view, setView] = useState<View>('month');
  const [anchor, setAnchor] = useState(() => (startDate ? parseYMD(startDate) : new Date()));
  const [selected, setSelected] = useState(startDate ?? todayYMD());
  const c = useListControls(FILTERS, 'scheduled_date:asc');
  const f = c.filters;

  const range = useMemo(() => {
    if (view === 'month') {
      const g = monthGrid(anchor.getFullYear(), anchor.getMonth());
      return { from: toYMD(g[0]), to: toYMD(g[g.length - 1]) };
    }
    if (view === 'week') {
      const s = startOfWeek(anchor);
      return { from: toYMD(s), to: toYMD(addDays(s, 6)) };
    }
    return { from: f.from, to: f.to };
  }, [view, anchor, f.from, f.to]);

  const paged = view === 'list';
  const { data, count, loading, error, reload } = useList<ContentItem>({
    table: 'content_calendar',
    search: c.debouncedSearch,
    searchColumns: ['title', 'description', 'caption'],
    searchDateColumns: ['scheduled_date', 'deadline'],
    eq: { status: f.status, priority: f.priority },
    cs: { platforms: f.platform, assignees: f.assignee },
    gte: { scheduled_date: range.from },
    lte: { scheduled_date: range.to },
    sort: paged ? c.sort : 'scheduled_date:asc',
    page: paged ? c.page : undefined,
    pageSize: paged ? PAGE_SIZE : undefined,
  });
  useClampPage(c.page, count, PAGE_SIZE, loading || !paged, c.setPage);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [defaults, setDefaults] = useState<Record<string, string> | undefined>();
  const [detail, setDetail] = useState<ContentItem | null>(null);
  const [deleting, setDeleting] = useState<ContentItem | null>(null);

  useOpenParam((id) => { contentService.getById(id).then((row) => row && setDetail(row)); });

  const openCreate = (ymd?: string) => { setEditing(null); setDefaults(ymd ? { scheduled_date: ymd } : undefined); setFormOpen(true); };
  const openEdit = (item: ContentItem) => { setDetail(null); setEditing(item); setDefaults(undefined); setFormOpen(true); };

  const shift = (dir: -1 | 1) => {
    if (view === 'week') setAnchor((a) => addDays(a, 7 * dir));
    else setAnchor((a) => new Date(a.getFullYear(), a.getMonth() + dir, 1));
  };
  const goToday = () => { setAnchor(new Date()); setSelected(todayYMD()); };
  const label = view === 'week' ? formatDateRange(startOfWeek(anchor), addDays(startOfWeek(anchor), 6)) : formatMonth(anchor);

  const addBtn = canWrite && <Button variant="primary" onClick={() => openCreate(view === 'list' ? undefined : selected)}><Plus className="h-4 w-4" aria-hidden /> Tambah konten</Button>;
  const rowActions = (i: ContentItem) => (
    <div className="flex items-center justify-end">
      {canWrite && <IconAction label={`Ubah ${i.title}`} icon={Pencil} onClick={() => openEdit(i)} />}
      {isAdmin && <IconAction label={`Hapus ${i.title}`} icon={Trash2} danger onClick={() => setDeleting(i)} />}
    </div>
  );

  return (
    <>
      <PageHeader title="Kalender Konten" description="Rencanakan konten, pantau deadline, dan lihat siapa penanggung jawabnya." actions={addBtn} />

      <div className="sticky top-16 z-20 -mx-4 mb-4 space-y-3 border-b border-white/5 bg-ink-950/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl<View> label="Tampilan kalender" value={view} onChange={setView}
            options={[{ value: 'month', label: 'Bulan', icon: CalendarDays }, { value: 'week', label: 'Minggu', icon: CalendarRange }, { value: 'list', label: 'Daftar', icon: List }]} />
          {view !== 'list' && (
            <div className="flex items-center gap-1">
              <Button size="icon" onClick={() => shift(-1)} aria-label="Sebelumnya"><ChevronLeft className="h-4 w-4" /></Button>
              <span className="min-w-36 px-2 text-center text-sm font-semibold capitalize text-ink-100" aria-live="polite">{label}</span>
              <Button size="icon" onClick={() => shift(1)} aria-label="Berikutnya"><ChevronRight className="h-4 w-4" /></Button>
              <Button size="sm" onClick={goToday}>Hari ini</Button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          <SearchInput value={c.search} onChange={c.setSearch} placeholder="Cari judul, caption…" label="Cari konten" className="col-span-2 md:col-span-4 xl:col-span-1" />
          <Select aria-label="Filter status" value={f.status} onChange={(e) => c.setFilter('status', e.target.value)} placeholder="Semua status" options={toOptions(CONTENT_STATUSES)} />
          <Select aria-label="Filter platform" value={f.platform} onChange={(e) => c.setFilter('platform', e.target.value)} placeholder="Semua platform" options={toOptions(PLATFORMS)} />
          <Select aria-label="Filter prioritas" value={f.priority} onChange={(e) => c.setFilter('priority', e.target.value)} placeholder="Semua prioritas" options={toOptions(PRIORITIES)} />
          <Select aria-label="Filter penanggung jawab" value={f.assignee} onChange={(e) => c.setFilter('assignee', e.target.value)} placeholder="Semua PJ" options={members.map((m) => ({ value: m.member_id, label: m.name }))} />
        </div>
        {view === 'list' && (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-[1fr_1fr_2fr_auto]">
            <Input type="date" aria-label="Dari tanggal" value={f.from} onChange={(e) => c.setFilter('from', e.target.value)} />
            <Input type="date" aria-label="Sampai tanggal" value={f.to} onChange={(e) => c.setFilter('to', e.target.value)} />
            <Select className="col-span-2 md:col-span-1" aria-label="Urutkan" value={c.sort} onChange={(e) => c.setSort(e.target.value)} options={SORTS} />
            {c.activeCount > 0 && <Button onClick={c.reset} className="col-span-2 md:col-span-1">Reset ({c.activeCount})</Button>}
          </div>
        )}
        {view !== 'list' && c.activeCount > 0 && <div className="flex justify-end"><Button size="sm" variant="ghost" onClick={c.reset}>Reset filter ({c.activeCount})</Button></div>}
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}

      {loading ? <ListSkeleton rows={6} /> : view === 'month' ? (
        <>
          <MonthView anchor={anchor} items={data} selected={selected} onSelect={setSelected} onOpen={setDetail} />
          <DayPanel ymd={selected} items={data} canWrite={canWrite} onOpen={setDetail} onAdd={openCreate} nameOf={nameOf} />
          <div className="mt-4"><StatusLegend /></div>
        </>
      ) : view === 'week' ? (
        <>
          <WeekView anchor={anchor} items={data} canWrite={canWrite} onOpen={setDetail} onAdd={openCreate} />
          <div className="mt-4"><StatusLegend /></div>
        </>
      ) : data.length === 0 ? (
        <EmptyState icon={CalendarDays} title={c.activeCount > 0 || f.from || f.to ? 'Tidak ada konten yang cocok' : 'Belum ada konten'}
          description={c.activeCount > 0 ? 'Ubah atau reset filter untuk melihat konten lain.' : 'Tambahkan rencana konten pertama.'}
          action={c.activeCount > 0 ? <Button onClick={c.reset}>Reset filter</Button> : addBtn || undefined} />
      ) : (
        <>
          <div className="glass hidden overflow-x-auto rounded-2xl md:block">
            <table className="w-full min-w-[900px] text-left text-sm">
              <caption className="sr-only">Daftar konten</caption>
              <thead className="border-b border-white/10 text-xs text-ink-400">
                <tr>{['Judul', 'Publikasi', 'Deadline', 'Platform', 'Status', 'Prioritas', 'PJ', 'Aksi'].map((h) => <th key={h} scope="col" className="px-4 py-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map((i) => (
                  <tr key={i.content_id} className="transition hover:bg-white/[0.04]">
                    <td className="max-w-[260px] px-4 py-3"><button onClick={() => setDetail(i)} className="truncate text-left font-medium text-ink-100 hover:text-iris-300">{i.title}</button></td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-300">{formatDate(i.scheduled_date)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-300">{formatDate(i.deadline)}</td>
                    <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{i.platforms.map((p) => <NeutralBadge key={p}>{p}</NeutralBadge>)}</div></td>
                    <td className="px-4 py-3"><ContentStatusBadge status={i.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={i.priority} /></td>
                    <td className="max-w-[180px] px-4 py-3 text-ink-300">{nameOf(i) || '—'}</td>
                    <td className="px-4 py-2">{rowActions(i)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="space-y-3 md:hidden">
            {data.map((i) => (
              <li key={i.content_id} className="glass rounded-2xl p-4">
                <button onClick={() => setDetail(i)} className="text-left text-sm font-semibold text-ink-100">{i.title}</button>
                <p className="mt-1 text-xs text-ink-400">Tayang {formatDate(i.scheduled_date)} · Deadline {formatDate(i.deadline)}</p>
                <div className="mt-2 flex flex-wrap gap-1.5"><ContentStatusBadge status={i.status} /><PriorityBadge priority={i.priority} />{i.platforms.map((p) => <NeutralBadge key={p}>{p}</NeutralBadge>)}</div>
                {nameOf(i) && <p className="mt-2 text-xs text-ink-400">PJ: {nameOf(i)}</p>}
                {(canWrite || isAdmin) && <div className="mt-2 border-t border-white/5 pt-2">{rowActions(i)}</div>}
              </li>
            ))}
          </ul>
          <Pagination page={c.page} pageSize={PAGE_SIZE} total={count} onPageChange={c.setPage} />
        </>
      )}

      <ContentFormModal open={formOpen} onClose={() => setFormOpen(false)} item={editing} defaults={defaults} onSaved={reload} />
      <ContentDetail item={detail} onClose={() => setDetail(null)} onEdit={openEdit} onDelete={(i) => { setDetail(null); setDeleting(i); }} onChanged={reload} />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Hapus konten?" message={`“${deleting?.title}” akan dihapus permanen dari kalender.`}
        onConfirm={async () => { await contentService.remove(deleting!.content_id); toast.success('Konten dihapus'); reload(); }} />
    </>
  );
}

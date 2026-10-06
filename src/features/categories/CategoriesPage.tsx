import { useState } from 'react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconAction } from '@/components/ui/IconAction';
import { Modal } from '@/components/ui/Modal';

import { useToast } from '@/components/ui/Toast';
import { EntityForm, buildInitial, type FieldDef } from '@/components/forms/EntityForm';
import { useAuth } from '@/hooks/useAuth';
import { useList } from '@/hooks/useList';
import { CATEGORY_SCOPES, CATEGORY_SCOPE_LABEL } from '@/lib/constants';
import { categoryService } from '@/services';
import { categorySchema } from '@/utils/validation';
import type { Category, CategoryScope } from '@/types';

export default function CategoriesPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [scope, setScope] = useState<CategoryScope>('documentation');
  const { data, loading, error, reload } = useList<Category>({ table: 'categories', eq: { scope }, sort: 'name:asc' });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const fields: FieldDef[] = [
    { name: 'name', label: 'Nama kategori', required: true, span: 2 },
    { name: 'scope', label: 'Dipakai untuk', type: 'select', required: true, span: 2, options: CATEGORY_SCOPES.map((s) => ({ value: s, label: CATEGORY_SCOPE_LABEL[s] })) },
  ];
  const addBtn = isAdmin && <Button variant="primary" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" aria-hidden /> Tambah kategori</Button>;

  return (
    <>
      <PageHeader title="Kategori" description={isAdmin ? 'Kelola pilihan kategori pada formulir. Mengubah nama tidak mengubah data lama.' : 'Daftar kategori yang tersedia di formulir.'} actions={addBtn} />
      <div className="mb-4">
        <SegmentedControl<CategoryScope> label="Jenis kategori" value={scope} onChange={setScope} options={CATEGORY_SCOPES.map((s) => ({ value: s, label: CATEGORY_SCOPE_LABEL[s] }))} />
      </div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
      {loading ? <ListSkeleton rows={4} /> : data.length === 0 ? (
        <EmptyState icon={Tags} title="Belum ada kategori" description={`Tambahkan kategori ${CATEGORY_SCOPE_LABEL[scope].toLowerCase()} pertama.`} action={addBtn || undefined} />
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((cat) => (
            <li key={cat.category_id} className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-2">
              <span className="truncate text-sm font-medium text-ink-100">{cat.name}</span>
              {isAdmin && (
                <span className="flex">
                  <IconAction label={`Ubah ${cat.name}`} icon={Pencil} onClick={() => { setEditing(cat); setFormOpen(true); }} />
                  <IconAction label={`Hapus ${cat.name}`} icon={Trash2} danger onClick={() => setDeleting(cat)} />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Ubah kategori' : 'Tambah kategori'}>
        <EntityForm id="category" fields={fields} schema={categorySchema} initial={buildInitial(fields, editing ?? { scope })} submitLabel={editing ? 'Simpan perubahan' : 'Tambah kategori'} onCancel={() => setFormOpen(false)}
          onSubmit={async (v) => {
            if (editing) await categoryService.update(editing.category_id, v);
            else await categoryService.create(v);
            toast.success(editing ? 'Kategori diperbarui' : 'Kategori ditambahkan');
            if (v.scope !== scope) setScope(v.scope as CategoryScope);
            reload();
            setFormOpen(false);
          }} />
      </Modal>
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Hapus kategori?" message={`“${deleting?.name}” akan dihapus dari pilihan formulir. Data lama yang memakai kategori ini tetap utuh.`}
        onConfirm={async () => { await categoryService.remove(deleting!.category_id); toast.success('Kategori dihapus'); reload(); }} />
    </>
  );
}

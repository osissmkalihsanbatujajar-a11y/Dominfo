import { useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { toOptions } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { EntityForm, buildInitial, type FieldDef } from '@/components/forms/EntityForm';
import { useCategoryNames } from '@/hooks/useLookups';
import { FILE_TYPES } from '@/lib/constants';
import { assetService } from '@/services';
import { assetSchema } from '@/utils/validation';
import type { Asset } from '@/types';

interface Props { open: boolean; onClose: () => void; item?: Asset | null; onSaved: () => void }

export function AssetFormModal({ open, onClose, item, onSaved }: Props) {
  const toast = useToast();
  const categories = useCategoryNames('asset');

  const fields = useMemo<FieldDef[]>(() => {
    const cats = item && !categories.includes(item.category) ? [item.category, ...categories] : categories;
    return [
      { name: 'name', label: 'Nama aset', required: true, span: 2, placeholder: 'mis. Logo OSIS' },
      { name: 'category', label: 'Kategori', type: 'select', options: toOptions(cats), required: true },
      { name: 'file_type', label: 'Tipe file', type: 'select', options: toOptions(FILE_TYPES), required: true },
      { name: 'version', label: 'Versi', required: true, placeholder: '1.0' },
      { name: 'file_url', label: 'Link file / folder', type: 'url', required: true, span: 2, placeholder: 'https://drive.google.com/…' },
      { name: 'preview_url', label: 'URL preview gambar', type: 'url', span: 2, hint: 'Opsional. Tautan gambar langsung untuk pratinjau.' },
      { name: 'description', label: 'Deskripsi', type: 'textarea' },
    ];
  }, [categories, item]);

  const initial = useMemo(
    () => buildInitial(fields, item ?? { category: categories[0] ?? 'Other', file_type: 'PNG', version: '1.0' }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fields, item],
  );

  return (
    <Modal open={open} onClose={onClose} size="lg" title={item ? 'Ubah aset' : 'Tambah aset'} description="Simpan link aset desain. File aslinya tetap berada di cloud storage.">
      <EntityForm id="asset" fields={fields} schema={assetSchema} initial={initial} submitLabel={item ? 'Simpan perubahan' : 'Tambah aset'} onCancel={onClose}
        onSubmit={async (v) => {
          if (item) await assetService.update(item.asset_id, v);
          else await assetService.create(v);
          toast.success(item ? 'Aset diperbarui' : 'Aset ditambahkan');
          onSaved();
          onClose();
        }} />
    </Modal>
  );
}

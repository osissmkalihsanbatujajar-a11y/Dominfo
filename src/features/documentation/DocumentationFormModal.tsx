import { useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { toOptions } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { EntityForm, buildInitial, type FieldDef } from '@/components/forms/EntityForm';
import { useCategoryNames } from '@/hooks/useLookups';
import { DOC_STATUSES } from '@/lib/constants';
import { documentationService } from '@/services';
import { documentationSchema } from '@/utils/validation';
import type { DocumentationItem } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  item?: DocumentationItem | null;
  onSaved: () => void;
}

export function DocumentationFormModal({ open, onClose, item, onSaved }: Props) {
  const toast = useToast();
  const categories = useCategoryNames('documentation');

  const fields = useMemo<FieldDef[]>(() => {
    const cats = item && !categories.includes(item.category) ? [item.category, ...categories] : categories;
    return [
      { name: 'event_name', label: 'Nama kegiatan', required: true, span: 2, placeholder: 'mis. Upacara Senin' },
      { name: 'event_date', label: 'Tanggal kegiatan', type: 'date', required: true },
      { name: 'location', label: 'Lokasi', placeholder: 'mis. Lapangan Utama' },
      { name: 'category', label: 'Kategori', type: 'select', options: toOptions(cats), required: true },
      { name: 'status', label: 'Status', type: 'select', options: toOptions(DOC_STATUSES), required: true },
      { name: 'photographer', label: 'Fotografer' },
      { name: 'videographer', label: 'Videografer' },
      { name: 'photo_link', label: 'Link foto (Google Drive)', type: 'url', placeholder: 'https://drive.google.com/…', span: 2 },
      { name: 'video_link', label: 'Link video', type: 'url', placeholder: 'https://drive.google.com/…', span: 2 },
      { name: 'document_link', label: 'Link dokumen', type: 'url', placeholder: 'https://docs.google.com/…', span: 2 },
      { name: 'thumbnail_url', label: 'URL thumbnail', type: 'url', span: 2, hint: 'Opsional. Untuk Drive: https://drive.google.com/thumbnail?id=FILE_ID&sz=w800' },
      { name: 'description', label: 'Deskripsi', type: 'textarea' },
      { name: 'notes', label: 'Catatan', type: 'textarea' },
      { name: 'is_important', label: 'Dokumentasi penting', type: 'checkbox', hint: 'Akan diberi peringatan khusus jika belum di-backup.' },
    ];
  }, [categories, item]);

  const initial = useMemo(
    () => buildInitial(fields, item ?? { status: 'Planned', category: categories[0] ?? 'Other' }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fields, item],
  );

  return (
    <Modal open={open} onClose={onClose} size="lg" title={item ? 'Ubah dokumentasi' : 'Tambah dokumentasi'}
      description={item ? `Status backup saat ini: ${item.backup_status} (diatur otomatis dari halaman Backup).` : 'Catat kegiatan dan simpan link foto/video dari cloud storage.'}>
      <EntityForm
        id="doc" fields={fields} schema={documentationSchema} initial={initial}
        submitLabel={item ? 'Simpan perubahan' : 'Tambah dokumentasi'} onCancel={onClose}
        onSubmit={async (v) => {
          if (item) await documentationService.update(item.documentation_id, v);
          else await documentationService.create(v);
          toast.success(item ? 'Dokumentasi diperbarui' : 'Dokumentasi ditambahkan');
          onSaved();
          onClose();
        }}
      />
    </Modal>
  );
}

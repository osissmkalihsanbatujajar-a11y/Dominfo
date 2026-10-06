import { useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { toOptions } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { EntityForm, buildInitial, type FieldDef } from '@/components/forms/EntityForm';
import { useCategoryNames, useMembers } from '@/hooks/useLookups';
import { CONTENT_STATUSES, CONTENT_TYPES, PLATFORMS, PRIORITIES } from '@/lib/constants';
import { contentService } from '@/services';
import { contentSchema } from '@/utils/validation';
import type { ContentItem } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  item?: ContentItem | null;
  /** Nilai awal untuk konten baru (mis. tanggal dari kalender). */
  defaults?: Record<string, string>;
  onSaved: () => void;
}

export function ContentFormModal({ open, onClose, item, defaults, onSaved }: Props) {
  const toast = useToast();
  const { members } = useMembers();
  const categories = useCategoryNames('content');

  const fields = useMemo<FieldDef[]>(() => {
    const cats = item?.category && !categories.includes(item.category) ? [item.category, ...categories] : categories;
    return [
      { name: 'title', label: 'Judul konten', required: true, span: 2, placeholder: 'mis. Poster Upacara Senin' },
      { name: 'content_type', label: 'Tipe konten', type: 'select', options: toOptions(CONTENT_TYPES), required: true },
      { name: 'platform', label: 'Platform', type: 'select', options: toOptions(PLATFORMS), required: true },
      { name: 'scheduled_date', label: 'Tanggal publikasi', type: 'date', required: true },
      { name: 'deadline', label: 'Deadline pengerjaan', type: 'date', hint: 'Tidak boleh setelah tanggal publikasi.' },
      { name: 'status', label: 'Status', type: 'select', options: toOptions(CONTENT_STATUSES), required: true },
      { name: 'priority', label: 'Prioritas', type: 'select', options: toOptions(PRIORITIES), required: true },
      { name: 'assignee', label: 'Penanggung jawab', type: 'select', emptyLabel: 'Belum ditentukan', options: members.map((m) => ({ value: m.member_id, label: `${m.name} (${m.roles.join(', ')})` })) },
      { name: 'category', label: 'Kategori', type: 'select', emptyLabel: 'Tanpa kategori', options: toOptions(cats) },
      { name: 'description', label: 'Deskripsi', type: 'textarea' },
      { name: 'caption', label: 'Caption', type: 'textarea' },
      { name: 'reference_link', label: 'Link referensi', type: 'url', span: 2, placeholder: 'https://…' },
    ];
  }, [members, categories, item]);

  const initial = useMemo(
    () => buildInitial(fields, item ?? { content_type: 'Poster', platform: 'Instagram', status: 'Idea', priority: 'Medium', ...defaults }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fields, item, defaults],
  );

  return (
    <Modal open={open} onClose={onClose} size="lg" title={item ? 'Ubah konten' : 'Tambah konten'} description="Rencanakan konten, tentukan deadline, dan tunjuk penanggung jawab.">
      <EntityForm
        id="content" fields={fields} schema={contentSchema} initial={initial}
        submitLabel={item ? 'Simpan perubahan' : 'Tambah konten'} onCancel={onClose}
        onSubmit={async (v) => {
          if (item) await contentService.update(item.content_id, v);
          else await contentService.create(v);
          toast.success(item ? 'Konten diperbarui' : 'Konten ditambahkan');
          onSaved();
          onClose();
        }}
      />
    </Modal>
  );
}

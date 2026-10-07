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
  const { members } = useMembers(false);
  const categories = useCategoryNames('content');

  const fields = useMemo<FieldDef[]>(() => {
    const cats = [...categories, ...(item?.categories ?? []).filter((c) => !categories.includes(c))];
    // Anggota nonaktif hanya muncul jika sebelumnya sudah menjadi penanggung jawab konten ini.
    const people = members.filter((m) => m.status === 'Active' || item?.assignees.includes(m.member_id));
    return [
      { name: 'title', label: 'Judul konten', required: true, span: 2, placeholder: 'mis. Poster Upacara Senin' },
      { name: 'content_types', label: 'Tipe konten', type: 'multicheck', options: toOptions(CONTENT_TYPES), required: true, hint: 'Boleh lebih dari satu, mis. Poster + Story.' },
      { name: 'platforms', label: 'Platform', type: 'multicheck', options: toOptions(PLATFORMS), required: true, hint: 'Boleh lebih dari satu.' },
      { name: 'scheduled_date', label: 'Tanggal publikasi', type: 'date', required: true },
      { name: 'deadline', label: 'Deadline pengerjaan', type: 'date', hint: 'Tidak boleh setelah tanggal publikasi.' },
      { name: 'status', label: 'Status', type: 'select', options: toOptions(CONTENT_STATUSES), required: true },
      { name: 'priority', label: 'Prioritas', type: 'select', options: toOptions(PRIORITIES), required: true },
      {
        name: 'assignees', label: 'Penanggung jawab', type: 'multicheck',
        options: people.map((m) => ({ value: m.member_id, label: m.status === 'Active' ? m.name : `${m.name} (nonaktif)` })),
        hint: people.length ? 'Pilih satu atau lebih anggota. Boleh dikosongkan.' : 'Belum ada anggota aktif. Tambahkan dulu di halaman Anggota.',
      },
      { name: 'categories', label: 'Kategori', type: 'multicheck', options: toOptions(cats), hint: 'Opsional. Boleh lebih dari satu.' },
      { name: 'description', label: 'Deskripsi', type: 'textarea' },
      { name: 'caption', label: 'Caption', type: 'textarea' },
      { name: 'reference_link', label: 'Link referensi', type: 'url', span: 2, placeholder: 'https://…' },
    ];
  }, [members, categories, item]);

  const initial = useMemo(
    () => buildInitial(fields, item ?? { content_types: ['Poster'], platforms: ['Instagram'], status: 'Idea', priority: 'Medium', ...defaults }),
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

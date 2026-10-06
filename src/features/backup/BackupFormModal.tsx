import { useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { toOptions } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { EntityForm, buildInitial, type FieldDef } from '@/components/forms/EntityForm';
import { useDocumentOptions } from '@/hooks/useLookups';
import { BACKUP_TYPES, STORAGE_PROVIDERS } from '@/lib/constants';
import { todayYMD } from '@/lib/utils';
import { backupService } from '@/services';
import { backupSchema } from '@/utils/validation';
import type { Backup } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  item?: Backup | null;
  /** Pra-pilih dokumentasi (mis. dari peringatan backup). */
  documentationId?: string;
  onSaved: () => void;
}

export function BackupFormModal({ open, onClose, item, documentationId, onSaved }: Props) {
  const toast = useToast();
  const docs = useDocumentOptions();

  const fields = useMemo<FieldDef[]>(() => [
    { name: 'documentation_id', label: 'Dokumentasi', type: 'select', required: true, span: 2, emptyLabel: 'Pilih dokumentasi…', options: docs },
    { name: 'backup_type', label: 'Tipe backup', type: 'select', options: toOptions(BACKUP_TYPES), required: true },
    { name: 'storage_provider', label: 'Penyimpanan', type: 'select', options: toOptions(STORAGE_PROVIDERS), required: true },
    { name: 'backup_url', label: 'Link backup', type: 'url', required: true, span: 2, placeholder: 'https://…' },
    { name: 'backup_date', label: 'Tanggal backup', type: 'date', required: true },
    { name: 'verified', label: 'Sudah diverifikasi', type: 'checkbox', hint: 'Centang setelah memastikan file bisa dibuka.' },
    { name: 'notes', label: 'Catatan', type: 'textarea' },
  ], [docs]);

  const initial = useMemo(
    () => buildInitial(fields, item ?? { backup_type: 'Primary', storage_provider: 'Google Drive', backup_date: todayYMD(), documentation_id: documentationId }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fields, item, documentationId],
  );

  return (
    <Modal open={open} onClose={onClose} size="lg" title={item ? 'Ubah backup' : 'Tambah backup'} description="Status backup dokumentasi diperbarui otomatis mengikuti jumlah backup.">
      <EntityForm id="backup" fields={fields} schema={backupSchema} initial={initial} submitLabel={item ? 'Simpan perubahan' : 'Tambah backup'} onCancel={onClose}
        onSubmit={async (v) => {
          if (item) await backupService.update(item.backup_id, v);
          else await backupService.create(v);
          toast.success(item ? 'Backup diperbarui' : 'Backup ditambahkan');
          onSaved();
          onClose();
        }} />
    </Modal>
  );
}

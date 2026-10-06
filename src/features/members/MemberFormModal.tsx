import { useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { toOptions } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { EntityForm, buildInitial, type FieldDef } from '@/components/forms/EntityForm';
import { MEMBER_ROLES, MEMBER_STATUSES } from '@/lib/constants';
import { memberService } from '@/services';
import { memberSchema } from '@/utils/validation';
import type { Member } from '@/types';

interface Props { open: boolean; onClose: () => void; item?: Member | null; onSaved: () => void }

export function MemberFormModal({ open, onClose, item, onSaved }: Props) {
  const toast = useToast();
  const fields = useMemo<FieldDef[]>(() => {
    const roles = item && !(MEMBER_ROLES as readonly string[]).includes(item.role) ? [item.role, ...MEMBER_ROLES] : [...MEMBER_ROLES];
    return [
      { name: 'name', label: 'Nama lengkap', required: true, span: 2 },
      { name: 'role', label: 'Role', type: 'select', options: toOptions(roles), required: true },
      { name: 'division', label: 'Divisi', required: true },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'nama@sekolah.sch.id' },
      { name: 'status', label: 'Status', type: 'select', options: toOptions(MEMBER_STATUSES), required: true },
      { name: 'profile_photo', label: 'URL foto profil', type: 'url', span: 2, hint: 'Opsional. Tanpa foto, tampil inisial nama.' },
    ];
  }, [item]);
  const initial = useMemo(() => buildInitial(fields, item ?? { role: 'Dokumentasi', division: 'DOMINFO', status: 'Active' }), [fields, item]);

  return (
    <Modal open={open} onClose={onClose} title={item ? 'Ubah anggota' : 'Tambah anggota'} description="Anggota aktif bisa dipilih sebagai penanggung jawab konten.">
      <EntityForm id="member" fields={fields} schema={memberSchema} initial={initial} submitLabel={item ? 'Simpan perubahan' : 'Tambah anggota'} onCancel={onClose}
        onSubmit={async (v) => {
          if (item) await memberService.update(item.member_id, v);
          else await memberService.create(v);
          toast.success(item ? 'Anggota diperbarui' : 'Anggota ditambahkan');
          onSaved();
          onClose();
        }} />
    </Modal>
  );
}

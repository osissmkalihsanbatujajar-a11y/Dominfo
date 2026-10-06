import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { EntityForm, buildInitial, type FieldDef } from '@/components/forms/EntityForm';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABEL, USER_ROLES } from '@/lib/constants';
import { supabase } from '@/supabase/client';
import { userService } from '@/services';
import { toMessage } from '@/services/errors';
import { profileSchema } from '@/utils/validation';
import type { AppUser, Role } from '@/types';

const fields: FieldDef[] = [{ name: 'full_name', label: 'Nama tampilan', required: true, span: 2 }];

export default function SettingsPage() {
  const { profile, session, isAdmin, refreshProfile, signOut } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<AppUser[] | null>(null);

  const loadUsers = () => supabase.from('users').select('*').order('created_at').then(({ data }) => setUsers((data ?? []) as AppUser[]));
  useEffect(() => { if (isAdmin) loadUsers(); }, [isAdmin]);

  async function changeRole(u: AppUser, role: Role) {
    try {
      await userService.setRole(u.id, role);
      toast.success(`Role ${u.full_name ?? u.email} diubah ke ${ROLE_LABEL[role]}`);
      loadUsers();
    } catch (e) {
      toast.error(toMessage(e));
    }
  }

  if (!profile) return <ListSkeleton rows={3} />;
  return (
    <>
      <PageHeader title="Pengaturan" description="Kelola profil Anda dan hak akses pengguna." />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="glass rounded-2xl p-5" aria-labelledby="profil">
          <h2 id="profil" className="mb-4 text-base font-semibold text-ink-100">Profil</h2>
          <div className="mb-5 flex items-center gap-3">
            <Avatar name={profile.full_name || profile.email} size="lg" />
            <div className="min-w-0"><p className="truncate text-sm text-ink-100">{session?.user.email}</p><Badge className="mt-1 bg-iris-500/15 text-iris-300 ring-iris-400/25">{ROLE_LABEL[profile.role]}</Badge></div>
          </div>
          <EntityForm id="profile" fields={fields} schema={profileSchema} initial={buildInitial(fields, profile as unknown as Record<string, unknown>)} submitLabel="Simpan profil" onCancel={() => undefined}
            onSubmit={async (v) => { await userService.update(profile.id, v); await refreshProfile(); toast.success('Profil diperbarui'); }} />
          <div className="mt-6 border-t border-white/10 pt-4">
            <Button variant="danger" onClick={signOut}><LogOut className="h-4 w-4" aria-hidden /> Keluar</Button>
          </div>
        </section>

        <section className="glass rounded-2xl p-5" aria-labelledby="hak-akses">
          <h2 id="hak-akses" className="text-base font-semibold text-ink-100">Hak akses</h2>
          <dl className="mt-3 space-y-2 text-sm text-ink-300">
            <div><dt className="inline font-medium text-ink-100">Admin:</dt> <dd className="inline">akses penuh, termasuk menghapus data dan mengelola anggota, kategori, serta role.</dd></div>
            <div><dt className="inline font-medium text-ink-100">Editor:</dt> <dd className="inline">menambah dan mengubah konten, dokumentasi, aset, dan backup.</dd></div>
            <div><dt className="inline font-medium text-ink-100">Viewer:</dt> <dd className="inline">hanya melihat data.</dd></div>
          </dl>

          {isAdmin && (
            <div className="mt-5">
              <h3 className="mb-2 text-sm font-semibold text-ink-100">Pengguna terdaftar</h3>
              {!users ? <ListSkeleton rows={3} /> : (
                <ul className="space-y-2">
                  {users.map((u) => (
                    <li key={u.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5 ring-1 ring-inset ring-white/10">
                      <Avatar name={u.full_name || u.email} size="sm" />
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm text-ink-100">{u.full_name || '—'}</span><span className="block truncate text-xs text-ink-400">{u.email}</span></span>
                      <Select className="w-28" aria-label={`Role ${u.full_name ?? u.email}`} value={u.role} disabled={u.id === profile.id}
                        onChange={(e) => changeRole(u, e.target.value as Role)} options={USER_ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))} />
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-xs text-ink-400">Role Anda sendiri tidak dapat diubah dari sini.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

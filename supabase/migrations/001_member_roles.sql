-- =====================================================================
-- Migrasi 001: anggota bisa punya BANYAK peran (members.role -> members.roles[])
-- Jalankan HANYA jika Anda sudah menjalankan schema.sql versi lama.
-- Jika baru memulai, cukup pakai schema.sql terbaru (tidak perlu file ini).
-- Aman dijalankan ulang.
-- =====================================================================

alter table public.members add column if not exists roles text[];

do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'members' and column_name = 'role') then
    execute 'update public.members set roles = array[role] where roles is null';
    alter table public.members drop column role;
  end if;
end $$;

update public.members set roles = array['Anggota'] where roles is null or cardinality(roles) = 0;

alter table public.members alter column roles set not null;
alter table public.members drop constraint if exists members_roles_not_empty;
alter table public.members add constraint members_roles_not_empty check (cardinality(roles) > 0);
create index if not exists idx_members_roles on public.members using gin (roles);

-- Contoh: beri Aidil beberapa peran sekaligus (ubah/hapus sesuai kebutuhan)
update public.members set roles = array['Ketua DOMINFO','Editor','Fotografer'] where name = 'Aidil Mulyana';

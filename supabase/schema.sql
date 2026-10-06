-- =====================================================================
-- DOMINFO CMS — Skema Supabase (PostgreSQL)
-- Jalankan SELURUH file ini di Supabase Dashboard > SQL Editor.
-- Aman dijalankan ulang (idempotent) untuk tabel/fungsi/trigger/policy.
-- =====================================================================

create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------
-- 1. TABEL
-- ---------------------------------------------------------------------

-- Profil pengguna aplikasi (terhubung ke auth.users). Menyimpan role akses.
create table if not exists public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Anggota divisi DOMINFO (bukan akun login; dipakai sebagai assignee).
create table if not exists public.members (
  member_id      uuid primary key default gen_random_uuid(),
  name           text not null,
  role           text not null,
  division       text not null default 'DOMINFO',
  profile_photo  text,
  email          text,
  status         text not null default 'Active' check (status in ('Active', 'Inactive')),
  created_by     uuid default auth.uid() references public.users (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.categories (
  category_id  uuid primary key default gen_random_uuid(),
  name         text not null,
  scope        text not null check (scope in ('content', 'documentation', 'asset')),
  created_by   uuid default auth.uid() references public.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (scope, name)
);

create table if not exists public.content_calendar (
  content_id      uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  content_type    text not null default 'Poster'
    check (content_type in ('Poster','Story','Feed','Reels','Video','Announcement','Recap','Documentation','Educational','Other')),
  category        text,
  scheduled_date  date not null,
  deadline        date,
  platform        text not null default 'Instagram'
    check (platform in ('Instagram','WhatsApp','TikTok','Website','Internal','Other')),
  status          text not null default 'Idea'
    check (status in ('Idea','Planned','In Progress','Review','Scheduled','Published','Cancelled')),
  priority        text not null default 'Medium' check (priority in ('Low','Medium','High','Urgent')),
  assignee        uuid references public.members (member_id) on delete set null,
  caption         text,
  reference_link  text,
  created_by      uuid default auth.uid() references public.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.documentation (
  documentation_id  uuid primary key default gen_random_uuid(),
  event_name        text not null,
  event_date        date not null,
  location          text,
  category          text not null default 'Other',
  description       text,
  photographer      text,
  videographer      text,
  photo_link        text,
  video_link        text,
  document_link     text,
  thumbnail_url     text,
  status            text not null default 'Planned' check (status in ('Planned','On Going','Completed','Archived')),
  backup_status     text not null default 'Not Backed Up'
    check (backup_status in ('Not Backed Up','Backed Up','Multiple Backup')),
  is_important      boolean not null default false,
  notes             text,
  created_by        uuid default auth.uid() references public.users (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.assets (
  asset_id     uuid primary key default gen_random_uuid(),
  name         text not null,
  category     text not null default 'Other',
  description  text,
  file_url     text not null,
  preview_url  text,
  file_type    text not null default 'Other',
  version      text not null default '1.0',
  uploaded_by  uuid default auth.uid() references public.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.backups (
  backup_id         uuid primary key default gen_random_uuid(),
  documentation_id  uuid not null references public.documentation (documentation_id) on delete cascade,
  backup_type       text not null default 'Primary' check (backup_type in ('Primary','Secondary','Archive')),
  storage_provider  text not null default 'Google Drive' check (storage_provider in ('Google Drive','OneDrive','Other')),
  backup_url        text not null,
  backup_date       date not null default current_date,
  verified          boolean not null default false,
  notes             text,
  created_by        uuid default auth.uid() references public.users (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.activity_logs (
  log_id       uuid primary key default gen_random_uuid(),
  user_id      uuid references public.users (id) on delete set null,
  user_name    text not null default 'Sistem',
  action       text not null check (action in ('create', 'update', 'delete')),
  target_type  text not null,
  target_id    text,
  target_name  text,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. INDEKS (kolom yang sering dicari / difilter / diurutkan)
-- ---------------------------------------------------------------------
create index if not exists idx_content_scheduled   on public.content_calendar (scheduled_date);
create index if not exists idx_content_deadline    on public.content_calendar (deadline);
create index if not exists idx_content_status      on public.content_calendar (status);
create index if not exists idx_content_platform    on public.content_calendar (platform);
create index if not exists idx_content_assignee    on public.content_calendar (assignee);
create index if not exists idx_content_title_trgm  on public.content_calendar using gin (title extensions.gin_trgm_ops);

create index if not exists idx_doc_event_date      on public.documentation (event_date desc);
create index if not exists idx_doc_category        on public.documentation (category);
create index if not exists idx_doc_status          on public.documentation (status);
create index if not exists idx_doc_backup_status   on public.documentation (backup_status);
create index if not exists idx_doc_name_trgm       on public.documentation using gin (event_name extensions.gin_trgm_ops);

create index if not exists idx_assets_category     on public.assets (category);
create index if not exists idx_assets_file_type    on public.assets (file_type);
create index if not exists idx_assets_name_trgm    on public.assets using gin (name extensions.gin_trgm_ops);

create index if not exists idx_backups_doc         on public.backups (documentation_id);
create index if not exists idx_backups_date        on public.backups (backup_date desc);

create index if not exists idx_members_name_trgm   on public.members using gin (name extensions.gin_trgm_ops);
create index if not exists idx_logs_created        on public.activity_logs (created_at desc);

-- ---------------------------------------------------------------------
-- 3. FUNGSI & TRIGGER
-- ---------------------------------------------------------------------

-- updated_at otomatis
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['users','members','categories','content_calendar','documentation','assets','backups']
  loop
    execute format('drop trigger if exists trg_%1$s_updated_at on public.%1$s', t);
    execute format('create trigger trg_%1$s_updated_at before update on public.%1$s for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- Helper role (dipakai oleh RLS)
create or replace function public.app_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.app_role() = 'admin', false)
$$;

create or replace function public.can_write() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.app_role() in ('admin', 'editor'), false)
$$;

-- Buat profil otomatis saat user mendaftar. User PERTAMA otomatis menjadi admin.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare first_user boolean;
begin
  select not exists (select 1 from public.users) into first_user;
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    case when first_user then 'admin' else 'viewer' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Sinkronkan documentation.backup_status dari jumlah baris di tabel backups
create or replace function public.refresh_backup_status(doc uuid) returns void
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  select count(*) into n from public.backups where documentation_id = doc;
  update public.documentation
     set backup_status = case when n = 0 then 'Not Backed Up' when n = 1 then 'Backed Up' else 'Multiple Backup' end
   where documentation_id = doc;
end;
$$;

create or replace function public.sync_backup_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then perform public.refresh_backup_status(new.documentation_id); end if;
  if tg_op = 'DELETE' then perform public.refresh_backup_status(old.documentation_id); end if;
  if tg_op = 'UPDATE' and old.documentation_id is distinct from new.documentation_id then
    perform public.refresh_backup_status(old.documentation_id);
  end if;
  return null;
end;
$$;

drop trigger if exists trg_backups_sync_status on public.backups;
create trigger trg_backups_sync_status
  after insert or update or delete on public.backups
  for each row execute function public.sync_backup_status();

-- Activity log otomatis (insert / update / delete)
create or replace function public.log_activity() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  r jsonb; o jsonb;
  act text; ttype text; tname text; tid text; uname text;
  uid uuid := auth.uid();
begin
  if tg_op = 'DELETE' then r := to_jsonb(old); else r := to_jsonb(new); end if;

  act := case tg_op when 'INSERT' then 'create' when 'UPDATE' then 'update' else 'delete' end;
  ttype := case tg_table_name
    when 'content_calendar' then 'content' when 'documentation' then 'documentation'
    when 'assets' then 'asset' when 'backups' then 'backup'
    when 'members' then 'member' when 'categories' then 'category' else tg_table_name end;
  tid := coalesce(r ->> 'content_id', r ->> 'documentation_id', r ->> 'asset_id',
                  r ->> 'backup_id', r ->> 'member_id', r ->> 'category_id');
  tname := coalesce(r ->> 'title', r ->> 'event_name', r ->> 'name', r ->> 'backup_url');

  if tg_table_name = 'backups' then
    select event_name into tname from public.documentation where documentation_id = (r ->> 'documentation_id')::uuid;
    if tname is null then
      if tg_op = 'DELETE' then return null; end if; -- ikut terhapus bersama dokumentasi
      tname := r ->> 'backup_url';
    end if;
  end if;

  if tg_op = 'UPDATE' then
    o := to_jsonb(old);
    -- abaikan perubahan otomatis (updated_at / backup_status hasil sinkronisasi)
    if (r - 'updated_at' - 'backup_status') = (o - 'updated_at' - 'backup_status') then return null; end if;
  end if;

  select full_name into uname from public.users where id = uid;
  insert into public.activity_logs (user_id, user_name, action, target_type, target_id, target_name)
  values (uid, coalesce(uname, 'Sistem'), act, ttype, tid, tname);
  return null;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['content_calendar','documentation','assets','backups','members','categories']
  loop
    execute format('drop trigger if exists trg_%1$s_log on public.%1$s', t);
    execute format('create trigger trg_%1$s_log after insert or update or delete on public.%1$s for each row execute function public.log_activity()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
--    Admin  : akses penuh
--    Editor : tambah/ubah dokumentasi, konten, aset, backup (tidak bisa hapus)
--    Viewer : hanya baca
-- ---------------------------------------------------------------------
alter table public.users            enable row level security;
alter table public.members          enable row level security;
alter table public.categories       enable row level security;
alter table public.content_calendar enable row level security;
alter table public.documentation    enable row level security;
alter table public.assets           enable row level security;
alter table public.backups          enable row level security;
alter table public.activity_logs    enable row level security;

-- Tabel kerja: baca = semua user login, tulis = admin/editor, hapus = admin
do $$
declare t text;
begin
  foreach t in array array['content_calendar','documentation','assets','backups']
  loop
    execute format('drop policy if exists "%1$s_select" on public.%1$s', t);
    execute format('drop policy if exists "%1$s_insert" on public.%1$s', t);
    execute format('drop policy if exists "%1$s_update" on public.%1$s', t);
    execute format('drop policy if exists "%1$s_delete" on public.%1$s', t);
    execute format('create policy "%1$s_select" on public.%1$s for select to authenticated using (true)', t);
    execute format('create policy "%1$s_insert" on public.%1$s for insert to authenticated with check (public.can_write())', t);
    execute format('create policy "%1$s_update" on public.%1$s for update to authenticated using (public.can_write()) with check (public.can_write())', t);
    execute format('create policy "%1$s_delete" on public.%1$s for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;

-- Anggota & kategori: baca semua, kelola hanya admin
do $$
declare t text;
begin
  foreach t in array array['members','categories']
  loop
    execute format('drop policy if exists "%1$s_select" on public.%1$s', t);
    execute format('drop policy if exists "%1$s_admin_all" on public.%1$s', t);
    execute format('create policy "%1$s_select" on public.%1$s for select to authenticated using (true)', t);
    execute format('create policy "%1$s_admin_all" on public.%1$s for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Profil pengguna
drop policy if exists "users_select" on public.users;
drop policy if exists "users_update_self" on public.users;
drop policy if exists "users_admin_update" on public.users;
create policy "users_select" on public.users for select to authenticated using (true);
-- user boleh mengubah profilnya sendiri, tetapi TIDAK boleh mengubah role-nya
create policy "users_update_self" on public.users for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid() and role = public.app_role());
create policy "users_admin_update" on public.users for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Activity log: hanya bisa dibaca. Penulisan dilakukan trigger (security definer).
drop policy if exists "logs_select" on public.activity_logs;
create policy "logs_select" on public.activity_logs for select to authenticated using (true);

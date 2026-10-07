-- =====================================================================
-- Migrasi 002: konten bisa punya BANYAK tipe, kategori, platform, penanggung jawab
-- Jalankan HANYA jika Anda sudah menjalankan schema.sql versi lama.
-- Jika baru memulai, cukup pakai schema.sql terbaru (tidak perlu file ini).
-- Aman dijalankan ulang.
-- =====================================================================

alter table public.content_calendar
  add column if not exists content_types text[],
  add column if not exists categories    text[],
  add column if not exists platforms     text[],
  add column if not exists assignees     uuid[];

do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'content_calendar' and column_name = 'content_type') then
    execute 'update public.content_calendar set
               content_types = array[content_type],
               platforms     = array[platform],
               categories    = case when category is null or category = '''' then ''{}''::text[] else array[category] end,
               assignees     = case when assignee is null then ''{}''::uuid[] else array[assignee] end';
    drop index if exists public.idx_content_platform;
    drop index if exists public.idx_content_assignee;
    alter table public.content_calendar
      drop column content_type, drop column platform, drop column category, drop column assignee;
  end if;
end $$;

update public.content_calendar set content_types = array['Poster']    where content_types is null or cardinality(content_types) = 0;
update public.content_calendar set platforms     = array['Instagram'] where platforms is null or cardinality(platforms) = 0;
update public.content_calendar set categories    = '{}' where categories is null;
update public.content_calendar set assignees     = '{}' where assignees is null;

alter table public.content_calendar
  alter column content_types set not null, alter column content_types set default array['Poster'],
  alter column platforms     set not null, alter column platforms     set default array['Instagram'],
  alter column categories    set not null, alter column categories    set default '{}',
  alter column assignees     set not null, alter column assignees     set default '{}';

alter table public.content_calendar drop constraint if exists content_types_valid;
alter table public.content_calendar drop constraint if exists platforms_valid;
alter table public.content_calendar
  add constraint content_types_valid check (cardinality(content_types) > 0 and content_types <@ array['Poster','Story','Feed','Reels','Video','Announcement','Recap','Documentation','Educational','Other']),
  add constraint platforms_valid     check (cardinality(platforms) > 0 and platforms <@ array['Instagram','WhatsApp','TikTok','Website','Internal','Other']);

create index if not exists idx_content_platforms on public.content_calendar using gin (platforms);
create index if not exists idx_content_assignees on public.content_calendar using gin (assignees);
create index if not exists idx_content_types     on public.content_calendar using gin (content_types);

create or replace function public.remove_member_from_content() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.content_calendar set assignees = array_remove(assignees, old.member_id)
   where old.member_id = any (assignees);
  return old;
end;
$$;
drop trigger if exists trg_members_cleanup on public.members;
create trigger trg_members_cleanup before delete on public.members
  for each row execute function public.remove_member_from_content();

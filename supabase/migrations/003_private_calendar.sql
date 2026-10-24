-- =====================================================================
-- Migrasi 003: Kalender OSIS (content_calendar) bersifat PRIVAT.
-- Hanya role 'admin' dan 'editor' yang boleh MEMBACA kalender. Viewer tidak
-- dapat melihat satu baris pun, walau memanggil API Supabase langsung.
--
-- Cara kerja: memakai kebijakan RESTRICTIVE. Kebijakan ini di-AND-kan dengan
-- semua kebijakan lama, jadi aturan tulis (insert/update/delete) yang sudah
-- ada tidak berubah. Aman dijalankan ulang.
--
-- Prasyarat: RLS sudah aktif di tabel terkait (lihat kueri verifikasi di bawah).
-- =====================================================================

-- 1) Fungsi bantu: apakah pengguna login adalah admin/editor?
--    SECURITY DEFINER agar tidak terkena RLS tabel users saat dievaluasi.
create or replace function public.can_view_calendar()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role in ('admin', 'editor')
  );
$$;

-- 2) Kalender: viewer tidak bisa SELECT.
drop policy if exists "calendar_private_select" on public.content_calendar;
create policy "calendar_private_select" on public.content_calendar
  as restrictive
  for select
  using (public.can_view_calendar());

-- 3) Log aktivitas konten memuat judul agenda -> sembunyikan dari viewer.
drop policy if exists "activity_hide_content_from_viewers" on public.activity_logs;
create policy "activity_hide_content_from_viewers" on public.activity_logs
  as restrictive
  for select
  using (coalesce(target_type, '') <> 'content' or public.can_view_calendar());

-- =====================================================================
-- VERIFIKASI (jalankan manual di SQL Editor)
-- 1. RLS harus true untuk kedua tabel:
--      select relname, relrowsecurity from pg_class
--      where relname in ('content_calendar', 'activity_logs');
-- 2. Daftar kebijakan:
--      select tablename, policyname, permissive, cmd from pg_policies
--      where tablename in ('content_calendar', 'activity_logs');
-- 3. Uji sebagai viewer: login sebagai akun viewer di aplikasi lalu
--    jalankan di console browser -> hasilnya harus array kosong:
--      (await supabase.from('content_calendar').select('*')).data
-- =====================================================================

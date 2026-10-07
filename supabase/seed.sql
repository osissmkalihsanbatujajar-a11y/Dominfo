-- =====================================================================
-- DOMINFO CMS — Data contoh. Jalankan SETELAH schema.sql, cukup SEKALI.
-- Semua link adalah placeholder aman (CONTOH) — ganti dengan link asli.
-- =====================================================================

-- Kategori
insert into public.categories (name, scope) values
  ('Upacara','documentation'),('MPLS','documentation'),('Rapat','documentation'),('Lomba','documentation'),
  ('Event Sekolah','documentation'),('OSIS','documentation'),('Kegiatan Sosial','documentation'),
  ('Ekstrakurikuler','documentation'),('Other','documentation'),
  ('Akademik','content'),('Kegiatan','content'),('Pengumuman','content'),('Edukasi','content'),('Other','content'),
  ('Logo','asset'),('Font','asset'),('Template','asset'),('Graphic','asset'),('Photo','asset'),
  ('Video','asset'),('Document','asset'),('Other','asset')
on conflict (scope, name) do nothing;

-- Anggota (hanya divisi DOMINFO)
insert into public.members (name, roles, division, status) values
  ('Aidil Mulyana',          array['Ketua DOMINFO','Editor','Fotografer'], 'DOMINFO', 'Active'),
  ('Zahra Assyifa',          array['Wakil'],                               'DOMINFO', 'Active'),
  ('Syakhira Putri Hertanto',array['Anggota'],                             'DOMINFO', 'Active'),
  ('Ririn Riyanti',          array['Anggota'],                             'DOMINFO', 'Active');

-- Kalender konten (tanggal relatif terhadap hari ini supaya dashboard selalu "hidup")
insert into public.content_calendar
  (title, description, content_types, categories, scheduled_date, deadline, platforms, status, priority, assignees, caption, reference_link)
values
  ('Poster Upacara Senin', 'Poster ajakan tertib upacara untuk satu minggu ke depan.', array['Poster','Story'], array['Kegiatan'], current_date, current_date - 1, array['Instagram','WhatsApp'], 'Review', 'High', array[(select member_id from public.members where name = 'Zahra Assyifa'), (select member_id from public.members where name = 'Aidil Mulyana')], 'Senin pagi, kita mulai minggu dengan upacara yang tertib dan semangat!', 'https://contoh.example.com/referensi-poster'),
  ('Recap MPLS', 'Video rekap hari pertama MPLS dengan musik latar.', array['Recap','Video'], array['Kegiatan'], current_date + 2, current_date + 1, array['Instagram','TikTok'], 'In Progress', 'High', array[(select member_id from public.members where name = 'Ririn Riyanti'), (select member_id from public.members where name = 'Aidil Mulyana')], 'Hari pertama yang penuh cerita. Selamat datang siswa baru!', null),
  ('Pengumuman Lomba Kebersihan', 'Informasi teknis lomba kebersihan antar kelas.', array['Announcement'], array['Pengumuman'], current_date + 3, current_date + 2, array['WhatsApp','Instagram'], 'Planned', 'Medium', array[(select member_id from public.members where name = 'Aidil Mulyana')], 'Lomba Kebersihan Kelas dibuka! Cek ketentuannya di sini.', null),
  ('Dokumentasi Rapat OSIS', 'Foto rapat koordinasi bulanan OSIS.', array['Documentation'], array['Kegiatan'], current_date + 5, current_date + 4, array['Internal'], 'Planned', 'Low', array[(select member_id from public.members where name = 'Syakhira Putri Hertanto')], null, null),
  ('Story Hitung Mundur Lomba', 'Rangkaian 3 story hitung mundur menuju lomba.', array['Story'], array['Kegiatan'], current_date + 6, current_date + 5, array['Instagram'], 'Idea', 'Medium', array[(select member_id from public.members where name = 'Zahra Assyifa')], null, null),
  ('Tips Belajar Efektif', 'Konten edukasi singkat menjelang ujian.', array['Educational','Reels'], array['Edukasi'], current_date + 9, current_date + 7, array['TikTok','Instagram'], 'Idea', 'Low', array[(select member_id from public.members where name = 'Ririn Riyanti')], null, null),
  ('Reels Behind The Scene Upacara', 'Reels pendek dari sisi petugas upacara.', array['Reels'], array['Kegiatan'], current_date - 2, current_date - 4, array['Instagram'], 'Published', 'Medium', array[(select member_id from public.members where name = 'Ririn Riyanti')], null, null),
  ('Feed Profil Pengurus OSIS', 'Seri feed perkenalan pengurus.', array['Feed'], array['Pengumuman'], current_date + 12, current_date + 10, array['Instagram'], 'Scheduled', 'Medium', array[(select member_id from public.members where name = 'Zahra Assyifa')], null, null),
  ('Pengumuman Pergantian Jadwal Piket', 'Info jadwal piket baru.', array['Announcement'], array['Pengumuman'], current_date - 1, current_date - 3, array['WhatsApp'], 'In Progress', 'Urgent', array[(select member_id from public.members where name = 'Aidil Mulyana')], null, null),
  ('Video Aftermovie Pensi', 'Aftermovie 2 menit untuk pentas seni.', array['Video'], array['Kegiatan'], current_date + 18, current_date + 14, array['Instagram'], 'Planned', 'High', array[(select member_id from public.members where name = 'Ririn Riyanti'), (select member_id from public.members where name = 'Zahra Assyifa')], null, null);

-- Dokumentasi
insert into public.documentation
  (event_name, event_date, location, category, description, photographer, videographer,
   photo_link, video_link, document_link, thumbnail_url, status, is_important, notes)
values
  ('Upacara Senin', current_date - 7, 'Lapangan Utama', 'Upacara', 'Dokumentasi upacara bendera rutin hari Senin.',
    'Syakhira Putri Hertanto', 'Ririn Riyanti',
    'https://drive.google.com/drive/folders/CONTOH-FOTO-UPACARA', 'https://drive.google.com/drive/folders/CONTOH-VIDEO-UPACARA', null,
    'https://placehold.co/800x500/1e202b/8f90f8?text=Upacara+Senin', 'Completed', false, 'Pilih 20 foto terbaik untuk arsip bulanan.'),
  ('MPLS 2026', current_date - 20, 'Aula Sekolah', 'MPLS', 'Masa Pengenalan Lingkungan Sekolah untuk siswa baru, 3 hari penuh.',
    'Syakhira Putri Hertanto', 'Ririn Riyanti',
    'https://drive.google.com/drive/folders/CONTOH-FOTO-MPLS', 'https://drive.google.com/drive/folders/CONTOH-VIDEO-MPLS', 'https://docs.google.com/document/d/CONTOH-RUNDOWN-MPLS',
    'https://placehold.co/800x500/1e202b/8f90f8?text=MPLS+2026', 'Completed', true, 'Dokumentasi penting. Wajib punya minimal 2 backup.'),
  ('Rapat OSIS', current_date - 3, 'Ruang OSIS', 'Rapat', 'Rapat koordinasi program kerja bulanan.',
    'Syakhira Putri Hertanto', null,
    'https://drive.google.com/drive/folders/CONTOH-FOTO-RAPAT', null, 'https://docs.google.com/document/d/CONTOH-NOTULEN-RAPAT',
    null, 'Completed', false, null),
  ('Lomba Kebersihan Kelas', current_date + 8, 'Seluruh Kelas', 'Lomba', 'Penilaian kebersihan kelas oleh juri OSIS.',
    'Syakhira Putri Hertanto', 'Ririn Riyanti', null, null, null,
    'https://placehold.co/800x500/1e202b/8f90f8?text=Lomba+Kebersihan', 'Planned', false, 'Koordinasi jadwal dengan wali kelas.'),
  ('Bakti Sosial Ramadhan', current_date - 45, 'Panti Asuhan Setempat', 'Kegiatan Sosial', 'Penyaluran donasi siswa ke panti asuhan.',
    'Zahra Assyifa', 'Ririn Riyanti',
    'https://drive.google.com/drive/folders/CONTOH-FOTO-BAKSOS', null, null,
    null, 'Archived', true, 'Dokumentasi penting untuk laporan pertanggungjawaban.'),
  ('Latihan Ekstrakurikuler Basket', current_date - 1, 'GOR Sekolah', 'Ekstrakurikuler', 'Dokumentasi latihan rutin tim basket.',
    'Syakhira Putri Hertanto', null, null, null, null, null, 'On Going', false, null);

-- Aset
insert into public.assets (name, category, description, file_url, preview_url, file_type, version) values
  ('Logo OSIS', 'Logo', 'Logo resmi OSIS — versi berwarna dan monokrom.', 'https://drive.google.com/drive/folders/CONTOH-LOGO-OSIS',
    'https://placehold.co/600x600/1e202b/8f90f8?text=Logo+OSIS', 'PNG', '2.0'),
  ('Logo Sekolah', 'Logo', 'Logo sekolah resolusi tinggi dengan latar transparan.', 'https://drive.google.com/drive/folders/CONTOH-LOGO-SEKOLAH',
    'https://placehold.co/600x600/1e202b/b4b6fb?text=Logo+Sekolah', 'SVG', '1.3'),
  ('Template Story OSIS', 'Template', 'Template story 1080x1920 untuk Instagram.', 'https://www.canva.com/design/CONTOH-TEMPLATE-STORY',
    'https://placehold.co/600x900/1e202b/8f90f8?text=Story', 'Canva', '1.1'),
  ('Template Poster Event', 'Template', 'Template poster 4:5 untuk pengumuman event.', 'https://www.canva.com/design/CONTOH-TEMPLATE-POSTER',
    'https://placehold.co/600x750/1e202b/8f90f8?text=Poster', 'Canva', '1.4'),
  ('Font Brand DOMINFO', 'Font', 'Paket font resmi untuk judul dan isi konten.', 'https://drive.google.com/drive/folders/CONTOH-FONT-BRAND',
    null, 'ZIP', '1.0'),
  ('Template Pengumuman', 'Template', 'Template pengumuman resmi sekolah.', 'https://www.canva.com/design/CONTOH-TEMPLATE-PENGUMUMAN',
    null, 'Canva', '1.0'),
  ('Brand Guideline DOMINFO', 'Document', 'Panduan warna, tipografi, dan tata letak konten.', 'https://drive.google.com/file/d/CONTOH-BRAND-GUIDELINE/view',
    null, 'PDF', '1.2'),
  ('Paket Ikon Kegiatan', 'Graphic', 'Kumpulan ikon vektor untuk infografis.', 'https://drive.google.com/drive/folders/CONTOH-IKON',
    null, 'SVG', '1.0');

-- Backup (trigger otomatis memperbarui documentation.backup_status)
insert into public.backups (documentation_id, backup_type, storage_provider, backup_url, backup_date, verified, notes) values
  ((select documentation_id from public.documentation where event_name = 'Upacara Senin'),
    'Primary', 'Google Drive', 'https://drive.google.com/drive/folders/CONTOH-BACKUP-UPACARA', current_date - 6, true, 'Backup mingguan.'),
  ((select documentation_id from public.documentation where event_name = 'MPLS 2026'),
    'Primary', 'Google Drive', 'https://drive.google.com/drive/folders/CONTOH-BACKUP-MPLS-1', current_date - 18, true, null),
  ((select documentation_id from public.documentation where event_name = 'MPLS 2026'),
    'Secondary', 'OneDrive', 'https://onedrive.live.com/CONTOH-BACKUP-MPLS-2', current_date - 17, false, 'Belum diverifikasi.'),
  ((select documentation_id from public.documentation where event_name = 'Bakti Sosial Ramadhan'),
    'Archive', 'Google Drive', 'https://drive.google.com/drive/folders/CONTOH-ARSIP-BAKSOS', current_date - 40, true, 'Arsip akhir periode.');
-- "Rapat OSIS" & "Latihan Basket" sengaja belum di-backup agar peringatan backup terlihat.

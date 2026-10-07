# DOMINFO Content Management System

Dashboard internal divisi Dokumentasi & Informasi (DOMINFO) OSIS: kalender konten, database dokumentasi, bank aset, manajemen backup, anggota, pencarian global, pengingat, dan activity log.

**Stack:** React 18 + TypeScript, Vite, Tailwind CSS, Lucide, Supabase (Auth + PostgreSQL + RLS). File media **tidak** disimpan di database — hanya link (Google Drive/OneDrive) dan metadata.

## Struktur project

```
dominfo-cms/
├── supabase/
│   ├── schema.sql          # tabel, indeks, trigger, RLS
│   ├── seed.sql            # data contoh
│   └── migrations/         # migrasi untuk database yang sudah terlanjur dibuat
├── public/                 # favicon, _redirects (Netlify)
├── src/
│   ├── components/
│   │   ├── ui/             # Button, Input, Modal, Toast, Badge, Skeleton, EmptyState, dll
│   │   └── forms/          # EntityForm (form generik + validasi zod)
│   ├── layouts/            # AppLayout, Sidebar (desktop) / drawer + bottom-nav (mobile), Topbar
│   ├── pages/              # entry route (re-export dari features)
│   ├── features/
│   │   ├── dashboard/      # statistik, widget, aksi cepat, mini kalender
│   │   ├── content/        # kalender bulan/minggu/daftar, detail, form
│   │   ├── documentation/  # tabel + galeri, detail, form
│   │   ├── assets/         # grid/daftar, form
│   │   ├── backup/         # statistik, peringatan, CRUD backup
│   │   ├── members/        # manajemen anggota
│   │   ├── categories/     # kelola kategori
│   │   ├── settings/       # profil + role pengguna (admin)
│   │   ├── search/         # pencarian global (Ctrl/⌘ + K)
│   │   └── reminders/      # logika & tampilan pengingat
│   ├── hooks/              # useAuth, useList, useListControls, useLookups, ...
│   ├── services/           # akses database (CRUD generik per tabel)
│   ├── supabase/           # client Supabase
│   ├── types/              # tipe TypeScript
│   ├── utils/              # skema validasi (zod)
│   └── lib/                # konstanta, helper tanggal, util
├── .env.example
└── vercel.json             # SPA rewrite untuk Vercel
```

## Menjalankan secara lokal

Butuh Node.js 18+.

```bash
npm install
cp .env.example .env     # lalu isi kredensial Supabase (langkah di bawah)
npm run dev              # http://localhost:5173
```

Perintah lain: `npm run build` (build produksi), `npm run preview`, `npm run typecheck`.

## Menghubungkan Supabase

1. Buat proyek gratis di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, tempel seluruh isi `supabase/schema.sql`, klik **Run**.
3. (Opsional, disarankan) jalankan `supabase/seed.sql` **sekali** untuk data contoh. Semua link di dalamnya hanya placeholder.
4. Buka **Project Settings > API**, salin **Project URL** dan **anon public key** ke file `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
5. Jalankan `npm run dev`, buka aplikasi, klik **Daftar**. **Akun pertama otomatis menjadi Admin**; akun berikutnya berperan Viewer.
6. Admin mengubah role pengguna lain di **Pengaturan > Hak akses**.
7. Jika email konfirmasi mengganggu saat uji coba: **Authentication > Providers > Email > matikan "Confirm email"**. Untuk produksi, biarkan aktif.
8. Setelah deploy: **Authentication > URL Configuration**, isi *Site URL* dengan alamat website Anda.

### Peran anggota (multi-pilihan)
Satu anggota bisa punya beberapa peran sekaligus (mis. Ketua DOMINFO + Editor + Fotografer). Atur dari **Anggota > Ubah**. Jika database Anda dibuat dengan `schema.sql` versi lama (kolom `role` tunggal), jalankan `supabase/migrations/001_member_roles.sql` sekali di SQL Editor.

### Konten multi-pilihan
Tipe konten, platform, kategori, dan penanggung jawab pada konten bisa dipilih lebih dari satu. Jika database Anda dibuat dengan `schema.sql` versi lama, jalankan `supabase/migrations/002_content_multi.sql` sekali (setelah `001` bila belum).

### Hak akses (ditegakkan oleh RLS di database)

| Role | Akses |
|------|-------|
| Admin | Penuh: baca, tambah, ubah, hapus; kelola anggota, kategori, role |
| Editor | Baca; tambah & ubah konten, dokumentasi, aset, backup |
| Viewer | Hanya baca |

Tombol di UI disembunyikan sesuai role, tetapi keamanan sebenarnya ada di policy RLS — jadi tetap aman walau API dipanggil langsung.

### Perilaku otomatis di database
- `updated_at` terisi otomatis.
- **Status backup dokumentasi** dihitung otomatis dari jumlah baris di tabel `backups` (0 = Not Backed Up, 1 = Backed Up, 2+ = Multiple Backup).
- **Activity log** dicatat trigger untuk tambah/ubah/hapus pada konten, dokumentasi, aset, backup, anggota, dan kategori — tidak bisa dipalsukan dari client.

## Tips link Google Drive
- Atur berbagi folder/file ke "Anyone with the link" (atau batasi ke akun sekolah) agar anggota bisa membuka.
- **Thumbnail:** `https://drive.google.com/thumbnail?id=FILE_ID&sz=w800` (FILE_ID dari link file). File harus dapat diakses publik agar gambar tampil; jika tidak, placeholder otomatis dipakai.
- Aplikasi hanya menerima URL `http://` / `https://`.

## Deploy

**Vercel**
1. Push project ke GitHub, lalu *Add New > Project* di Vercel dan pilih repo.
2. Framework: Vite (otomatis). Build: `npm run build`, output: `dist`.
3. Tambahkan Environment Variables `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`, lalu Deploy. `vercel.json` sudah menangani routing SPA.

**Netlify**: build `npm run build`, publish `dist`, isi environment variables yang sama. `public/_redirects` sudah disertakan.

## Keamanan
- Hanya `anon key` yang dipakai di frontend; **jangan** memakai `service_role` key di client.
- Tidak ada password manual (dikelola Supabase Auth) dan tidak ada kredensial Google Drive.
- `.env` sudah masuk `.gitignore`.
- Semua input divalidasi (zod) dan URL dibatasi http(s).

## Catatan
- Tema dark saja (default sesuai permintaan).
- Kategori disimpan sebagai teks di tiap data, sehingga mengganti nama/menghapus kategori tidak mengubah data lama.
- Dokumentasi yang dicentang **Penting** diprioritaskan pada peringatan backup.

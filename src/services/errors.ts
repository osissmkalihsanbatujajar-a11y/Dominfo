/** Ubah error Supabase/Postgres menjadi pesan yang mudah dipahami. */
export function toMessage(err: unknown): string {
  const e = err as { code?: string; message?: string } | null;
  if (!e) return 'Terjadi kesalahan. Coba lagi.';
  if (e.code === '42501' || e.code === 'PGRST116') return 'Anda tidak memiliki izin untuk melakukan aksi ini.';
  if (e.code === '23505') return 'Data dengan nilai tersebut sudah ada.';
  if (e.code === '23503') return 'Data ini masih terhubung dengan data lain.';
  if (e.code === '42P01') return 'Tabel belum dibuat. Jalankan supabase/schema.sql terlebih dahulu.';
  if (e.message?.toLowerCase().includes('failed to fetch')) return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
  if (e.message?.toLowerCase().includes('invalid login')) return 'Email atau password salah.';
  return e.message ?? 'Terjadi kesalahan. Coba lagi.';
}

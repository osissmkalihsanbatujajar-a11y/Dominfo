import { Viewfinder } from '@/components/ui/Viewfinder';

const steps = [
  'Buat proyek di supabase.com, lalu buka Project Settings > API.',
  'Salin .env.example menjadi .env dan isi VITE_SUPABASE_URL serta VITE_SUPABASE_ANON_KEY.',
  'Jalankan supabase/schema.sql di SQL Editor (lalu supabase/seed.sql untuk data contoh).',
  'Restart server dev (npm run dev), lalu daftar akun pertama — otomatis menjadi Admin.',
];

export default function SetupRequiredPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-5 py-10">
      <div className="glass w-full max-w-lg rounded-3xl p-7">
        <div className="relative mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-iris-500/15"><Viewfinder className="m-2" /><span className="h-2.5 w-2.5 rounded-full bg-iris-400" /></div>
        <h1 className="text-xl font-semibold text-ink-100">Hubungkan Supabase dulu</h1>
        <p className="mt-1 text-sm text-ink-400">Variabel lingkungan belum diisi, jadi aplikasi belum bisa terhubung ke database.</p>
        <ol className="mt-5 space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-ink-200">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-semibold">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

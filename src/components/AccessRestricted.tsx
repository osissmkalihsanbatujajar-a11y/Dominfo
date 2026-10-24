import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, Lock } from 'lucide-react';
import { Viewfinder } from '@/components/ui/Viewfinder';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABEL } from '@/lib/constants';

/** Ditampilkan saat peran tidak punya izin membuka sebuah halaman (mis. Viewer membuka /kalender). */
export function AccessRestricted({ title = 'Kalender Konten' }: { title?: string }) {
  const { role } = useAuth();
  return (
    <section aria-labelledby="akses-dibatasi" className="animate-rise mx-auto mt-6 flex max-w-lg flex-col items-center rounded-3xl glass px-6 py-12 text-center sm:mt-14 sm:px-10">
      <div className="relative grid h-24 w-24 place-items-center">
        <span aria-hidden className="absolute inset-3 rounded-full bg-iris-500/20 blur-xl" />
        <Viewfinder />
        <Lock className="relative h-9 w-9 text-iris-300" aria-hidden />
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-iris-300">Akses dibatasi</p>
      <h1 id="akses-dibatasi" className="mt-1 text-2xl font-semibold tracking-tight text-ink-100">{title} bersifat privat</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-300">
        Kalender berisi rencana kegiatan OSIS yang belum dilaksanakan, sehingga hanya dapat dilihat oleh Admin dan Editor.
      </p>
      {role && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-ink-300 ring-1 ring-inset ring-white/10">
          <i className="h-1.5 w-1.5 rounded-full bg-slate-400" aria-hidden /> Peran Anda: <span className="font-medium text-ink-100">{ROLE_LABEL[role]}</span>
        </p>
      )}
      <div className="mt-7 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Link to="/" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-iris-500 px-4 text-sm font-medium text-white shadow-glow transition hover:bg-iris-400 active:bg-iris-600">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Kembali ke Dashboard
        </Link>
        <Link to="/dokumentasi" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/5 px-4 text-sm font-medium text-ink-100 ring-1 ring-inset ring-white/10 transition hover:bg-white/10">
          <Camera className="h-4 w-4" aria-hidden /> Lihat Dokumentasi
        </Link>
      </div>
      <p className="mt-5 text-xs text-ink-400">Butuh akses? Hubungi Admin DOMINFO untuk mengubah role Anda.</p>
    </section>
  );
}

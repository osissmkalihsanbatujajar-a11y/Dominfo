import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Viewfinder } from '@/components/ui/Viewfinder';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { toMessage } from '@/services/errors';
import { authSchema } from '@/utils/validation';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const { session, signIn, signUp } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (session) return <Navigate to="/" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const parsed = authSchema.safeParse({ email: form.email, password: form.password });
    if (!parsed.success) parsed.error.issues.forEach((i) => { errs[String(i.path[0])] ||= i.message; });
    if (mode === 'register' && !form.name.trim()) errs.name = 'Nama wajib diisi';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      if (mode === 'login') {
        await signIn(form.email.trim(), form.password);
      } else {
        const { needsConfirmation } = await signUp(form.email.trim(), form.password, form.name.trim());
        if (needsConfirmation) {
          toast.success('Akun dibuat. Cek email Anda untuk konfirmasi, lalu masuk.');
          setMode('login');
        }
      }
    } catch (err) {
      toast.error(toMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((x) => ({ ...x, [k]: '' }));
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/5 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-iris-500/15 ring-1 ring-iris-400/30"><Viewfinder className="m-1.5" /><span className="h-2 w-2 rounded-full bg-iris-400" /></span>
          <span className="text-lg font-bold tracking-tight">DOMINFO</span>
        </div>
        <div className="relative max-w-md">
          <div className="relative aspect-[4/3] rounded-3xl bg-gradient-to-br from-ink-800 to-ink-900 ring-1 ring-white/10">
            <Viewfinder className="m-6" />
            <div className="absolute inset-x-8 bottom-8">
              <p className="text-2xl font-semibold leading-snug text-ink-100">Satu tempat untuk jadwal konten, dokumentasi, aset, dan backup OSIS.</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-ink-400">Dashboard internal divisi Dokumentasi dan Informasi OSIS.</p>
      </div>

      <div className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-ink-100">{mode === 'login' ? 'Masuk ke DOMINFO' : 'Buat akun DOMINFO'}</h1>
          <p className="mt-1 text-sm text-ink-400">
            {mode === 'login' ? 'Gunakan email dan password akun Anda.' : 'Akun baru berperan Viewer. Admin dapat mengubah role Anda.'}
          </p>

          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            {mode === 'register' && (
              <Field label="Nama lengkap" htmlFor="name" error={errors.name} required>
                <Input id="name" autoComplete="name" value={form.name} onChange={set('name')} aria-invalid={!!errors.name} />
              </Field>
            )}
            <Field label="Email" htmlFor="email" error={errors.email} required>
              <Input id="email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={set('email')} aria-invalid={!!errors.email} />
            </Field>
            <Field label="Password" htmlFor="password" error={errors.password} hint={mode === 'register' ? 'Minimal 8 karakter.' : undefined} required>
              <Input id="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={set('password')} aria-invalid={!!errors.password} />
            </Field>
            <Button type="submit" variant="primary" className="w-full" loading={busy}>{mode === 'login' ? 'Masuk' : 'Buat akun'}</Button>
          </form>

          <p className={cn('mt-5 text-center text-sm text-ink-400')}>
            {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); }} className="font-medium text-iris-300 hover:underline">
              {mode === 'login' ? 'Daftar' : 'Masuk'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

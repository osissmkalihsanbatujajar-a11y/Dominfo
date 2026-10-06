import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning';
interface ToastItem { id: number; type: ToastType; message: string }
interface ToastApi { success: (m: string) => void; error: (m: string) => void; warning: (m: string) => void }

const ToastContext = createContext<ToastApi | null>(null);
let nextId = 1;

const styles: Record<ToastType, { box: string; icon: typeof CheckCircle2; color: string }> = {
  success: { box: 'ring-emerald-400/30', icon: CheckCircle2, color: 'text-emerald-400' },
  error: { box: 'ring-rose-400/30', icon: XCircle, color: 'text-rose-400' },
  warning: { box: 'ring-amber-400/30', icon: AlertTriangle, color: 'text-amber-400' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const push = useCallback((type: ToastType, message: string) => {
    const id = nextId++;
    setItems((l) => [...l.slice(-3), { id, type, message }]);
    setTimeout(() => dismiss(id), type === 'error' ? 6500 : 4000);
  }, [dismiss]);

  const api = useMemo<ToastApi>(
    () => ({ success: (m) => push('success', m), error: (m) => push('error', m), warning: (m) => push('warning', m) }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:inset-x-auto lg:bottom-auto lg:right-6 lg:top-6 lg:items-end"
      >
        {items.map((t) => {
          const s = styles[t.type];
          const Icon = s.icon;
          return (
            <div key={t.id} role={t.type === 'error' ? 'alert' : 'status'}
              className={cn('pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-ink-800 px-4 py-3 text-sm shadow-pop ring-1', s.box)}>
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', s.color)} aria-hidden />
              <p className="flex-1 text-ink-100">{t.message}</p>
              <button onClick={() => dismiss(t.id)} aria-label="Tutup notifikasi" className="text-ink-400 hover:text-ink-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast harus dipakai di dalam ToastProvider');
  return ctx;
}

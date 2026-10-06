import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RemindersList } from '@/features/reminders/RemindersList';
import { useReminders } from '@/features/reminders/useReminders';
import { PAGE_TITLES } from './nav';

export function Topbar({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  const { pathname } = useLocation();
  const { reminders } = useReminders();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const title = PAGE_TITLES[pathname] ?? 'Dashboard';
  const urgent = reminders.filter((r) => r.severity !== 'info').length;

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-white/5 bg-ink-950/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Buka menu"><Menu className="h-5 w-5" /></Button>
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1 truncate text-sm text-ink-400">
        <span>DOMINFO</span><span className="mx-2 text-ink-600" aria-hidden>/</span><span className="font-medium text-ink-100">{title}</span>
      </nav>

      <button onClick={onSearch} className="hidden h-10 w-64 items-center gap-2 rounded-xl bg-ink-900/70 px-3 text-sm text-ink-400 ring-1 ring-inset ring-white/10 transition hover:ring-white/20 md:flex" aria-label="Buka pencarian global">
        <Search className="h-4 w-4" aria-hidden /> <span className="flex-1 text-left">Cari apa saja…</span>
        <kbd className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] text-ink-300">Ctrl K</kbd>
      </button>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onSearch} aria-label="Cari"><Search className="h-5 w-5" /></Button>

      <div ref={ref} className="relative">
        <Button variant="ghost" size="icon" onClick={() => setOpen((o) => !o)} aria-label={`Pengingat${urgent ? `, ${urgent} perlu perhatian` : ''}`} aria-expanded={open}>
          <Bell className="h-5 w-5" />
          {urgent > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">{urgent > 9 ? '9+' : urgent}</span>}
        </Button>
        {open && (
          <div className="fixed inset-x-3 top-[4.5rem] z-40 max-h-[70dvh] overflow-y-auto rounded-2xl bg-ink-800 p-3 shadow-pop ring-1 ring-white/10 sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-96">
            <p className="px-2 pb-2 text-sm font-semibold text-ink-100">Pengingat</p>
            <RemindersList reminders={reminders} limit={8} onNavigate={() => setOpen(false)} />
          </div>
        )}
      </div>
    </header>
  );
}

import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlobalSearch } from '@/features/search/GlobalSearch';
import { cn } from '@/lib/utils';
import { MAIN_NAV } from './nav';
import { SidebarContent } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-dvh">
      <a href="#konten" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-xl focus:bg-iris-500 focus:px-4 focus:py-2 focus:text-white">Lewati ke konten</a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/5 bg-ink-900/60 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDrawer(false)} aria-hidden />
          <aside role="dialog" aria-modal="true" aria-label="Menu navigasi" className="absolute inset-y-0 left-0 w-[17rem] max-w-[85vw] bg-ink-900 shadow-pop ring-1 ring-white/10">
            <Button variant="ghost" size="icon" className="absolute right-2 top-3" onClick={() => setDrawer(false)} aria-label="Tutup menu"><X className="h-5 w-5" /></Button>
            <SidebarContent onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <Topbar onMenu={() => setDrawer(true)} onSearch={() => setSearchOpen(true)} />
        <main id="konten" className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-12">
          <Outlet />
        </main>
      </div>

      <nav aria-label="Navigasi cepat" className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink-900/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <ul className="mx-auto grid max-w-xl grid-cols-5">
          {MAIN_NAV.map(({ to, short, icon: Icon, ...rest }) => (
            <li key={to}>
              <NavLink to={to} end={'end' in rest}
                className={({ isActive }) => cn('flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition', isActive ? 'text-iris-300' : 'text-ink-400')}>
                <Icon className="h-5 w-5" aria-hidden />{short}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

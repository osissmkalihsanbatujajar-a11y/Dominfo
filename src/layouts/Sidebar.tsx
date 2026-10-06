import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Viewfinder } from '@/components/ui/Viewfinder';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABEL } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { MAIN_NAV, MANAGEMENT_NAV } from './nav';

function NavGroup({ label, items, onNavigate }: { label: string; items: typeof MAIN_NAV; onNavigate?: () => void }) {
  return (
    <div>
      <p className="mb-1.5 px-3 text-xs font-medium text-ink-500">{label}</p>
      <ul className="space-y-0.5">
        {items.map(({ to, label: l, icon: Icon, ...rest }) => (
          <li key={to}>
            <NavLink to={to} end={'end' in rest} onClick={onNavigate}
              className={({ isActive }) => cn(
                'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition',
                isActive ? 'bg-iris-500/15 text-iris-300 ring-1 ring-inset ring-iris-400/20' : 'text-ink-300 hover:bg-white/5 hover:text-ink-100',
              )}>
              <Icon className="h-[18px] w-[18px]" aria-hidden />
              {l}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UserMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { profile, session, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const name = profile?.full_name || session?.user.email || 'Pengguna';

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {open && (
        <div role="menu" className="absolute inset-x-0 bottom-full mb-2 rounded-2xl bg-ink-800 p-1.5 shadow-pop ring-1 ring-white/10">
          <Link role="menuitem" to="/pengaturan" onClick={() => { setOpen(false); onNavigate?.(); }} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-ink-200 hover:bg-white/5">
            <Settings className="h-4 w-4" aria-hidden /> Pengaturan akun
          </Link>
          <button role="menuitem" onClick={signOut} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-rose-300 hover:bg-rose-500/10">
            <LogOut className="h-4 w-4" aria-hidden /> Keluar
          </button>
        </div>
      )}
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.04] p-2.5 text-left ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.07]">
        <Avatar name={name} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink-100">{name}</span>
          <span className="block text-xs text-ink-400">{profile ? ROLE_LABEL[profile.role] : 'Memuat…'}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 text-ink-400" aria-hidden />
      </button>
    </div>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 px-4 py-5">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-3 px-1" aria-label="DOMINFO — ke Dashboard">
        <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-iris-500/15 ring-1 ring-iris-400/30">
          <Viewfinder className="m-1.5" />
          <span className="h-2 w-2 rounded-full bg-iris-400" />
        </span>
        <span className="leading-tight">
          <span className="block text-base font-bold tracking-tight text-ink-100">DOMINFO</span>
          <span className="block text-xs text-ink-400">Content Management</span>
        </span>
      </Link>
      <nav aria-label="Navigasi utama" className="flex-1 space-y-6 overflow-y-auto">
        <NavGroup label="Main" items={MAIN_NAV} onNavigate={onNavigate} />
        <NavGroup label="Management" items={MANAGEMENT_NAV} onNavigate={onNavigate} />
      </nav>
      <UserMenu onNavigate={onNavigate} />
    </div>
  );
}

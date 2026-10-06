import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const base = 'inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-300 transition hover:bg-white/10 hover:text-ink-100 sm:h-8 sm:w-8';

interface Props { label: string; icon: LucideIcon; onClick?: () => void; href?: string; danger?: boolean }

/** Tombol ikon berlabel (dan tooltip). Dengan `href` menjadi link eksternal aman. */
export function IconAction({ label, icon: Icon, onClick, href, danger }: Props) {
  const cls = cn(base, danger && 'hover:bg-rose-500/15 hover:text-rose-300');
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className={cls}>
        <Icon className="h-4 w-4" />
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={cls}>
      <Icon className="h-4 w-4" />
    </button>
  );
}

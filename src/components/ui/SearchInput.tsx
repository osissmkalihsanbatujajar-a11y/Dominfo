import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props { value: string; onChange: (v: string) => void; placeholder?: string; label?: string; className?: string }

export function SearchInput({ value, onChange, placeholder = 'Cari…', label = 'Cari', className }: Props) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="field h-11 pl-9 pr-9 sm:h-10 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Hapus pencarian" className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-ink-400 hover:bg-white/10 hover:text-ink-100">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

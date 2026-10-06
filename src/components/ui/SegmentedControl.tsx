import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props<T extends string> {
  value: T;
  onChange: (v: T) => void;
  label: string;
  options: { value: T; label: string; icon?: LucideIcon }[];
}

export function SegmentedControl<T extends string>({ value, onChange, label, options }: Props<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-xl bg-ink-900/70 p-1 ring-1 ring-inset ring-white/10">
      {options.map(({ value: v, label: l, icon: Icon }) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          aria-label={l}
          onClick={() => onChange(v)}
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition sm:h-8',
            value === v ? 'bg-white/10 text-ink-100 shadow-sm' : 'text-ink-400 hover:text-ink-200',
          )}
        >
          {Icon && <Icon className="h-4 w-4" aria-hidden />}
          <span className={Icon ? 'hidden sm:inline' : ''}>{l}</span>
        </button>
      ))}
    </div>
  );
}

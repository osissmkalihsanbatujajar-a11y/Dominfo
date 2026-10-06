import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Viewfinder } from './Viewfinder';

interface Props { icon: LucideIcon; title: string; description: string; action?: ReactNode }

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 px-6 py-14 text-center">
      <div className="relative grid h-20 w-20 place-items-center">
        <Viewfinder />
        <Icon className="h-8 w-8 text-iris-300" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink-100">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

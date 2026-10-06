import { cn } from '@/lib/utils';

const corners = [
  'left-0 top-0 border-l-2 border-t-2 rounded-tl-md',
  'right-0 top-0 border-r-2 border-t-2 rounded-tr-md',
  'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-md',
  'bottom-0 right-0 border-b-2 border-r-2 rounded-br-md',
];

/** Ornamen bingkai bidik kamera — dipakai di logo, placeholder thumbnail, dan empty state. */
export function Viewfinder({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('pointer-events-none absolute inset-0', className)}>
      {corners.map((c) => <i key={c} className={cn('absolute h-3 w-3 border-iris-400/60', c)} />)}
    </span>
  );
}

import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-lg bg-white/[0.06]', className)} />;
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Memuat data">
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
    </div>
  );
}

export function GridSkeleton({ items = 8 }: { items?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" role="status" aria-label="Memuat data">
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="glass overflow-hidden rounded-2xl">
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="space-y-2 p-4"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
        </div>
      ))}
    </div>
  );
}

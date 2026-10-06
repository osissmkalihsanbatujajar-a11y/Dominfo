import { useState } from 'react';
import { cn, initials, isSafeUrl } from '@/lib/utils';

const sizes = { sm: 'h-7 w-7 text-[10px]', md: 'h-9 w-9 text-xs', lg: 'h-14 w-14 text-base' };

export function Avatar({ name, src, size = 'md', className }: { name?: string | null; src?: string | null; size?: keyof typeof sizes; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={cn('grid shrink-0 place-items-center overflow-hidden rounded-full bg-iris-500/20 font-semibold text-iris-300 ring-1 ring-iris-400/30', sizes[size], className)}>
      {isSafeUrl(src) && !failed ? (
        <img src={src} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      ) : (
        initials(name)
      )}
    </span>
  );
}

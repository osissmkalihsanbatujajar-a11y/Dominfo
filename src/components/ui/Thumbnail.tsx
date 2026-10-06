import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { cn, isSafeUrl } from '@/lib/utils';
import { Viewfinder } from './Viewfinder';

/** Gambar dengan placeholder bingkai bidik bila URL kosong / gagal dimuat. */
export function Thumbnail({ src, alt, className, icon: Icon = ImageIcon }: { src?: string | null; alt: string; className?: string; icon?: typeof ImageIcon }) {
  const [failed, setFailed] = useState(false);
  const ok = isSafeUrl(src) && !failed;
  return (
    <div className={cn('relative overflow-hidden bg-gradient-to-br from-ink-800 to-ink-900', className)}>
      {ok ? (
        <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      ) : (
        <div className="relative grid h-full w-full place-items-center" role="img" aria-label={`${alt} (belum ada thumbnail)`}>
          <Viewfinder className="m-4" />
          <Icon className="h-7 w-7 text-ink-500" aria-hidden />
        </div>
      )}
    </div>
  );
}

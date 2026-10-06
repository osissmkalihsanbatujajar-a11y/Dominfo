import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  BACKUP_STYLE, CONTENT_STATUS_STYLE, DOC_STATUS_STYLE, PRIORITY_STYLE,
} from '@/lib/constants';
import type { BackupStatus, ContentStatus, DocStatus, Priority } from '@/types';

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', className)}>
      {children}
    </span>
  );
}

const Dot = ({ c }: { c: string }) => <i className={cn('h-1.5 w-1.5 rounded-full', c)} aria-hidden />;

export const ContentStatusBadge = ({ status }: { status: ContentStatus }) => (
  <Badge className={CONTENT_STATUS_STYLE[status]?.badge}><Dot c={CONTENT_STATUS_STYLE[status]?.dot} />{status}</Badge>
);
export const PriorityBadge = ({ priority }: { priority: Priority }) => (
  <Badge className={PRIORITY_STYLE[priority]?.badge}><Dot c={PRIORITY_STYLE[priority]?.dot} />{priority}</Badge>
);
export const DocStatusBadge = ({ status }: { status: DocStatus }) => (
  <Badge className={DOC_STATUS_STYLE[status]?.badge}><Dot c={DOC_STATUS_STYLE[status]?.dot} />{status}</Badge>
);
export const BackupBadge = ({ status }: { status: BackupStatus }) => (
  <Badge className={BACKUP_STYLE[status]?.badge}><Dot c={BACKUP_STYLE[status]?.dot} />{status}</Badge>
);
export const NeutralBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="bg-white/5 text-ink-200 ring-white/10">{children}</Badge>
);

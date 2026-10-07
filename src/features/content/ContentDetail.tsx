import { useState } from 'react';
import { Copy, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select, toOptions } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { ContentStatusBadge, NeutralBadge, PriorityBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useMembers } from '@/hooks/useLookups';
import { CONTENT_STATUSES } from '@/lib/constants';
import { daysUntil, formatDate, isSafeUrl } from '@/lib/utils';
import { toMessage } from '@/services/errors';
import { contentService } from '@/services';
import type { ContentItem, ContentStatus } from '@/types';

interface Props {
  item: ContentItem | null;
  onClose: () => void;
  onEdit: (c: ContentItem) => void;
  onDelete: (c: ContentItem) => void;
  onChanged: () => void;
}

export function ContentDetail({ item, onClose, onEdit, onDelete, onChanged }: Props) {
  const { canWrite, isAdmin } = useAuth();
  const toast = useToast();
  const { members } = useMembers(false);
  const [status, setStatus] = useState<ContentStatus | null>(null);
  if (!item) return null;
  const current = status ?? item.status;

  async function changeStatus(next: ContentStatus) {
    const prev = current;
    setStatus(next);
    try {
      await contentService.update(item!.content_id, { status: next });
      toast.success(`Status diubah ke ${next}`);
      onChanged();
    } catch (e) {
      setStatus(prev);
      toast.error(toMessage(e));
    }
  }

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(item!.caption ?? '');
      toast.success('Caption disalin');
    } catch {
      toast.warning('Tidak dapat menyalin. Salin caption secara manual.');
    }
  }

  const dl = item.deadline ? daysUntil(item.deadline) : null;
  return (
    <Modal open onClose={() => { setStatus(null); onClose(); }} size="lg" title={item.title}>
      <div className="flex flex-wrap items-center gap-2">
        <ContentStatusBadge status={current} />
        <PriorityBadge priority={item.priority} />
        {item.content_types.map((t) => <NeutralBadge key={t}>{t}</NeutralBadge>)}
        {item.platforms.map((p) => <NeutralBadge key={p}>{p}</NeutralBadge>)}
        {item.categories.map((c) => <NeutralBadge key={c}>#{c}</NeutralBadge>)}
      </div>

      {canWrite && (
        <div className="mt-4 max-w-xs">
          <label htmlFor="quick-status" className="mb-1.5 block text-xs text-ink-400">Ubah status cepat</label>
          <Select id="quick-status" value={current} onChange={(e) => changeStatus(e.target.value as ContentStatus)} options={toOptions(CONTENT_STATUSES)} />
        </div>
      )}

      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <div><dt className="text-xs text-ink-400">Tanggal publikasi</dt><dd className="text-ink-100">{formatDate(item.scheduled_date)}</dd></div>
        <div>
          <dt className="text-xs text-ink-400">Deadline</dt>
          <dd className="text-ink-100">{formatDate(item.deadline)}
            {dl !== null && !['Published', 'Cancelled'].includes(current) && <span className={dl < 0 ? 'ml-2 text-rose-300' : 'ml-2 text-ink-400'}>({dl < 0 ? `terlewat ${-dl} hari` : dl === 0 ? 'hari ini' : `${dl} hari lagi`})</span>}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-400">Penanggung jawab</dt>
          <dd className="flex flex-wrap items-center gap-x-4 gap-y-2 text-ink-100">
            {item.assignees.length === 0 && 'Belum ditentukan'}
            {item.assignees.map((id) => {
              const m = members.find((x) => x.member_id === id);
              return m ? <span key={id} className="inline-flex items-center gap-2"><Avatar name={m.name} src={m.profile_photo} size="sm" />{m.name}</span> : null;
            })}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-400">Link referensi</dt>
          <dd>{isSafeUrl(item.reference_link) ? <a href={item.reference_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-iris-300 hover:underline">Buka referensi <ExternalLink className="h-3.5 w-3.5" aria-hidden /></a> : <span className="text-ink-400">—</span>}</dd>
        </div>
        {item.description && <div className="sm:col-span-2"><dt className="text-xs text-ink-400">Deskripsi</dt><dd className="whitespace-pre-line text-ink-200">{item.description}</dd></div>}
      </dl>

      {item.caption && (
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-100">Caption</h3>
            <Button size="sm" variant="ghost" onClick={copyCaption}><Copy className="h-3.5 w-3.5" aria-hidden /> Salin</Button>
          </div>
          <p className="whitespace-pre-line rounded-xl bg-white/[0.03] p-3 text-sm text-ink-200 ring-1 ring-inset ring-white/10">{item.caption}</p>
        </div>
      )}

      {(canWrite || isAdmin) && (
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {isAdmin && <Button variant="danger" onClick={() => onDelete(item)}><Trash2 className="h-4 w-4" aria-hidden /> Hapus</Button>}
          {canWrite && <Button variant="primary" onClick={() => onEdit(item)}><Pencil className="h-4 w-4" aria-hidden /> Ubah</Button>}
        </div>
      )}
    </Modal>
  );
}

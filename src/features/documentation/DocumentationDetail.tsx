import { useEffect, useState } from 'react';
import { Camera, ExternalLink, FileText, Film, MapPin, Pencil, ShieldCheck, Star, User } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Thumbnail } from '@/components/ui/Thumbnail';
import { BackupBadge, DocStatusBadge, NeutralBadge } from '@/components/ui/Badge';
import { supabase } from '@/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, isSafeUrl } from '@/lib/utils';
import type { Backup, DocumentationItem } from '@/types';

function LinkRow({ icon: Icon, label, href }: { icon: typeof Camera; label: string; href: string | null }) {
  const ok = isSafeUrl(href);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5 ring-1 ring-inset ring-white/10">
      <span className="flex items-center gap-2.5 text-sm text-ink-200"><Icon className="h-4 w-4 text-iris-300" aria-hidden />{label}</span>
      {ok ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-iris-300 hover:bg-white/5">
          Buka <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      ) : (
        <span className="text-xs text-ink-500">Belum ada link</span>
      )}
    </div>
  );
}

interface Props { item: DocumentationItem | null; onClose: () => void; onEdit: (d: DocumentationItem) => void }

export function DocumentationDetail({ item, onClose, onEdit }: Props) {
  const { canWrite } = useAuth();
  const [backups, setBackups] = useState<Backup[]>([]);

  useEffect(() => {
    if (!item) return;
    let alive = true;
    supabase.from('backups').select('*').eq('documentation_id', item.documentation_id).order('backup_date', { ascending: false })
      .then(({ data }) => { if (alive) setBackups((data ?? []) as Backup[]); });
    return () => { alive = false; };
  }, [item]);

  if (!item) return null;
  const crew = [item.photographer && `Foto: ${item.photographer}`, item.videographer && `Video: ${item.videographer}`].filter(Boolean) as string[];

  return (
    <Modal open onClose={onClose} size="lg" title={item.event_name}>
      <Thumbnail src={item.thumbnail_url} alt={item.event_name} className="mb-4 aspect-[16/8] rounded-2xl" />
      <div className="flex flex-wrap items-center gap-2">
        <DocStatusBadge status={item.status} />
        <BackupBadge status={item.backup_status} />
        <NeutralBadge>{item.category}</NeutralBadge>
        {item.is_important && <NeutralBadge><Star className="h-3 w-3 text-amber-300" aria-hidden /> Penting</NeutralBadge>}
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-xs text-ink-400">Tanggal</dt><dd className="text-ink-100">{formatDate(item.event_date)}</dd></div>
        <div><dt className="text-xs text-ink-400">Lokasi</dt><dd className="flex items-center gap-1.5 text-ink-100"><MapPin className="h-3.5 w-3.5 text-ink-400" aria-hidden />{item.location || '—'}</dd></div>
        <div className="sm:col-span-2"><dt className="text-xs text-ink-400">Dokumentator</dt>
          <dd className="flex items-center gap-1.5 text-ink-100"><User className="h-3.5 w-3.5 text-ink-400" aria-hidden />{crew.length ? crew.join(' · ') : '—'}</dd></div>
        {item.description && <div className="sm:col-span-2"><dt className="text-xs text-ink-400">Deskripsi</dt><dd className="whitespace-pre-line text-ink-200">{item.description}</dd></div>}
      </dl>

      <h3 className="mb-2 mt-5 text-sm font-semibold text-ink-100">Link cloud</h3>
      <div className="space-y-2">
        <LinkRow icon={Camera} label="Foto" href={item.photo_link} />
        <LinkRow icon={Film} label="Video" href={item.video_link} />
        <LinkRow icon={FileText} label="Dokumen" href={item.document_link} />
      </div>

      <h3 className="mb-2 mt-5 text-sm font-semibold text-ink-100">Backup ({backups.length})</h3>
      {backups.length === 0 ? (
        <p className="rounded-xl bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">Belum ada backup untuk dokumentasi ini.</p>
      ) : (
        <ul className="space-y-2">
          {backups.map((b) => (
            <li key={b.backup_id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5 ring-1 ring-inset ring-white/10">
              <span className="min-w-0 text-sm text-ink-200">
                <ShieldCheck className={`mr-2 inline h-4 w-4 ${b.verified ? 'text-emerald-400' : 'text-ink-500'}`} aria-hidden />
                {b.backup_type} · {b.storage_provider} · {formatDate(b.backup_date)}
              </span>
              {isSafeUrl(b.backup_url) && <a href={b.backup_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-iris-300" aria-label={`Buka backup ${b.backup_type}`}>Buka</a>}
            </li>
          ))}
        </ul>
      )}

      {item.notes && (<><h3 className="mb-2 mt-5 text-sm font-semibold text-ink-100">Catatan</h3><p className="whitespace-pre-line text-sm text-ink-300">{item.notes}</p></>)}

      {canWrite && (
        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={() => onEdit(item)}><Pencil className="h-4 w-4" aria-hidden /> Ubah</Button>
        </div>
      )}
    </Modal>
  );
}

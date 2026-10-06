import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface Props { page: number; pageSize: number; total: number; onPageChange: (p: number) => void }

export function Pagination({ page, pageSize, total, onPageChange }: Props) {
  if (total === 0) return null;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <nav aria-label="Navigasi halaman" className="flex items-center justify-between gap-3 pt-4 text-sm text-ink-300">
      <p>Menampilkan {from}–{to} dari {total}</p>
      <div className="flex items-center gap-1">
        <Button size="icon" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Halaman sebelumnya"><ChevronLeft className="h-4 w-4" /></Button>
        <span className="min-w-14 px-1 text-center tabular-nums">{page} / {pages}</span>
        <Button size="icon" onClick={() => onPageChange(page + 1)} disabled={page >= pages} aria-label="Halaman berikutnya"><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </nav>
  );
}

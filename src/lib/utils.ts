import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const pad = (n: number) => String(n).padStart(2, '0');
/** Format lokal YYYY-MM-DD (tanpa pergeseran zona waktu). */
export const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayYMD = () => toYMD(new Date());
export const parseYMD = (s: string) => {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
/** Awal minggu (Senin). */
export const startOfWeek = (d: Date) => addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate()), -((d.getDay() + 6) % 7));
export const daysUntil = (ymd: string) =>
  Math.round((parseYMD(ymd).getTime() - parseYMD(todayYMD()).getTime()) / 86_400_000);

const dateFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const longFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const monthFmt = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });

export const formatDate = (s?: string | null) => (s ? dateFmt.format(parseYMD(s)) : '—');
export const formatLongDate = (d: Date) => longFmt.format(d);
export const formatMonth = (d: Date) => monthFmt.format(d);

export function formatDateRange(a: Date, b: Date) {
  const f = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' });
  return `${f.format(a)} – ${f.format(b)} ${b.getFullYear()}`;
}

export function relativeTime(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'baru saja';
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} hari lalu`;
  return dateFmt.format(new Date(iso));
}

export const initials = (name?: string | null) =>
  (name ?? '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?';

/** Hanya izinkan http(s) agar tidak ada link berbahaya (javascript:, data:). */
export const isSafeUrl = (u?: string | null): u is string => !!u && /^https?:\/\//i.test(u);

export function monthGrid(year: number, month: number): Date[] {
  const start = startOfWeek(new Date(year, month, 1));
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  return days.slice(35).every((d) => d.getMonth() !== month) ? days.slice(0, 35) : days;
}

export const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

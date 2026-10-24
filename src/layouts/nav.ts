import { Boxes, CalendarDays, Camera, LayoutDashboard, Settings, ShieldCheck, Tags, Users, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  short: string;
  icon: LucideIcon;
  end?: boolean;
  /** Menu privat: hanya tampil untuk Admin & Editor (Viewer tidak melihatnya sama sekali). */
  restricted?: boolean;
}

export const MAIN_NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', short: 'Beranda', icon: LayoutDashboard, end: true },
  { to: '/kalender', label: 'Kalender Konten', short: 'Kalender', icon: CalendarDays, restricted: true },
  { to: '/dokumentasi', label: 'Dokumentasi', short: 'Dokumen', icon: Camera },
  { to: '/aset', label: 'Bank Aset', short: 'Aset', icon: Boxes },
  { to: '/backup', label: 'Backup', short: 'Backup', icon: ShieldCheck },
];

export const MANAGEMENT_NAV: NavItem[] = [
  { to: '/anggota', label: 'Anggota', short: 'Anggota', icon: Users },
  { to: '/kategori', label: 'Kategori', short: 'Kategori', icon: Tags },
  { to: '/pengaturan', label: 'Pengaturan', short: 'Pengaturan', icon: Settings },
];

/** Buang menu yang tidak boleh dilihat peran saat ini. */
export const visibleNav = (items: NavItem[], canViewCalendar: boolean) =>
  items.filter((i) => !i.restricted || canViewCalendar);

export const PAGE_TITLES: Record<string, string> = Object.fromEntries(
  [...MAIN_NAV, ...MANAGEMENT_NAV].map((n) => [n.to, n.label]),
);

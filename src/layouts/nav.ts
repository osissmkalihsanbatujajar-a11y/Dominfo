import { Boxes, CalendarDays, Camera, LayoutDashboard, Settings, ShieldCheck, Tags, Users } from 'lucide-react';

export const MAIN_NAV = [
  { to: '/', label: 'Dashboard', short: 'Beranda', icon: LayoutDashboard, end: true },
  { to: '/kalender', label: 'Kalender Konten', short: 'Kalender', icon: CalendarDays },
  { to: '/dokumentasi', label: 'Dokumentasi', short: 'Dokumen', icon: Camera },
  { to: '/aset', label: 'Bank Aset', short: 'Aset', icon: Boxes },
  { to: '/backup', label: 'Backup', short: 'Backup', icon: ShieldCheck },
];

export const MANAGEMENT_NAV = [
  { to: '/anggota', label: 'Anggota', short: 'Anggota', icon: Users },
  { to: '/kategori', label: 'Kategori', short: 'Kategori', icon: Tags },
  { to: '/pengaturan', label: 'Pengaturan', short: 'Pengaturan', icon: Settings },
];

export const PAGE_TITLES: Record<string, string> = Object.fromEntries(
  [...MAIN_NAV, ...MANAGEMENT_NAV].map((n) => [n.to, n.label]),
);

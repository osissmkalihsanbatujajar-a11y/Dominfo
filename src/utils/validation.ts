import { z } from 'zod';
import {
  BACKUP_TYPES, CONTENT_STATUSES, CONTENT_TYPES, DOC_STATUSES, FILE_TYPES, MEMBER_STATUSES,
  PLATFORMS, PRIORITIES, STORAGE_PROVIDERS, CATEGORY_SCOPES,
} from '@/lib/constants';
import { parseYMD, toYMD } from '@/lib/utils';

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && toYMD(parseYMD(s)) === s;
const isHttpUrl = (s: string) => {
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

const URL_MSG = (label: string) => `${label} harus berupa URL valid (diawali http:// atau https://)`;
const reqText = (label: string, max = 200) =>
  z.string().trim().min(1, `${label} wajib diisi`).max(max, `${label} maksimal ${max} karakter`);
const optText = (label: string, max = 2000) => z.string().trim().max(max, `${label} maksimal ${max} karakter`);
const reqDate = (label: string) => z.string().min(1, `${label} wajib diisi`).refine(isDate, `${label} tidak valid`);
const optDate = (label: string) => z.string().refine((v) => v === '' || isDate(v), `${label} tidak valid`);
const reqUrl = (label: string) => z.string().trim().min(1, `${label} wajib diisi`).refine(isHttpUrl, URL_MSG(label));
const optUrl = (label: string) => z.string().trim().refine((v) => v === '' || isHttpUrl(v), URL_MSG(label));
const pick = <T extends readonly [string, ...string[]]>(values: T, label: string) =>
  z.enum(values, { errorMap: () => ({ message: `${label} wajib dipilih` }) });

export const contentSchema = z
  .object({
    title: reqText('Judul', 150),
    description: optText('Deskripsi'),
    content_types: z.array(pick(CONTENT_TYPES, 'Tipe konten')).min(1, 'Pilih minimal satu tipe konten'),
    categories: z.array(z.string().trim().min(1).max(80)),
    scheduled_date: reqDate('Tanggal publikasi'),
    deadline: optDate('Deadline'),
    platforms: z.array(pick(PLATFORMS, 'Platform')).min(1, 'Pilih minimal satu platform'),
    status: pick(CONTENT_STATUSES, 'Status'),
    priority: pick(PRIORITIES, 'Prioritas'),
    assignees: z.array(z.string()),
    caption: optText('Caption', 3000),
    reference_link: optUrl('Link referensi'),
  })
  .superRefine((v, ctx) => {
    if (v.deadline && v.scheduled_date && v.deadline > v.scheduled_date) {
      ctx.addIssue({ code: 'custom', path: ['deadline'], message: 'Deadline tidak boleh setelah tanggal publikasi' });
    }
  });

export const documentationSchema = z.object({
  event_name: reqText('Nama kegiatan', 150),
  event_date: reqDate('Tanggal kegiatan'),
  location: optText('Lokasi', 150),
  category: reqText('Kategori', 80),
  description: optText('Deskripsi'),
  photographer: optText('Fotografer', 100),
  videographer: optText('Videografer', 100),
  photo_link: optUrl('Link foto'),
  video_link: optUrl('Link video'),
  document_link: optUrl('Link dokumen'),
  thumbnail_url: optUrl('URL thumbnail'),
  status: pick(DOC_STATUSES, 'Status'),
  is_important: z.boolean(),
  notes: optText('Catatan'),
});

export const assetSchema = z.object({
  name: reqText('Nama aset', 120),
  category: reqText('Kategori', 80),
  description: optText('Deskripsi'),
  file_url: reqUrl('Link file'),
  preview_url: optUrl('URL preview'),
  file_type: pick(FILE_TYPES, 'Tipe file'),
  version: reqText('Versi', 20),
});

export const backupSchema = z.object({
  documentation_id: z.string().min(1, 'Pilih dokumentasi yang di-backup'),
  backup_type: pick(BACKUP_TYPES, 'Tipe backup'),
  storage_provider: pick(STORAGE_PROVIDERS, 'Penyimpanan'),
  backup_url: reqUrl('Link backup'),
  backup_date: reqDate('Tanggal backup'),
  verified: z.boolean(),
  notes: optText('Catatan'),
});

export const memberSchema = z.object({
  name: reqText('Nama', 100),
  roles: z.array(z.string().trim().min(1)).min(1, 'Pilih minimal satu peran'),
  division: reqText('Divisi', 60),
  profile_photo: optUrl('URL foto profil'),
  email: z.string().trim().max(150).refine((v) => v === '' || z.string().email().safeParse(v).success, 'Format email tidak valid'),
  status: pick(MEMBER_STATUSES, 'Status'),
});

export const categorySchema = z.object({
  name: reqText('Nama kategori', 60),
  scope: pick(CATEGORY_SCOPES, 'Jenis kategori'),
});

export const authSchema = z.object({
  email: z.string().trim().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});
export const profileSchema = z.object({ full_name: reqText('Nama', 100) });

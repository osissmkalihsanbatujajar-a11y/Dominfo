export const CONTENT_TYPES = ['Poster', 'Story', 'Feed', 'Reels', 'Video', 'Announcement', 'Recap', 'Documentation', 'Educational', 'Other'] as const;
export const PLATFORMS = ['Instagram', 'WhatsApp', 'TikTok', 'Website', 'Internal', 'Other'] as const;
export const CONTENT_STATUSES = ['Idea', 'Planned', 'In Progress', 'Review', 'Scheduled', 'Published', 'Cancelled'] as const;
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;
export const UNFINISHED_STATUSES = ['Idea', 'Planned', 'In Progress', 'Review'] as const;

export const DOC_CATEGORIES = ['Upacara', 'MPLS', 'Rapat', 'Lomba', 'Event Sekolah', 'OSIS', 'Kegiatan Sosial', 'Ekstrakurikuler', 'Other'] as const;
export const DOC_STATUSES = ['Planned', 'On Going', 'Completed', 'Archived'] as const;
export const BACKUP_STATUSES = ['Not Backed Up', 'Backed Up', 'Multiple Backup'] as const;

export const ASSET_CATEGORIES = ['Logo', 'Font', 'Template', 'Graphic', 'Photo', 'Video', 'Document', 'Other'] as const;
export const FILE_TYPES = ['PNG', 'JPG', 'SVG', 'PDF', 'ZIP', 'PSD', 'AI', 'Figma', 'Canva', 'MP4', 'TTF/OTF', 'DOCX', 'Other'] as const;

export const BACKUP_TYPES = ['Primary', 'Secondary', 'Archive'] as const;
export const STORAGE_PROVIDERS = ['Google Drive', 'OneDrive', 'Other'] as const;

export const MEMBER_ROLES = ['Ketua DOMINFO', 'Wakil', 'Dokumentasi', 'Videografi', 'Desain', 'Sosial Media', 'Editor', 'Fotografer', 'Anggota'] as const;
export const MEMBER_STATUSES = ['Active', 'Inactive'] as const;
export const USER_ROLES = ['admin', 'editor', 'viewer'] as const;

export const CATEGORY_SCOPES = ['content', 'documentation', 'asset'] as const;
export const CATEGORY_SCOPE_LABEL: Record<(typeof CATEGORY_SCOPES)[number], string> = {
  content: 'Konten',
  documentation: 'Dokumentasi',
  asset: 'Aset',
};

export const ROLE_LABEL: Record<(typeof USER_ROLES)[number], string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

type Tone = { badge: string; dot: string };

// Kelas ditulis lengkap agar terbaca oleh Tailwind (jangan disusun dinamis).
export const CONTENT_STATUS_STYLE: Record<(typeof CONTENT_STATUSES)[number], Tone> = {
  Idea: { badge: 'bg-slate-500/15 text-slate-300 ring-slate-400/25', dot: 'bg-slate-400' },
  Planned: { badge: 'bg-blue-500/15 text-blue-300 ring-blue-400/25', dot: 'bg-blue-400' },
  'In Progress': { badge: 'bg-amber-500/15 text-amber-300 ring-amber-400/25', dot: 'bg-amber-400' },
  Review: { badge: 'bg-violet-500/15 text-violet-300 ring-violet-400/25', dot: 'bg-violet-400' },
  Scheduled: { badge: 'bg-cyan-500/15 text-cyan-300 ring-cyan-400/25', dot: 'bg-cyan-400' },
  Published: { badge: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/25', dot: 'bg-emerald-400' },
  Cancelled: { badge: 'bg-rose-500/15 text-rose-300 ring-rose-400/25', dot: 'bg-rose-400' },
};

export const PRIORITY_STYLE: Record<(typeof PRIORITIES)[number], Tone> = {
  Low: { badge: 'bg-slate-500/15 text-slate-300 ring-slate-400/25', dot: 'bg-slate-400' },
  Medium: { badge: 'bg-blue-500/15 text-blue-300 ring-blue-400/25', dot: 'bg-blue-400' },
  High: { badge: 'bg-amber-500/15 text-amber-300 ring-amber-400/25', dot: 'bg-amber-400' },
  Urgent: { badge: 'bg-rose-500/15 text-rose-300 ring-rose-400/25', dot: 'bg-rose-400' },
};

export const DOC_STATUS_STYLE: Record<(typeof DOC_STATUSES)[number], Tone> = {
  Planned: { badge: 'bg-slate-500/15 text-slate-300 ring-slate-400/25', dot: 'bg-slate-400' },
  'On Going': { badge: 'bg-amber-500/15 text-amber-300 ring-amber-400/25', dot: 'bg-amber-400' },
  Completed: { badge: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/25', dot: 'bg-emerald-400' },
  Archived: { badge: 'bg-violet-500/15 text-violet-300 ring-violet-400/25', dot: 'bg-violet-400' },
};

export const BACKUP_STYLE: Record<(typeof BACKUP_STATUSES)[number], Tone> = {
  'Not Backed Up': { badge: 'bg-rose-500/15 text-rose-300 ring-rose-400/25', dot: 'bg-rose-400' },
  'Backed Up': { badge: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/25', dot: 'bg-emerald-400' },
  'Multiple Backup': { badge: 'bg-cyan-500/15 text-cyan-300 ring-cyan-400/25', dot: 'bg-cyan-400' },
};

export const PAGE_SIZE = 10;
export const GRID_PAGE_SIZE = 12;

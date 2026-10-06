import type {
  ASSET_CATEGORIES, BACKUP_STATUSES, BACKUP_TYPES, CONTENT_STATUSES, CONTENT_TYPES, DOC_STATUSES,
  MEMBER_STATUSES, PLATFORMS, PRIORITIES, STORAGE_PROVIDERS, USER_ROLES, CATEGORY_SCOPES,
} from '@/lib/constants';

export type Role = (typeof USER_ROLES)[number];
export type ContentType = (typeof CONTENT_TYPES)[number];
export type Platform = (typeof PLATFORMS)[number];
export type ContentStatus = (typeof CONTENT_STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type DocStatus = (typeof DOC_STATUSES)[number];
export type BackupStatus = (typeof BACKUP_STATUSES)[number];
export type AssetCategory = (typeof ASSET_CATEGORIES)[number];
export type BackupType = (typeof BACKUP_TYPES)[number];
export type StorageProvider = (typeof STORAGE_PROVIDERS)[number];
export type MemberStatus = (typeof MEMBER_STATUSES)[number];
export type CategoryScope = (typeof CATEGORY_SCOPES)[number];

export interface AppUser {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface Member {
  member_id: string;
  name: string;
  roles: string[];
  division: string;
  profile_photo: string | null;
  email: string | null;
  status: MemberStatus;
  created_at: string;
  updated_at: string;
}

export interface Category {
  category_id: string;
  name: string;
  scope: CategoryScope;
  created_at: string;
}

export interface ContentItem {
  content_id: string;
  title: string;
  description: string | null;
  content_type: ContentType;
  category: string | null;
  scheduled_date: string;
  deadline: string | null;
  platform: Platform;
  status: ContentStatus;
  priority: Priority;
  assignee: string | null;
  caption: string | null;
  reference_link: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  member?: Pick<Member, 'name' | 'profile_photo'> | null;
}

export interface DocumentationItem {
  documentation_id: string;
  event_name: string;
  event_date: string;
  location: string | null;
  category: string;
  description: string | null;
  photographer: string | null;
  videographer: string | null;
  photo_link: string | null;
  video_link: string | null;
  document_link: string | null;
  thumbnail_url: string | null;
  status: DocStatus;
  backup_status: BackupStatus;
  is_important: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  asset_id: string;
  name: string;
  category: string;
  description: string | null;
  file_url: string;
  preview_url: string | null;
  file_type: string;
  version: string;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Backup {
  backup_id: string;
  documentation_id: string;
  backup_type: BackupType;
  storage_provider: StorageProvider;
  backup_url: string;
  backup_date: string;
  verified: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  documentation?: Pick<DocumentationItem, 'event_name' | 'is_important'> | null;
}

export interface ActivityLog {
  log_id: string;
  user_id: string | null;
  user_name: string;
  action: 'create' | 'update' | 'delete';
  target_type: string;
  target_id: string | null;
  target_name: string | null;
  created_at: string;
}

export interface Option {
  value: string;
  label: string;
}

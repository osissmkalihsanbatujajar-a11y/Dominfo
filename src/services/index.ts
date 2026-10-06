import { supabase } from '@/supabase/client';
import { makeCrud } from './crud';
import type { ActivityLog, AppUser, Asset, Backup, Category, ContentItem, DocumentationItem, Member, Role } from '@/types';

export const contentService = makeCrud<ContentItem>('content_calendar', 'content_id');
export const documentationService = makeCrud<DocumentationItem>('documentation', 'documentation_id');
export const assetService = makeCrud<Asset>('assets', 'asset_id');
export const backupService = makeCrud<Backup>('backups', 'backup_id');
export const memberService = makeCrud<Member>('members', 'member_id');
export const categoryService = makeCrud<Category>('categories', 'category_id');

const userCrud = makeCrud<AppUser>('users', 'id');
export const userService = {
  ...userCrud,
  setRole: (id: string, role: Role) => userCrud.update(id, { role }),
};

export async function fetchActivity(limit = 8): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ActivityLog[];
}

/** Hitung baris tanpa mengunduh datanya. */
export async function countRows(
  table: string,
  apply?: (q: any) => any, // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<number> {
  let q: any = supabase.from(table).select('*', { count: 'exact', head: true }); // eslint-disable-line @typescript-eslint/no-explicit-any
  if (apply) q = apply(q);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

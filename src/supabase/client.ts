import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('YOUR-PROJECT') && !anonKey.includes('YOUR-ANON'),
);

// Hanya anon key (publik). Keamanan data dijaga oleh Row Level Security di database.
export const supabase = createClient(
  isSupabaseConfigured ? (url as string) : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? (anonKey as string) : 'placeholder-anon-key',
  { auth: { persistSession: true, autoRefreshToken: true } },
);

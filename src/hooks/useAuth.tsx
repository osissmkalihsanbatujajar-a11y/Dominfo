import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/supabase/client';
import type { AppUser, Role } from '@/types';

interface AuthContextValue {
  session: Session | null;
  profile: AppUser | null;
  loading: boolean;
  /** true jika login berhasil tetapi baris profil di tabel users tidak ditemukan / gagal dimuat. */
  profileMissing: boolean;
  role: Role | null;
  canWrite: boolean;
  isAdmin: boolean;
  /** Kalender OSIS bersifat privat: hanya Admin & Editor. Viewer / profil belum termuat = false. */
  canViewCalendar: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileMissing, setProfileMissing] = useState(false);
  const userId = session?.user.id;

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession()
      .then(({ data }) => {
        if (!alive) return;
        setSession(data.session);
        if (!data.session) setLoading(false);
      })
      // Tanpa catch, kegagalan jaringan membuat aplikasi memuat (skeleton) selamanya.
      .catch(() => { if (alive) { setSession(null); setLoading(false); } });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) {
        setProfile(null);
        setProfileMissing(false);
        setLoading(false);
      }
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
      if (error) throw error;
      setProfile((data as AppUser) ?? null);
      setProfileMissing(!data);
    } catch {
      setProfileMissing(true);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadProfile();
  }, [userId, loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading,
      profileMissing,
      role: profile?.role ?? null,
      canWrite: profile?.role === 'admin' || profile?.role === 'editor',
      isAdmin: profile?.role === 'admin',
      canViewCalendar: profile?.role === 'admin' || profile?.role === 'editor',
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signUp: async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
        if (error) throw error;
        return { needsConfirmation: !data.session };
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
      refreshProfile: loadProfile,
    }),
    [session, profile, loading, profileMissing, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}

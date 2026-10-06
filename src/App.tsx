import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ToastProvider } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { isSupabaseConfigured } from '@/supabase/client';
import { AppLayout } from '@/layouts/AppLayout';
import LoginPage from '@/pages/LoginPage';
import SetupRequiredPage from '@/pages/SetupRequiredPage';
import DashboardPage from '@/pages/DashboardPage';
import ContentPage from '@/pages/ContentPage';
import DocumentationPage from '@/pages/DocumentationPage';
import AssetsPage from '@/pages/AssetsPage';
import BackupPage from '@/pages/BackupPage';
import MembersPage from '@/pages/MembersPage';
import CategoriesPage from '@/pages/CategoriesPage';
import SettingsPage from '@/pages/SettingsPage';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-8" role="status" aria-label="Memuat">
        <Skeleton className="h-10 w-1/2" /><Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" />
      </div>
    );
  }
  return session ? children : <Navigate to="/login" replace />;
}

export default function App() {
  if (!isSupabaseConfigured) return <SetupRequiredPage />;
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
              <Route index element={<DashboardPage />} />
              <Route path="kalender" element={<ContentPage />} />
              <Route path="dokumentasi" element={<DocumentationPage />} />
              <Route path="aset" element={<AssetsPage />} />
              <Route path="backup" element={<BackupPage />} />
              <Route path="anggota" element={<MembersPage />} />
              <Route path="kategori" element={<CategoriesPage />} />
              <Route path="pengaturan" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

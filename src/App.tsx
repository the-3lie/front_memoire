import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const AuthLayout = lazy(() => import('./layouts/AuthLayout'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const EquipeLayout = lazy(() => import('./layouts/EquipeLayout'));

const LoginAdmin = lazy(() => import('./pages/auth/LoginAdmin'));
const LoginEquipe = lazy(() => import('./pages/auth/LoginEquipe'));
const RegisterAdmin = lazy(() => import('./pages/auth/RegisterAdmin'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminPoubelles = lazy(() => import('./pages/admin/Poubelles'));
const AdminEquipes = lazy(() => import('./pages/admin/Equipes'));
const AdminInterventions = lazy(() => import('./pages/admin/Interventions'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));
const AdminCarte = lazy(() => import('./pages/admin/Carte'));
const AdminMessages = lazy(() => import('./pages/admin/Messages'));
const AdminPannes = lazy(() => import('./pages/admin/Pannes'));
const AdminParametres = lazy(() => import('./pages/admin/Parametres'));

const EquipeDashboard = lazy(() => import('./pages/equipe/Dashboard'));
const EquipeInterventions = lazy(() => import('./pages/equipe/Interventions'));
const EquipeMessages = lazy(() => import('./pages/equipe/Messages'));
const EquipeNotifications = lazy(() => import('./pages/equipe/Notifications'));
const EquipeRFID = lazy(() => import('./pages/equipe/RFID'));
const EquipePannes = lazy(() => import('./pages/equipe/Pannes'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950">
      <div className="w-10 h-10 border-4 border-dark-200 dark:border-dark-600 border-t-smart-500 rounded-full animate-spin" />
    </div>
  );
}

function RootRedirect() {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/equipe" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<RootRedirect />} />

                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<LoginAdmin />} />
                  <Route path="login-equipe" element={<LoginEquipe />} />
                  <Route path="register" element={<RegisterAdmin />} />
                </Route>

                <Route path="/admin" element={
                  <ProtectedRoute role="admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="poubelles" element={<AdminPoubelles />} />
                  <Route path="equipes" element={<AdminEquipes />} />
                  <Route path="interventions" element={<AdminInterventions />} />
                  <Route path="notifications" element={<AdminNotifications />} />
                  <Route path="carte" element={<AdminCarte />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="pannes" element={<AdminPannes />} />
                  <Route path="parametres" element={<AdminParametres />} />
                </Route>

                <Route path="/equipe" element={
                  <ProtectedRoute role="equipe">
                    <EquipeLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<EquipeDashboard />} />
                  <Route path="interventions" element={<EquipeInterventions />} />
                  <Route path="messages" element={<EquipeMessages />} />
                  <Route path="notifications" element={<EquipeNotifications />} />
                  <Route path="rfid" element={<EquipeRFID />} />
                  <Route path="pannes" element={<EquipePannes />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

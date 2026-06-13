import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'equipe';
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <Loader size="lg" />;

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/equipe'} replace />;
  }

  return <>{children}</>;
}

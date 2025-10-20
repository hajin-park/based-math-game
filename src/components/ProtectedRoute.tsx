import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireNonGuest?: boolean;
}

export default function ProtectedRoute({ children, requireNonGuest = false }: ProtectedRouteProps) {
  const { user, loading, isGuest } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requireNonGuest && isGuest) {
    return <Navigate to="/signup" replace />;
  }

  return <>{children}</>;
}


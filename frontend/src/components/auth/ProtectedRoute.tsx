import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, fetchMe, user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && !user) { fetchMe().catch(() => {}); }
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (isAuthenticated && !user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  return <>{children}</>;
}

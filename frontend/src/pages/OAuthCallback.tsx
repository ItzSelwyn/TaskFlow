import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Loader2 } from 'lucide-react';

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const { setToken, fetchMe } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (!token) { navigate('/login'); return; }
    setToken(token);
    fetchMe().then(() => navigate('/dashboard')).catch(() => navigate('/login'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { api } from '../lib/api';
import { CheckSquare, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated, fetchMe } = useAuthStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/invite/${token}`);
      return;
    }
    api.post(`/org/invite/${token}/accept`)
      .then(async () => {
        await fetchMe();
        setStatus('success');
        setMessage('You have joined the organization!');
        setTimeout(() => navigate('/dashboard'), 2000);
      })
      .catch((e) => {
        setStatus('error');
        setMessage(e.response?.data?.message || 'Invalid or expired invite');
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-8">
          <CheckSquare className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">TaskFlow</span>
        </div>
        {status === 'loading' && <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />}
        {status === 'success' && <CheckCircle className="h-10 w-10 text-green-400 mx-auto" />}
        {status === 'error' && <XCircle className="h-10 w-10 text-destructive mx-auto" />}
        <p className="text-muted-foreground">{message || 'Processing invite...'}</p>
        {status === 'error' && (
          <button onClick={() => navigate('/dashboard')} className="text-primary text-sm hover:underline">
            Back to dashboard
          </button>
        )}
      </div>
    </div>
  );
}

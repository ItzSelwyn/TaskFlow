import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Loader2, CheckSquare } from 'lucide-react';
import { cn } from '../lib/utils';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  orgName: z.string().min(1, 'Workspace name required'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      await registerUser(data);
      navigate('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <CheckSquare className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">TaskFlow</span>
        </div>

        <h1 className="text-2xl font-semibold mb-1">Create your workspace</h1>
        <p className="text-muted-foreground text-sm mb-8">Get your team up and running in minutes</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</div>
          )}

          {[
            { name: 'name' as const, label: 'Full name', placeholder: 'Alice Johnson', type: 'text' },
            { name: 'email' as const, label: 'Work email', placeholder: 'alice@company.com', type: 'email' },
            { name: 'password' as const, label: 'Password', placeholder: '••••••••', type: 'password' },
            { name: 'orgName' as const, label: 'Workspace name', placeholder: 'Acme Corp', type: 'text' },
          ].map((f) => (
            <div key={f.name}>
              <label className="text-sm font-medium mb-1.5 block">{f.label}</label>
              <input
                {...register(f.name)}
                type={f.type}
                placeholder={f.placeholder}
                className={cn(
                  'w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  errors[f.name] ? 'border-destructive' : 'border-border'
                )}
              />
              {errors[f.name] && <p className="text-xs text-destructive mt-1">{errors[f.name]?.message}</p>}
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Create workspace
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

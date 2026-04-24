import { useEffect, useState } from 'react';
import { subscribeToast } from '../../hooks/useToast';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ToastItem { id: number; message: string; type: 'success' | 'error' | 'info'; }

export default function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    let id = 0;
    return subscribeToast((message, type) => {
      const item = { id: ++id, message, type };
      setToasts((prev) => [...prev, item]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== item.id)), 4000);
    });
  }, []);

  const icons = { success: CheckCircle2, error: XCircle, info: Info };
  const colors = {
    success: 'text-green-400',
    error: 'text-destructive',
    info: 'text-blue-400',
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-lg pointer-events-auto animate-fade-in min-w-64 max-w-sm"
          >
            <Icon className={cn('h-4 w-4 flex-shrink-0', colors[t.type])} />
            <span className="text-sm flex-1">{t.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}>
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

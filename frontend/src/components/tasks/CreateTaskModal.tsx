import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOrg } from '../../hooks/useTasks';
import { X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']).default('TODO'),
  assignedToId: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
  isLoading?: boolean;
}

export default function CreateTaskModal({ open, onClose, onCreate, isLoading }: Props) {
  const { data: org } = useOrg();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'MEDIUM', status: 'TODO' },
  });

  const onSubmit = (data: FormData) => {
    onCreate({
      ...data,
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      assignedToId: data.assignedToId || undefined,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
    });
    reset();
  };

  if (!open) return null;

  const members = org?.members || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold">New task</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <input
              {...register('title')}
              placeholder="Task title"
              autoFocus
              className={cn(
                'w-full text-lg font-medium bg-transparent outline-none border-b pb-2 transition-colors',
                errors.title ? 'border-destructive' : 'border-border focus:border-primary'
              )}
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
          </div>

          <textarea
            {...register('description')}
            placeholder="Add a description..."
            rows={2}
            className="w-full text-sm bg-transparent outline-none text-muted-foreground resize-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
              <select {...register('priority')} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
              <select {...register('status')} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Assign to</label>
              <select {...register('assignedToId')} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                <option value="">Unassigned</option>
                {members.map((m: any) => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Due date</label>
              <input {...register('dueDate')} type="date" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Tags</label>
            <input {...register('tags')} placeholder="frontend, bug, q1" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create task
            </button>
            <button type="button" onClick={onClose} className="px-4 border border-border rounded-lg text-sm hover:bg-accent transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

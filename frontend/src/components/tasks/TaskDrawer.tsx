import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Task } from '../../hooks/useTasks';
import { useOrg } from '../../hooks/useTasks';
import { cn, priorityColors, statusColors, statusLabels, priorityLabels, formatDate } from '../../lib/utils';
import { X, Pencil, Trash2, Calendar, Clock, User, Tag, History } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  task: Task;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const actionLabels: Record<string, string> = {
  TASK_CREATED: 'Created',
  TASK_UPDATED: 'Updated',
  TASK_DELETED: 'Deleted',
  TASK_ASSIGNED: 'Assigned',
  TASK_STATUS_CHANGED: 'Status changed',
};

export default function TaskDrawer({ task, open, onClose, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<'details' | 'history'>('details');
  const { data: org } = useOrg();
  const { register, handleSubmit, reset } = useForm({ defaultValues: task });

  useEffect(() => { reset(task); }, [task]);

  const onSubmit = (data: any) => {
    onUpdate(task.id, {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignedTo: data.assignedTo ? { id: data.assignedTo, name: '', avatarUrl: '' } : undefined,
      dueDate: data.dueDate || undefined,
      tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    });
    setEditing(false);
  };

  const due = formatDate(task.dueDate);
  const members = org?.members || [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-full max-w-lg bg-card border-l border-border flex flex-col h-full shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex gap-1">
            {(['details', 'history'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize',
                  tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t === 'history' ? <span className="flex items-center gap-1"><History className="h-3.5 w-3.5" />History</span> : 'Details'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {!editing && (
              <>
                <button onClick={() => setEditing(true)} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { onDelete(task.id); onClose(); }}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'details' && !editing && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold leading-snug mb-2">{task.title}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className={cn('text-xs font-medium px-2 py-1 rounded-full', priorityColors[task.priority])}>
                    {priorityLabels[task.priority]}
                  </span>
                  <span className={cn('text-xs font-medium px-2 py-1 rounded-full', statusColors[task.status])}>
                    {statusLabels[task.status]}
                  </span>
                </div>
              </div>

              {task.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm leading-relaxed">{task.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <User className="h-3 w-3" /> Assigned to
                  </p>
                  <p className="text-sm">{task.assignedTo?.name || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <User className="h-3 w-3" /> Created by
                  </p>
                  <p className="text-sm">{task.createdBy.name}</p>
                </div>
                {due && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Due date
                    </p>
                    <p className={cn('text-sm', due.overdue && 'text-red-400')}>{due.label}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Created
                  </p>
                  <p className="text-sm">{format(new Date(task.createdAt), 'MMM d, yyyy')}</p>
                </div>
              </div>

              {task.tags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Tags
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick status change */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Quick status update</p>
                <div className="flex flex-wrap gap-2">
                  {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => onUpdate(task.id, { status: s })}
                      className={cn(
                        'text-xs px-3 py-1.5 rounded-full border transition-colors',
                        task.status === s
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {statusLabels[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'details' && editing && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <input {...register('title')} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea {...register('description')} rows={3} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <select {...register('status')} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30">
                    {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Priority</label>
                  <select {...register('priority')} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30">
                    {Object.entries(priorityLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Assign to</label>
                <select {...register('assignedTo')} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Unassigned</option>
                  {members.map((m: any) => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Due date</label>
                <input {...register('dueDate')} type="date" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tags (comma separated)</label>
                <input
                  {...register('tags')}
                  defaultValue={task.tags.join(', ')}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="frontend, bug, q1"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
                  Save changes
                </button>
                <button type="button" onClick={() => setEditing(false)} className="px-4 border border-border rounded-lg text-sm hover:bg-accent transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {tab === 'history' && (
            <div className="space-y-4">
              {(!task.auditLogs || task.auditLogs.length === 0) && (
                <p className="text-muted-foreground text-sm">No history yet.</p>
              )}
              {task.auditLogs?.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0 mt-0.5">
                    {log.actor?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 border-l-2 border-border pl-3 pb-4">
                    <p className="text-sm">
                      <span className="font-medium">{log.actor?.name}</span>
                      {' — '}<span className="text-muted-foreground">{actionLabels[log.action] || log.action}</span>
                    </p>
                    {log.metadata?.changes && (
                      <pre className="text-xs text-muted-foreground mt-1 bg-muted rounded p-2 overflow-auto">
                        {JSON.stringify(log.metadata.changes, null, 2)}
                      </pre>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

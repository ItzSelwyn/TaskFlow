import { useState } from 'react';
import { Task } from '../../hooks/useTasks';
import { cn, priorityColors, statusColors, statusLabels, priorityLabels, formatDate } from '../../lib/utils';
import { Calendar, MoreHorizontal, Pencil, Trash2, User } from 'lucide-react';
import TaskDrawer from './TaskDrawer';

interface Props {
  task: Task;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Task>) => void;
}

export default function TaskCard({ task, onDelete, onUpdate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const due = formatDate(task.dueDate);

  return (
    <>
      <div
        className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer group"
        onClick={() => setDrawerOpen(true)}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', priorityColors[task.priority])}>
              {priorityLabels[task.priority]}
            </span>
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusColors[task.status])}>
              {statusLabels[task.status]}
            </span>
          </div>
          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent transition-all"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                <div className="absolute right-0 top-6 z-50 bg-card border border-border rounded-lg shadow-lg py-1 w-36">
                  <button
                    onClick={(e) => { e.stopPropagation(); setDrawerOpen(true); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(task.id); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-medium text-sm leading-snug mb-3 line-clamp-2">{task.title}</h3>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">#{tag}</span>
            ))}
          </div>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            {task.assignedTo ? (
              <div className="flex items-center gap-1">
                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                  {task.assignedTo.name[0].toUpperCase()}
                </div>
                <span className="text-xs text-muted-foreground">{task.assignedTo.name.split(' ')[0]}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground/50">
                <User className="h-3.5 w-3.5" />
                <span className="text-xs">Unassigned</span>
              </div>
            )}
          </div>
          {due && (
            <div className={cn('flex items-center gap-1', due.overdue ? 'text-red-400' : 'text-muted-foreground')}>
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs">{due.label}</span>
            </div>
          )}
        </div>
      </div>

      <TaskDrawer
        task={task}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </>
  );
}

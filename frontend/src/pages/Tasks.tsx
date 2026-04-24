import { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, Task } from '../hooks/useTasks';
import TaskCard from '../components/tasks/TaskCard';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import { Plus, Search, Filter, Download, LayoutGrid, List, Loader2 } from 'lucide-react';
import { cn, statusLabels } from '../lib/utils';
import { api } from '../lib/api';

type ViewMode = 'list' | 'kanban';

const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const;

export default function TasksPage() {
  const [view, setView] = useState<ViewMode>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useTasks({
    search: search || undefined,
    status: statusFilter as any || undefined,
    priority: priorityFilter as any || undefined,
    page,
  });

  const { mutate: createTask, isPending: creating } = useCreateTask();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();

  const tasks = data?.tasks || [];

  const handleUpdate = (id: string, d: Partial<Task>) => updateTask({ id, ...d });
  const handleDelete = (id: string) => { if (confirm('Delete this task?')) deleteTask(id); };

  const handleExport = async () => {
    const res = await api.get('/tasks/export', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a'); a.href = url; a.download = 'tasks.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="border-b border-border px-6 py-4 flex items-center gap-3 flex-wrap bg-card">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All statuses</option>
            {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All priorities</option>
            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* View toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={cn('p-2 transition-colors', view === 'kanban' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground')}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('p-2 transition-colors', view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground')}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button onClick={handleExport} className="p-2 border border-border rounded-lg hover:bg-accent text-muted-foreground transition-colors" title="Export CSV">
            <Download className="h-4 w-4" />
          </button>

          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New task
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Filter className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">No tasks found</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              {search || statusFilter || priorityFilter ? 'Try adjusting your filters.' : 'Create your first task to get started.'}
            </p>
            <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 mt-2">
              <Plus className="h-4 w-4" /> New task
            </button>
          </div>
        ) : view === 'kanban' ? (
          <KanbanView tasks={tasksByStatus} onUpdate={handleUpdate} onDelete={handleDelete} />
        ) : (
          <ListView tasks={tasks} onUpdate={handleUpdate} onDelete={handleDelete} data={data} page={page} setPage={setPage} />
        )}
      </div>

      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(d) => { createTask(d); setCreateOpen(false); }}
        isLoading={creating}
      />
    </div>
  );
}

function KanbanView({ tasks, onUpdate, onDelete }: { tasks: Record<string, Task[]>; onUpdate: any; onDelete: any }) {
  const colColors: Record<string, string> = {
    TODO: 'border-t-muted-foreground/30',
    IN_PROGRESS: 'border-t-blue-400',
    IN_REVIEW: 'border-t-purple-400',
    DONE: 'border-t-green-400',
  };

  return (
    <div className="flex gap-4 p-6 overflow-x-auto h-full">
      {STATUSES.map((status) => (
        <div key={status} className="flex-shrink-0 w-72 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm">{statusLabels[status]}</h3>
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {tasks[status]?.length || 0}
            </span>
          </div>
          <div className={cn('flex-1 min-h-40 rounded-xl border-t-2 bg-muted/30 p-3 space-y-3 overflow-y-auto', colColors[status])}>
            {tasks[status]?.map((task) => (
              <TaskCard key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ListView({ tasks, onUpdate, onDelete, data, page, setPage }: any) {
  return (
    <div className="p-6 space-y-3">
      {tasks.map((task: Task) => (
        <div key={task.id} className="max-w-4xl">
          <TaskCard task={task} onUpdate={onUpdate} onDelete={onDelete} />
        </div>
      ))}
      {data?.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn('px-3 py-1.5 rounded-lg text-sm transition-colors', p === page ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-accent')}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

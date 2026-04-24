import { useStats, useAuditLogs } from '../hooks/useTasks';
import { useAuthStore } from '../store/auth.store';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, TrendingUp, Activity } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { format } from 'date-fns';

const actionLabels: Record<string, string> = {
  TASK_CREATED: 'created a task',
  TASK_UPDATED: 'updated a task',
  TASK_DELETED: 'deleted a task',
  TASK_ASSIGNED: 'assigned a task',
  TASK_STATUS_CHANGED: 'changed task status',
  MEMBER_INVITED: 'invited a member',
  MEMBER_REMOVED: 'removed a member',
  MEMBER_ROLE_CHANGED: 'changed member role',
  ORG_UPDATED: 'updated organization',
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useStats();
  const { data: audit } = useAuditLogs(1);

  const statusMap: Record<string, number> = {};
  stats?.byStatus?.forEach((s: any) => { statusMap[s.status] = s._count; });

  const statCards = [
    { label: 'Total tasks', value: stats?.totalTasks ?? 0, icon: ListTodo, color: 'text-primary bg-primary/10' },
    { label: 'In progress', value: statusMap['IN_PROGRESS'] ?? 0, icon: TrendingUp, color: 'text-blue-400 bg-blue-400/10' },
    { label: 'Completed', value: statusMap['DONE'] ?? 0, icon: CheckCircle2, color: 'text-green-400 bg-green-400/10' },
    { label: 'Overdue', value: stats?.overdue ?? 0, icon: AlertTriangle, color: 'text-red-400 bg-red-400/10' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's what's happening in your workspace today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">{label}</span>
              <div className={cn('p-2 rounded-lg', color)}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-semibold">
              {isLoading ? <span className="animate-pulse bg-muted rounded w-8 h-7 inline-block" /> : value}
            </p>
          </div>
        ))}
      </div>

      {/* Status breakdown + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status breakdown */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Tasks by status
          </h2>
          <div className="space-y-3">
            {[
              { key: 'TODO', label: 'To Do', color: 'bg-muted-foreground' },
              { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-400' },
              { key: 'IN_REVIEW', label: 'In Review', color: 'bg-purple-400' },
              { key: 'DONE', label: 'Done', color: 'bg-green-400' },
              { key: 'CANCELLED', label: 'Cancelled', color: 'bg-muted-foreground/40' },
            ].map(({ key, label, color }) => {
              const count = statusMap[key] ?? 0;
              const total = stats?.totalTasks || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Recent activity
          </h2>
          <div className="space-y-3">
            {audit?.logs?.length === 0 && (
              <p className="text-muted-foreground text-sm">No activity yet.</p>
            )}
            {audit?.logs?.map((log: any) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0 mt-0.5">
                  {log.actor?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{log.actor?.name}</span>
                    {' '}<span className="text-muted-foreground">{actionLabels[log.action] || log.action}</span>
                    {log.metadata?.title && (
                      <span className="font-medium"> "{log.metadata.title}"</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

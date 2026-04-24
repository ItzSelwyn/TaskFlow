import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useOrg, useAuditLogs } from '../hooks/useTasks';
import { useAuthStore } from '../store/auth.store';
import { api } from '../lib/api';
import { toast } from '../hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import { Mail, UserMinus, Shield, ShieldOff, Loader2, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Settings() {
  const { currentOrg } = useAuthStore();
  const { data: org, isLoading } = useOrg();
  const { data: audit } = useAuditLogs(1);
  const qc = useQueryClient();
  const [tab, setTab] = useState<'general' | 'members' | 'audit'>('general');

  if (isLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>;
  if (!org) return null;

  const isAdmin = currentOrg?.role === 'ADMIN';

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your organization</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['general', 'members', 'audit'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize',
              tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t === 'audit' ? 'Audit log' : t}
          </button>
        ))}
      </div>

      {tab === 'general' && <GeneralTab org={org} isAdmin={isAdmin} qc={qc} />}
      {tab === 'members' && <MembersTab org={org} isAdmin={isAdmin} qc={qc} />}
      {tab === 'audit' && <AuditTab audit={audit} />}
    </div>
  );
}

function GeneralTab({ org, isAdmin, qc }: any) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: { name: org.name, description: org.description || '' } });

  const onSubmit = async (data: any) => {
    await api.patch('/org', data);
    qc.invalidateQueries({ queryKey: ['org'] });
    toast.success('Organization updated');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-semibold">Organization details</h2>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Name</label>
          <input {...register('name')} disabled={!isAdmin} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Description</label>
          <textarea {...register('description')} disabled={!isAdmin} rows={3} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none disabled:opacity-50 disabled:cursor-not-allowed" />
        </div>
        {isAdmin && (
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </button>
        )}
      </div>
    </form>
  );
}

function MembersTab({ org, isAdmin, qc }: any) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: { email: '', role: 'MEMBER' } });
  const { user } = useAuthStore();

  const onInvite = async (data: any) => {
    await api.post('/org/invite', data);
    toast.success('Invite sent!');
    reset();
  };

  const onRemove = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    await api.delete(`/org/members/${userId}`);
    qc.invalidateQueries({ queryKey: ['org'] });
    toast.success('Member removed');
  };

  const onRoleChange = async (userId: string, role: string) => {
    await api.patch(`/org/members/${userId}/role`, { role });
    qc.invalidateQueries({ queryKey: ['org'] });
    toast.success('Role updated');
  };

  return (
    <div className="space-y-6">
      {/* Invite */}
      {isAdmin && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4">Invite member</h2>
          <form onSubmit={handleSubmit(onInvite)} className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input {...register('email', { required: true })} type="email" placeholder="colleague@company.com" className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <select {...register('role')} className="border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none">
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Invite
            </button>
          </form>
        </div>
      )}

      {/* Members list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold">{org.members.length} member{org.members.length !== 1 ? 's' : ''}</h2>
        </div>
        <div className="divide-y divide-border">
          {org.members.map((m: any) => (
            <div key={m.userId} className="flex items-center gap-3 px-5 py-4">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">
                {m.user.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{m.user.name} {m.user.id === user?.id && <span className="text-xs text-muted-foreground">(you)</span>}</p>
                <p className="text-xs text-muted-foreground">{m.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('text-xs px-2 py-1 rounded-full font-medium', m.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                  {m.role.toLowerCase()}
                </span>
                {isAdmin && m.user.id !== user?.id && (
                  <>
                    <button
                      onClick={() => onRoleChange(m.user.id, m.role === 'ADMIN' ? 'MEMBER' : 'ADMIN')}
                      className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      title={m.role === 'ADMIN' ? 'Demote to member' : 'Promote to admin'}
                    >
                      {m.role === 'ADMIN' ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => onRemove(m.user.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Remove member"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuditTab({ audit }: any) {
  const actionLabels: Record<string, string> = {
    TASK_CREATED: 'created a task',
    TASK_UPDATED: 'updated a task',
    TASK_DELETED: 'deleted a task',
    TASK_ASSIGNED: 'assigned a task',
    TASK_STATUS_CHANGED: 'changed task status',
    MEMBER_INVITED: 'invited a member',
    MEMBER_REMOVED: 'removed a member',
    MEMBER_ROLE_CHANGED: 'changed a member role',
    ORG_UPDATED: 'updated the organization',
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-semibold">Audit log</h2>
        <p className="text-xs text-muted-foreground mt-0.5">All organization activity</p>
      </div>
      <div className="divide-y divide-border">
        {(!audit?.logs || audit.logs.length === 0) && (
          <div className="px-5 py-8 text-center text-muted-foreground text-sm">No activity recorded yet.</div>
        )}
        {audit?.logs?.map((log: any) => (
          <div key={log.id} className="flex items-center gap-3 px-5 py-3">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
              {log.actor?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{log.actor?.name}</span>
                {' '}<span className="text-muted-foreground">{actionLabels[log.action] || log.action}</span>
                {log.metadata?.title && <span className="font-medium"> "{log.metadata.title}"</span>}
                {log.metadata?.email && <span className="text-muted-foreground"> ({log.metadata.email})</span>}
              </p>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {format(new Date(log.createdAt), 'MMM d, h:mm a')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

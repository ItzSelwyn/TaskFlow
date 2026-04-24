import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { toast } from '../hooks/useToast';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  tags: string[];
  createdBy: { id: string; name: string; avatarUrl?: string };
  assignedTo?: { id: string; name: string; avatarUrl?: string };
  createdAt: string;
  updatedAt: string;
  auditLogs?: any[];
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assignedToId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const useTasks = (filters: TaskFilters = {}) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null));
      const { data } = await api.get('/tasks', { params });
      return data.data as { tasks: Task[]; total: number; totalPages: number; page: number };
    },
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const { data } = await api.get(`/tasks/${id}`);
      return data.data as Task;
    },
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const res = await api.post('/tasks', data);
      return res.data.data as Task;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Task created');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create task'),
  });
};

export const useUpdateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Task> & { id: string }) => {
      const res = await api.patch(`/tasks/${id}`, data);
      return res.data.data as Task;
    },
    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['tasks', task.id] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Task updated');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update task'),
  });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Task deleted');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete task'),
  });
};

export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await api.get('/org/stats');
      return data.data;
    },
  });
};

export const useOrg = () => {
  return useQuery({
    queryKey: ['org'],
    queryFn: async () => {
      const { data } = await api.get('/org');
      return data.data;
    },
  });
};

export const useAuditLogs = (page = 1) => {
  return useQuery({
    queryKey: ['audit-logs', page],
    queryFn: async () => {
      const { data } = await api.get('/org/audit-logs', { params: { page } });
      return data.data;
    },
  });
};

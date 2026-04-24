import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const priorityColors = {
  LOW: 'text-blue-400 bg-blue-400/10',
  MEDIUM: 'text-yellow-400 bg-yellow-400/10',
  HIGH: 'text-orange-400 bg-orange-400/10',
  URGENT: 'text-red-400 bg-red-400/10',
};

export const statusColors = {
  TODO: 'text-muted-foreground bg-muted',
  IN_PROGRESS: 'text-blue-400 bg-blue-400/10',
  IN_REVIEW: 'text-purple-400 bg-purple-400/10',
  DONE: 'text-green-400 bg-green-400/10',
  CANCELLED: 'text-muted-foreground bg-muted line-through',
};

export const statusLabels = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
};

export const priorityLabels = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const formatDate = (date?: string | null) => {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, overdue: true };
  if (days === 0) return { label: 'Today', overdue: false };
  if (days === 1) return { label: 'Tomorrow', overdue: false };
  return { label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), overdue: false };
};

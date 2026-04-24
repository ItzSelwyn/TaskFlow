// Simple toast utility wrapping browser notifications or a state-based toast
// In the full app this connects to the Radix Toast provider

type ToastType = 'success' | 'error' | 'info';

const listeners: Array<(msg: string, type: ToastType) => void> = [];

export const toast = {
  success: (msg: string) => listeners.forEach((l) => l(msg, 'success')),
  error: (msg: string) => listeners.forEach((l) => l(msg, 'error')),
  info: (msg: string) => listeners.forEach((l) => l(msg, 'info')),
};

export const subscribeToast = (fn: (msg: string, type: ToastType) => void) => {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx > -1) listeners.splice(idx, 1);
  };
};

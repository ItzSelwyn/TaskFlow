import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  theme: 'light' | 'dark';
  toggle: () => void;
  set: (t: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark', next === 'dark');
        set({ theme: next });
      },
      set: (t) => {
        document.documentElement.classList.toggle('dark', t === 'dark');
        set({ theme: t });
      },
    }),
    { name: 'taskflow-theme' }
  )
);

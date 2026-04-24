import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

interface OrgSummary { id: string; name: string; slug: string; role: string; }
interface User { id: string; name: string; email: string; avatarUrl?: string; }

interface AuthState {
  user: User | null;
  currentOrg: { id: string; role: string } | null;
  organizations: OrgSummary[];
  accessToken: string | null;
  isAuthenticated: boolean;

  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; name: string; orgName: string }) => Promise<void>;
  logout: () => Promise<void>;
  switchOrg: (orgId: string) => Promise<void>;
  fetchMe: () => Promise<void>;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      currentOrg: null,
      organizations: [],
      accessToken: null,
      isAuthenticated: false,

      setToken: (token: string) => {
        localStorage.setItem('accessToken', token);
        set({ accessToken: token, isAuthenticated: true });
      },

      login: async (data) => {
        const res = await api.post('/auth/login', data);
        const { accessToken, user, organization, organizations } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        set({
          accessToken,
          user,
          currentOrg: { id: organization.id, role: organizations.find((o: OrgSummary) => o.id === organization.id)?.role || 'MEMBER' },
          organizations,
          isAuthenticated: true,
        });
      },

      register: async (data) => {
        const res = await api.post('/auth/register', data);
        const { accessToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        set({ accessToken, isAuthenticated: true });
        await get().fetchMe();
      },

      logout: async () => {
        await api.post('/auth/logout').catch(() => {});
        localStorage.removeItem('accessToken');
        set({ user: null, currentOrg: null, organizations: [], accessToken: null, isAuthenticated: false });
      },

      switchOrg: async (orgId) => {
        const res = await api.post('/auth/switch-org', { orgId });
        const { accessToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        set({ accessToken });
        await get().fetchMe();
      },

      fetchMe: async () => {
        const res = await api.get('/auth/me');
        const { user, currentOrg, organizations } = res.data.data;
        set({ user, currentOrg, organizations, isAuthenticated: true });
      },
    }),
    {
      name: 'taskflow-auth',
      partialize: (s) => ({ accessToken: s.accessToken, isAuthenticated: s.isAuthenticated }),
    }
  )
);

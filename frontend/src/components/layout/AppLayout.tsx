import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useThemeStore } from '../../store/theme.store';
import { useSocket } from '../../hooks/useSocket';
import {
  CheckSquare, LayoutDashboard, ListTodo, Settings, LogOut,
  Moon, Sun, ChevronDown, Menu, X, Bell, Building2
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout() {
  const { user, currentOrg, organizations, logout, switchOrg } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);

  useSocket();

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentOrgData = organizations.find(o => o.id === currentOrg?.id);

  const Sidebar = ({ mobile = false }) => (
    <div className={cn(
      'flex flex-col h-full',
      mobile ? 'p-4' : 'p-4'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-6">
        <CheckSquare className="h-5 w-5 text-primary flex-shrink-0" />
        <span className="font-semibold text-base">TaskFlow</span>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Org switcher */}
      <div className="relative mb-6">
        <button
          onClick={() => setOrgMenuOpen(!orgMenuOpen)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent text-sm transition-colors border border-border"
        >
          <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="flex-1 text-left truncate font-medium">{currentOrgData?.name || 'My Org'}</span>
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', orgMenuOpen && 'rotate-180')} />
        </button>
        {orgMenuOpen && (
          <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={async () => { await switchOrg(org.id); setOrgMenuOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors',
                  org.id === currentOrg?.id && 'bg-primary/10 text-primary'
                )}
              >
                <div className="h-5 w-5 rounded bg-primary/20 flex items-center justify-center">
                  <Building2 className="h-3 w-3 text-primary" />
                </div>
                <span className="flex-1 text-left truncate">{org.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{org.role.toLowerCase()}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border pt-4 space-y-1">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>

        {/* User */}
        <div className="flex items-center gap-2 px-3 py-2 mt-2">
          <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{currentOrg?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-card border-r border-border">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span className="font-semibold">TaskFlow</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

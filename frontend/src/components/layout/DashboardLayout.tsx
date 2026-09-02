import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuthStore } from '../../stores/authStore';
import { Database, ShieldCheck, Zap } from 'lucide-react';

export default function DashboardLayout() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  // Get current page title from path
  const pathName = location.pathname.split('/').pop() || 'overview';
  const pageTitle = pathName.replace('-', ' ').toUpperCase();

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar Header */}
        <header className="h-16 glass-panel border-b border-white/5 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wider text-foreground">{pageTitle}</h2>
              <p className="text-[11px] text-muted-foreground">Workspace de Gestión de Equipos</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-neon-green/30 text-neon-green text-xs font-semibold">
              <Database className="w-3.5 h-3.5 animate-pulse-soft" />
              <span>Sistema Online</span>
            </div>

            {/* User Quick Info */}
            <div className="flex items-center gap-2 pl-3 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-cyan to-neon-magenta flex items-center justify-center text-background font-bold text-xs shadow-md">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-neon-cyan inline" />
                  Autenticado
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuthStore } from '../../stores/authStore';
import { Database, ShieldCheck, Zap, Menu } from 'lucide-react';

export default function DashboardLayout() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get current page title from path
  const pathName = location.pathname.split('/').pop() || 'overview';
  const pageTitle = pathName.replace('-', ' ').toUpperCase();

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Sidebar with Mobile Drawer support */}
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar Header */}
        <header className="h-16 glass-panel border-b border-white/5 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl glass-panel border border-[#7B7F8A]/30 flex items-center justify-center text-[#E9E6E7] hover:text-[#AB978C] hover:bg-white/5"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-8 h-8 rounded-lg bg-[#AB978C]/15 border border-[#AB978C]/30 flex items-center justify-center text-[#AB978C] glow-bronze">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wider text-foreground">{pageTitle}</h2>
              <p className="text-[11px] text-[#7B7F8A]">Workspace de Gestión de Equipos</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-[#6B7C98]/30 text-[#6B7C98] text-xs font-semibold">
              <Database className="w-3.5 h-3.5 text-[#6B7C98] animate-pulse-soft" />
              <span>Sistema Online</span>
            </div>

            {/* User Quick Info */}
            <div className="flex items-center gap-2 pl-3 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#AB978C] to-[#6B7C98] flex items-center justify-center text-[#0E1015] font-extrabold text-xs shadow-md glow-bronze">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-[10px] text-[#7B7F8A] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#AB978C] inline" />
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

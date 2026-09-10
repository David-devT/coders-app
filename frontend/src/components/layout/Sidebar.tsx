import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '@/components/ui/button';
import { Code2, Shield, Users, ListTodo, LogOut, Terminal, X } from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = 'role' in (user || {}) && (user as { role: string }).role === 'admin';
  const isTeamLeader = 'role' in (user || {}) && (user as { role: string }).role === 'teamLeader';
  const roleLabel = isAdmin ? 'Admin' : isTeamLeader ? 'Team Leader' : 'Coder';

  const roleBadgeClass = isAdmin
    ? 'bg-[#AB978C]/15 text-[#AB978C] border-[#AB978C]/30'
    : isTeamLeader
    ? 'bg-[#6B7C98]/20 text-[#6B7C98] border-[#6B7C98]/35'
    : 'bg-[#7B7F8A]/15 text-[#E9E6E7] border-[#7B7F8A]/30';

  const links = [
    { to: '/dashboard/coders', label: 'Coders', icon: Code2 },
    { to: '/dashboard/clans', label: 'Clans', icon: Shield },
    { to: '/dashboard/tasks', label: 'Task Board', icon: ListTodo },
    { to: '/dashboard/team-leaders', label: 'Team Leaders', icon: Users, adminOnly: true },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`w-64 glass-panel border-r border-white/5 flex flex-col z-50 shrink-0 fixed inset-y-0 left-0 transition-transform duration-300 md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#AB978C] to-[#6B7C98] flex items-center justify-center text-[#0E1015] font-extrabold shadow-lg glow-bronze">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-wide text-foreground">CODERS<span className="text-[#AB978C]">.APP</span></h1>
              <p className="text-[10px] text-[#7B7F8A] tracking-widest uppercase">Gestión de Equipos</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

      {/* User Profile Card */}
      <div className="p-4 mx-3 my-3 rounded-xl glass-card border border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#AB978C]/15 border border-[#AB978C]/30 flex items-center justify-center shrink-0">
          <span className="font-extrabold text-[#AB978C] text-base">
            {user?.name?.charAt(0) || '?'}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-xs text-foreground truncate">{user?.name}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleBadgeClass}`}>
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {links
          .filter((l) => !l.adminOnly || isAdmin)
          .map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#AB978C]/15 text-[#AB978C] border border-[#AB978C]/35 glow-bronze font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <link.icon className="w-4 h-4 shrink-0" />
              {link.label}
            </NavLink>
          ))}
      </nav>

      {/* Logout Footer */}
      <div className="p-3 border-t border-white/5">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  </>
  );
}

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '@/components/ui/button';
import { Code2, Shield, Users, ListTodo, LogOut, Terminal } from 'lucide-react';

export default function Sidebar() {
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
    ? 'bg-neon-green/15 text-neon-green border-neon-green/30'
    : isTeamLeader
    ? 'bg-neon-magenta/15 text-neon-magenta border-neon-magenta/30'
    : 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30';

  const links = [
    { to: '/dashboard/coders', label: 'Coders', icon: Code2 },
    { to: '/dashboard/clans', label: 'Clans', icon: Shield },
    { to: '/dashboard/tasks', label: 'Task Board', icon: ListTodo },
    { to: '/dashboard/team-leaders', label: 'Team Leaders', icon: Users, adminOnly: true },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-white/5 flex flex-col z-20 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-cyan to-blue-600 flex items-center justify-center text-background font-extrabold shadow-lg glow-cyan">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wide text-foreground">CODERS<span className="text-neon-cyan">.APP</span></h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Gestión de Equipos</p>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="p-4 mx-3 my-3 rounded-xl glass-card border border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center shrink-0">
          <span className="font-extrabold text-neon-cyan text-base">
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
                    ? 'bg-gradient-to-r from-neon-cyan/20 to-blue-600/10 text-neon-cyan border border-neon-cyan/40 glow-cyan font-bold'
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
  );
}

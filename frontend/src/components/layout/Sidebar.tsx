import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '@/components/ui/button';
import { Code, Shield, Users, LogOut } from 'lucide-react';

// Sidebar de navegación: muestra links según rol del usuario y opción de logout
export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determinar si el usuario es admin para filtrar items del menú
  const isAdmin = 'role' in (user || {}) && (user as { role: string }).role === 'admin';

  // Items de navegación (teamLeaders solo visible para admins)
  const links = [
    { to: '/dashboard/coders', label: 'Coders', icon: Code },
    { to: '/dashboard/clans', label: 'Clans', icon: Shield },
    { to: '/dashboard/team-leaders', label: 'Team Leaders', icon: Users, adminOnly: true },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Perfil del usuario en la cabecera del sidebar */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center glow-cyan">
            <span className="font-bold text-neon-cyan text-lg">
              {user?.name?.charAt(0) || '?'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-neon-cyan">
              {isAdmin ? 'Admin' : 'Team Leader'}
            </p>
          </div>
        </div>
      </div>

      {/* Links de navegación filtrados por rol */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {links
          .filter((l) => !l.adminOnly || isAdmin)
          .map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 glow-cyan'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent'
                }`
              }
            >
              <link.icon className="w-4 h-4 shrink-0" />
              {link.label}
            </NavLink>
          ))}
      </nav>

      {/* Botón de logout en la parte inferior */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

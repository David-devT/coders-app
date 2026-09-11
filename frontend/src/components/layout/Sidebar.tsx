import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '@/components/ui/button';
import { Code2, Shield, Users, ListTodo, LogOut, Terminal, X } from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

// Barra lateral de navegación principal con control de acceso por roles (RBAC)
export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Cierra sesión del usuario y redirige al formulario de inicio de sesión
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Identificación de permisos de usuario actual
  const isAdmin = 'role' in (user || {}) && (user as { role: string }).role === 'admin';
  const isTeamLeader = 'role' in (user || {}) && (user as { role: string }).role === 'teamLeader';
  const roleLabel = isAdmin ? 'Admin' : isTeamLeader ? 'Team Leader' : 'Coder';

  // Clases cosméticas de la insignia de rol en la paleta Urban Slate
  const roleBadgeClass = isAdmin
    ? 'bg-[#AB978C]/15 text-[#AB978C] border-[#AB978C]/30'
    : isTeamLeader
    ? 'bg-[#6B7C98]/20 text-[#6B7C98] border-[#6B7C98]/35'
    : 'bg-[#7B7F8A]/15 text-[#E9E6E7] border-[#7B7F8A]/30';

  // Definición de enlaces de navegación interna
  const links = [
    { to: '/dashboard/coders', label: 'Coders', icon: Code2 },
    { to: '/dashboard/clans', label: 'Clans', icon: Shield },
    { to: '/dashboard/tasks', label: 'Task Board', icon: ListTodo },
    { to: '/dashboard/team-leaders', label: 'Team Leaders', icon: Users, adminOnly: true },
  ];

  return (
    <>
      {/* Capa de fondo oscuro para menú móvil desplegado */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Contenedor principal de la barra lateral */}
      <aside
        className={`w-64 glass-panel border-r border-white/5 flex flex-col z-50 shrink-0 fixed inset-y-0 left-0 transition-transform duration-300 md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Encabezado con logotipo de la marca */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#AB978C] to-[#6B7C98] flex items-center justify-center text-[#0E1015] font-extrabold shadow-lg glow-bronze">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-wide text-foreground font-mono">coders<span className="text-[#AB978C]">-app</span></h1>
              <p className="text-[10px] text-[#7B7F8A] tracking-widest uppercase">Gestión de Equipos</p>
            </div>
          </div>
          {/* Botón de cierre para vista en móviles */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

      {/* Tarjeta de perfil del usuario conectado */}
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

      {/* Menú de enlaces de navegación con filtrado condicional por rol */}
      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-[#7B7F8A]">
          Navegación Principal
        </div>
        {links
          .filter((link) => !link.adminOnly || isAdmin)
          .map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#AB978C]/20 via-[#AB978C]/10 to-transparent text-[#AB978C] border border-[#AB978C]/30 shadow-[0_4px_20px_rgba(171,151,140,0.12)] font-bold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-[#AB978C]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-[#AB978C] drop-shadow-[0_0_8px_rgba(171,151,140,0.4)]' : 'text-[#7B7F8A] group-hover:text-foreground'}`} />
                  <span className="truncate">{link.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#AB978C] shadow-[0_0_6px_#AB978C]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
      </nav>

      {/* Pie con botón de cierre de sesión */}
      <div className="p-3 border-t border-white/5 bg-white/[0.01]">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10 text-xs font-semibold text-muted-foreground hover:text-[#E05252] hover:bg-[#E05252]/10 rounded-xl transition-all duration-150 group"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-[#7B7F8A] group-hover:text-[#E05252]" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  </>
  );
}


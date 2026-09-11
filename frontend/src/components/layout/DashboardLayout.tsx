import { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { useAuthStore } from '../../stores/authStore';
import {
  Database,
  ShieldCheck,
  Zap,
  Menu,
  ChevronDown,
  LogOut,
  ListTodo,
  Code2,
  Shield,
} from 'lucide-react';

// Estructura general de la interfaz administrativa con barra lateral, cabecera y menús desplegables
export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Determina el título de la vista según el segmento de la URL activa
  const pathName = location.pathname.split('/').pop() || 'overview';
  const pageTitle = pathName.replace('-', ' ').toUpperCase();

  // Controla el cierre del menú de usuario al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  // Maneja el cierre de sesión y redirección
  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  // Identificación de permisos de usuario actual
  const userRole = 'role' in (user || {}) ? (user as { role: string }).role : 'coder';
  const roleLabel = userRole === 'admin' ? 'Administrador' : userRole === 'teamLeader' ? 'Team Leader' : 'Coder';
  const roleBadgeClass =
    userRole === 'admin'
      ? 'bg-[#AB978C]/15 text-[#AB978C] border-[#AB978C]/30'
      : userRole === 'teamLeader'
      ? 'bg-[#6B7C98]/20 text-[#6B7C98] border-[#6B7C98]/35'
      : 'bg-[#7B7F8A]/15 text-[#E9E6E7] border-[#7B7F8A]/30';

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Barra lateral con soporte para menú desplegable en móviles */}
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      {/* Área de trabajo y contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Barra superior con título de sección e información de usuario con contexto de apilamiento z-40 */}
        <header className="h-16 glass-panel border-b border-white/5 px-4 sm:px-6 flex items-center justify-between shrink-0 relative z-40">
          <div className="flex items-center gap-3">
            {/* Botón hamburguesa para abrir navegación en dispositivos móviles */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl glass-panel border border-[#7B7F8A]/30 flex items-center justify-center text-[#E9E6E7] hover:text-[#AB978C] hover:bg-white/5 transition-colors"
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
            {/* Indicador de estado de conexión del sistema */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-[#6B7C98]/30 text-[#6B7C98] text-xs font-semibold">
              <Database className="w-3.5 h-3.5 text-[#6B7C98] animate-pulse-soft" />
              <span>Sistema Online</span>
            </div>

            {/* Campana interactiva de notificaciones del usuario */}
            <NotificationBell />

            {/* Menú desplegable interactivo del perfil de usuario */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 pl-3 py-1 pr-1.5 border-l border-white/10 rounded-xl hover:bg-white/5 transition-all text-left group cursor-pointer"
                title="Menú de cuenta"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#AB978C] to-[#6B7C98] flex items-center justify-center text-[#0E1015] font-extrabold text-xs shadow-md glow-bronze group-hover:scale-105 transition-transform">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate group-hover:text-[#AB978C] transition-colors">
                    {user?.name}
                  </p>
                  <p className="text-[10px] text-[#7B7F8A] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#AB978C] inline" />
                    {roleLabel}
                  </p>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#7B7F8A] transition-transform duration-200 ${
                    userMenuOpen ? 'rotate-180 text-[#AB978C]' : 'group-hover:text-foreground'
                  }`}
                />
              </button>

              {/* Panel flotante del menú de usuario */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-3 z-50 animate-in fade-in-0 zoom-in-95 bg-[#14171E] text-foreground ring-1 ring-white/10 border-t-[#AB978C]/40">
                  {/* Encabezado del menú con datos del usuario */}
                  <div className="p-2.5 mb-2 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#AB978C]/15 border border-[#AB978C]/30 flex items-center justify-center text-[#AB978C] font-extrabold text-sm">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate">{user?.name}</p>
                        <p className="text-[11px] text-[#7B7F8A] truncate">{user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Rol Actual</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleBadgeClass}`}>
                        {roleLabel}
                      </span>
                    </div>
                  </div>

                  {/* Accesos rápidos de navegación en el menú */}
                  <div className="space-y-0.5 pb-2 mb-2 border-b border-white/10">
                    <Link
                      to="/dashboard/tasks"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-[#AB978C]/10 transition-colors"
                    >
                      <ListTodo className="w-4 h-4 text-[#AB978C]" />
                      Tablero Kanban
                    </Link>
                    <Link
                      to="/dashboard/coders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-[#AB978C]/10 transition-colors"
                    >
                      <Code2 className="w-4 h-4 text-[#6B7C98]" />
                      Directorio de Coders
                    </Link>
                    <Link
                      to="/dashboard/clans"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-[#AB978C]/10 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-[#7B7F8A]" />
                      Clanes Registrados
                    </Link>
                  </div>

                  {/* Botón de cierre de sesión */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-[#E05252] hover:bg-[#E05252]/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-[#E05252]/80" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenedor dinámico donde se renderizan las rutas hijas */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


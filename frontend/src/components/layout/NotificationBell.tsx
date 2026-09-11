import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '../../hooks/useNotifications';

// Icono según la categoría de notificación
const typeIcons = {
  info: <Info className="w-3.5 h-3.5 text-[#6B7C98]" />,
  success: <CheckCircle2 className="w-3.5 h-3.5 text-[#AB978C]" />,
  warning: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
  alert: <AlertTriangle className="w-3.5 h-3.5 text-destructive" />,
};

// Componente interactivo de campana y panel de notificaciones
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } =
    useNotifications();

  // Cierra el menú desplegable al hacer clic fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Formatea la fecha de emisión de la notificación
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // Filtra las notificaciones según la pestaña seleccionada
  const displayedNotifications =
    activeTab === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de la campana con contador de notificaciones pendientes */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
        title="Notificaciones"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#AB978C] text-[#0E1015] font-extrabold text-[10px] flex items-center justify-center animate-pulse shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Menú desplegable con listado de notificaciones */}
      {open && (
        <div className="fixed right-3 left-3 sm:left-auto top-16 sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-96 max-w-sm sm:max-w-none mx-auto sm:mx-0 rounded-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-3 sm:p-3.5 z-50 animate-in fade-in-0 zoom-in-95 bg-[#14171E] text-foreground ring-1 ring-white/10 border-t-[#AB978C]/40">
          {/* Cabecera del panel de notificaciones con acciones masivas */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-white/10 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-foreground">Notificaciones</span>
              {unreadCount > 0 && (
                <Badge variant="outline" className="text-[10px] bg-[#AB978C]/20 text-[#AB978C] border-[#AB978C]/40 px-1.5 py-0 font-bold">
                  {unreadCount} nuevas
                </Badge>
              )}
            </div>

            {/* Botones de acción masiva: Marcar leídas y Borrar todas */}
            <div className="flex items-center gap-1 shrink-0">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsRead.mutate()}
                  className="h-8 sm:h-7 text-[10px] text-muted-foreground hover:text-[#AB978C] hover:bg-[#AB978C]/10 px-2 rounded-lg font-semibold cursor-pointer"
                  disabled={markAllAsRead.isPending}
                  title="Marcar todas como leídas"
                >
                  <CheckCheck className="w-3.5 h-3.5 mr-1 text-[#AB978C]" />
                  <span className="hidden sm:inline">Marcar leídas</span>
                </Button>
              )}

              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearAll.mutate()}
                  className="h-8 sm:h-7 text-[10px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2 rounded-lg font-semibold cursor-pointer"
                  disabled={clearAll.isPending}
                  title="Borrar todas las notificaciones"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:mr-1 text-destructive/80" />
                  <span className="hidden sm:inline">Borrar todas</span>
                </Button>
              )}
            </div>
          </div>

          {/* Selector de pestañas para filtrar: Todas vs No Leídas */}
          {notifications.length > 0 && (
            <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/5 mb-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1.5 sm:py-1 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#AB978C]/20 text-[#AB978C] shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Todas ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('unread')}
                className={`flex-1 py-1.5 sm:py-1 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'unread'
                    ? 'bg-[#AB978C]/20 text-[#AB978C] shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                No leídas ({unreadCount})
              </button>
            </div>
          )}

          {/* Lista de notificaciones con texto completo y opción de borrado individual */}
          <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1 touch-scroll">
            {displayedNotifications.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <Bell className="w-6 h-6 mx-auto mb-2 text-muted-foreground/40" />
                <p>
                  {activeTab === 'unread'
                    ? 'No tienes notificaciones sin leer'
                    : 'No tienes notificaciones pendientes'}
                </p>
              </div>
            ) : (
              displayedNotifications.map((n) => (

                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.read) markAsRead.mutate(n.id);
                  }}
                  className={`group relative p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                    n.read
                      ? 'bg-[#1C2029]/80 border-white/5 text-muted-foreground hover:text-foreground hover:bg-[#1C2029]'
                      : 'border-[#AB978C]/40 bg-[#AB978C]/10 text-foreground hover:bg-[#AB978C]/15 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {typeIcons[n.type] || typeIcons.info}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className={`text-xs truncate ${n.read ? 'font-medium text-foreground/80' : 'font-bold text-foreground'}`}>
                          {n.title}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-[#6B7C98]" />
                            {formatTime(n.createdAt)}
                          </span>

                          {/* Botón para eliminar notificación individual con área táctil cómoda */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification.mutate(n.id);
                            }}
                            title="Eliminar notificación"
                            className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/15 transition-colors sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center touch-manipulation"
                            disabled={deleteNotification.isPending}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${n.read ? 'text-muted-foreground' : 'text-[#E9E6E7]'}`}>
                        {n.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}


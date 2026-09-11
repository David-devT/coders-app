import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  Shield,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trash2,
  MessageSquare,
  Pin,
  ExternalLink,
  History,
  GitPullRequest,
} from 'lucide-react';
import type { Task, TaskStatus } from '../../types';
import { useAuthStore } from '../../stores/authStore';

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (taskId: string, status: TaskStatus, feedback?: string | null) => void;
  onDelete?: (taskId: string) => void;
}

// Estilos cromáticos de prioridad
const priorityStyles = {
  low: 'bg-[#7B7F8A]/20 text-[#E9E6E7] border-[#7B7F8A]/35',
  medium: 'bg-[#AB978C]/20 text-[#AB978C] border-[#AB978C]/35',
  high: 'bg-[#E05252]/20 text-[#E05252] border-[#E05252]/35',
};

// Estilos cromáticos de estado
const statusStyles: Record<TaskStatus, { label: string; class: string }> = {
  pending: { label: 'Pending', class: 'bg-[#5E5653]/25 text-[#E9E6E7] border-[#7B7F8A]/30' },
  review: { label: 'In Review', class: 'bg-[#6B7C98]/20 text-[#6B7C98] border-[#6B7C98]/35' },
  approved: { label: 'Approved', class: 'bg-[#AB978C]/20 text-[#AB978C] border-[#AB978C]/35' },
  rejected: { label: 'Rejected', class: 'bg-[#E05252]/15 text-[#E05252] border-[#E05252]/30' },
};

// Calcula los días restantes o vencimiento de la fecha límite
function getDueStatus(dueDateStr?: string | null) {
  if (!dueDateStr) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dueDateStr);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Atrasada (${Math.abs(diffDays)}d)`,
      color: 'bg-destructive/20 text-destructive border-destructive/40',
      urgent: true,
    };
  }
  if (diffDays === 0) {
    return {
      label: 'Vence hoy',
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      urgent: true,
    };
  }
  if (diffDays === 1) {
    return {
      label: 'Vence mañana',
      color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      urgent: false,
    };
  }
  return {
    label: `Vence en ${diffDays} días`,
    color: 'bg-[#6B7C98]/15 text-[#6B7C98] border-[#6B7C98]/30',
    urgent: false,
  };
}

// Modal interactivo con el detalle completo, notas de revisión y acciones directas
export default function TaskDetailModal({
  task,
  open,
  onClose,
  onStatusChange,
  onDelete,
}: TaskDetailModalProps) {
  const user = useAuthStore((s) => s.user);
  const isAdmin = 'role' in (user || {}) && (user as { role: string }).role === 'admin';
  const isTeamLeader = 'role' in (user || {}) && (user as { role: string }).role === 'teamLeader';

  const [feedbackText, setFeedbackText] = useState('');

  // Limpia el campo de notas cada vez que cambia la tarea
  useEffect(() => {
    setFeedbackText(task?.feedback || '');
  }, [task]);

  if (!task) return null;

  const isAssignee = !!user?.id && task.assignee?.id === user.id;
  const canMarkForReview = isAssignee || isAdmin;
  const canApproveOrReject = isAdmin || isTeamLeader;
  const canReopen = isAdmin || isTeamLeader;

  const dueInfo = getDueStatus(task.dueDate);

  const handleAction = (status: TaskStatus) => {
    onStatusChange(task.id, status, feedbackText.trim() || null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 p-6 rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          {/* Cabecera con insignias de estado, prioridad y clan */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${statusStyles[task.status].class}`}>
              {statusStyles[task.status].label}
            </Badge>

            <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${priorityStyles[task.priority]}`}>
              {task.priority === 'high' && <Pin className="w-2.5 h-2.5 mr-1 inline" />}
              {task.priority} Priority
            </Badge>

            {task.clan && (
              <span className="text-[11px] font-semibold text-[#6B7C98] flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#14171E] border border-[#6B7C98]/30">
                <Shield className="w-3 h-3" />
                {task.clan.name}
              </span>
            )}
          </div>

          <DialogTitle className="text-xl font-bold text-foreground leading-snug pt-1">
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Descripción completa */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Descripción
            </h4>
            <p className="text-xs text-foreground/90 leading-relaxed p-3 rounded-xl glass-panel border-white/5 whitespace-pre-wrap">
              {task.description || <span className="italic text-muted-foreground">Sin descripción detallada</span>}
            </p>
          </div>

          {/* Metadatos: Asignado, Fecha de Registro y Fecha Límite */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl glass-panel border-white/5 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3 text-[#AB978C]" /> Asignado a
              </span>
              <p className="font-semibold text-foreground truncate">
                {task.assignee?.name || 'Sin Asignar'}
              </p>
              {task.assignee?.email && (
                <p className="text-[10px] text-muted-foreground truncate">{task.assignee.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#6B7C98]" /> Fecha Límite
              </span>
              {task.dueDate ? (
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    {new Date(task.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {dueInfo && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${dueInfo.color}`}>
                      {dueInfo.urgent && <AlertTriangle className="w-2.5 h-2.5" />}
                      {dueInfo.label}
                    </span>
                  )}
                </div>
              ) : (
                <p className="italic text-muted-foreground text-[11px]">Sin fecha límite</p>
              )}
            </div>
          </div>

          {/* Enlace al repositorio o Pull Request de GitHub si fue provisto */}
          {task.githubUrl && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-[#AB978C]" />
                <span className="font-semibold text-foreground">Código / PR en GitHub:</span>
              </div>
              <a
                href={task.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#AB978C]/15 text-[#AB978C] hover:bg-[#AB978C]/25 text-xs font-bold transition-colors border border-[#AB978C]/30"
              >
                Abrir en GitHub <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Sección de Feedback / Notas de revisión del Team Leader */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#AB978C]" />
              Notas de Revisión / Feedback
            </h4>

            {/* Visualización de notas existentes */}
            {task.feedback ? (
              <div className="p-3 rounded-xl bg-[#AB978C]/10 border border-[#AB978C]/25 text-xs text-[#E9E6E7] mb-2">
                <p className="text-[10px] font-bold text-[#AB978C] uppercase tracking-wider mb-1">Última Nota del TL:</p>
                <p className="italic leading-relaxed">{task.feedback}</p>
              </div>
            ) : (
              task.status !== 'review' && (
                <p className="text-[11px] text-muted-foreground/70 italic mb-2">Sin notas de revisión registradas</p>
              )
            )}

            {/* Input para agregar notas al aprobar o rechazar (para TL y Admin) */}
            {canApproveOrReject && task.status === 'review' && (
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-semibold">
                  Escribe un comentario o motivo de retroalimentación:
                </label>
                <textarea
                  placeholder="Ej: Aprobado satisfactoriamente. / Corregir validaciones antes de aprobar."
                  value={feedbackText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedbackText(e.target.value)}
                  className="w-full p-2.5 glass-input text-xs min-h-[70px] rounded-xl resize-none text-foreground focus:border-[#AB978C] focus:ring-1 focus:ring-[#AB978C]/30 bg-[#14171E]"
                />
              </div>
            )}
          </div>

          {/* Historial cronológico de cambios y estados (Audit Trail) */}
          {task.history && task.history.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#6B7C98]" />
                Historial de Cambios / Trazabilidad
              </h4>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {task.history.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-xs flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[9px] uppercase px-1.5 py-0 rounded ${statusStyles[item.status]?.class || ''}`}>
                          {statusStyles[item.status]?.label || item.status}
                        </Badge>
                        <span className="font-semibold text-foreground text-[11px]">{item.changedBy?.name || 'Usuario'}</span>
                        <span className="text-[10px] text-muted-foreground">({item.changedBy?.role || 'rol'})</span>
                      </div>
                      {item.feedback && (
                        <p className="text-[11px] italic text-[#AB978C] pl-1 border-l-2 border-[#AB978C]/40 mt-1">
                          "{item.feedback}"
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Barra de acciones contextuadas */}
          <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2 justify-end">
            {task.status === 'pending' && canMarkForReview && (
              <Button
                className="bg-[#6B7C98] hover:bg-[#6B7C98]/90 text-white text-xs font-bold rounded-xl h-9"
                onClick={() => handleAction('review')}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Enviar a Review
              </Button>
            )}

            {task.status === 'review' && canApproveOrReject && (
              <>
                <Button
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/15 text-xs font-bold rounded-xl h-9"
                  onClick={() => handleAction('rejected')}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1.5" /> Rechazar
                </Button>
                <Button
                  className="bg-[#AB978C] hover:bg-[#AB978C]/90 text-[#0E1015] text-xs font-bold rounded-xl h-9 shadow-lg glow-bronze"
                  onClick={() => handleAction('approved')}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Aprobar Tarea
                </Button>
              </>
            )}

            {task.status === 'rejected' && canReopen && (
              <Button
                variant="outline"
                className="border-amber-500/40 text-amber-400 hover:bg-amber-500/15 text-xs font-bold rounded-xl h-9"
                onClick={() => handleAction('pending')}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reabrir Tarea
              </Button>
            )}

            {isAdmin && onDelete && (
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs font-semibold rounded-xl h-9 mr-auto"
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Eliminar
              </Button>
            )}

            <Button
              variant="outline"
              className="border-white/10 glass-panel text-xs rounded-xl h-9"
              onClick={onClose}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

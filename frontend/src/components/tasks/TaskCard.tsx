import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, CheckCircle2, XCircle, Pin, Trash2, RotateCcw, Shield } from 'lucide-react';
import type { Task, TaskStatus } from '../../types';
import { useAuthStore } from '../../stores/authStore';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
}

const priorityStyles = {
  low: 'bg-[#7B7F8A]/20 text-[#E9E6E7] border-[#7B7F8A]/35',
  medium: 'bg-[#AB978C]/20 text-[#AB978C] border-[#AB978C]/35',
  high: 'bg-[#E05252]/20 text-[#E05252] border-[#E05252]/35',
};

const priorityAccentTop = {
  low: 'before:bg-[#7B7F8A]',
  medium: 'before:bg-[#AB978C]',
  high: 'before:bg-[#E05252]',
};

export default function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const user = useAuthStore((s) => s.user);
  const isAdmin = 'role' in (user || {}) && (user as { role: string }).role === 'admin';
  const isTeamLeader = 'role' in (user || {}) && (user as { role: string }).role === 'teamLeader';

  const isAssignee = !!user?.id && task.assignee?.id === user.id;
  const canMarkForReview = isAssignee || isAdmin;
  const canApproveOrReject = isAdmin || isTeamLeader;
  const canReopen = isAdmin || isTeamLeader;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const canDrag = canMarkForReview || canApproveOrReject || canReopen;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card
      draggable={canDrag}
      onDragStart={handleDragStart}
      className={`glass-card relative overflow-hidden border-white/5 hover:border-[#AB978C]/40 hover:-translate-y-0.5 transition-all duration-200 group before:absolute before:top-0 before:left-0 before:right-0 before:h-1 ${
        canDrag ? 'cursor-grab active:cursor-grabbing' : ''
      } ${priorityAccentTop[task.priority]}`}
    >
      <CardContent className="p-3.5 space-y-2.5">
        {/* Header: Priority + Date + Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase ${priorityStyles[task.priority]}`}>
              {task.priority === 'high' && <Pin className="w-2.5 h-2.5 mr-1 inline" />}
              {task.priority}
            </Badge>
            {task.clan && (
              <span className="text-[10px] font-semibold text-[#6B7C98] flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#14171E] border border-[#6B7C98]/30">
                <Shield className="w-2.5 h-2.5" />
                {task.clan.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              {formatDate(task.createdAt)}
            </span>
            {isAdmin && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                onClick={() => onDelete(task.id)}
                title="Eliminar Task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="font-bold text-sm text-foreground leading-snug group-hover:text-[#AB978C] transition-colors">
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Assignee Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-[#AB978C] border border-white/10">
              {task.assignee?.name?.charAt(0) || <User className="w-3 h-3" />}
            </div>
            <span className="truncate max-w-[120px]">{task.assignee?.name || 'Sin Asignar'}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-1">
          {task.status === 'pending' && canMarkForReview && (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-7 border-[#6B7C98]/40 text-[#6B7C98] hover:bg-[#6B7C98]/15 rounded-lg font-semibold"
              onClick={() => onStatusChange(task.id, 'review')}
            >
              <CheckCircle2 className="w-3 h-3 mr-1.5" />
              Mark for Review
            </Button>
          )}

          {task.status === 'pending' && !canMarkForReview && (
            <span className="text-[11px] text-muted-foreground italic block text-center py-1">
              Esperando avance del asignado...
            </span>
          )}

          {task.status === 'review' && canApproveOrReject && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-7 border-[#AB978C]/40 text-[#AB978C] hover:bg-[#AB978C]/15 rounded-lg font-semibold"
                onClick={() => onStatusChange(task.id, 'approved')}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-7 border-destructive/40 text-destructive hover:bg-destructive/15 rounded-lg font-semibold"
                onClick={() => onStatusChange(task.id, 'rejected')}
              >
                <XCircle className="w-3 h-3 mr-1" />
                Reject
              </Button>
            </div>
          )}

          {task.status === 'review' && !canApproveOrReject && (
            <span className="text-[11px] text-[#6B7C98] italic block text-center py-1">
              En Review...
            </span>
          )}

          {task.status === 'approved' && (
            <span className="text-xs font-bold text-[#AB978C] flex items-center gap-1.5 justify-center py-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Task Approved
            </span>
          )}

          {task.status === 'rejected' && (
            <div className="flex items-center justify-between gap-2 py-0.5">
              <span className="text-xs font-bold text-destructive flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                Rejected
              </span>
              {canReopen && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 border-amber-500/40 text-amber-400 hover:bg-amber-500/15 rounded-lg font-semibold"
                  onClick={() => onStatusChange(task.id, 'pending')}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reopen
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

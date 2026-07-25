import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, ChevronRight, CheckCircle2, XCircle, Pin } from 'lucide-react';
import type { Task, TaskStatus } from '../../types';
import { useAuthStore } from '../../stores/authStore';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

// Colores y estilos por prioridad
const priorityStyles = {
  low: 'bg-neon-green/10 text-neon-green border-neon-green/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  high: 'bg-destructive/10 text-destructive border-destructive/20',
};

// Bordes laterales por prioridad (high = anclada)
const priorityBorder = {
  low: 'border-l-2 border-l-neon-green/40',
  medium: '',
  high: 'border-l-2 border-l-destructive',
};

// Labels de prioridad
const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export default function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const user = useAuthStore((s) => s.user);
  const isAdmin = 'role' in (user || {}) && (user as { role: string }).role === 'admin';
  const isTeamLeader = 'role' in (user || {}) && (user as { role: string }).role === 'teamLeader';
  const canValidate = isAdmin || isTeamLeader;

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className={`bg-card/60 border-border hover:border-neon-cyan/30 transition-all duration-200 group ${priorityBorder[task.priority]}`}>
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Header: Prioridad + Fecha */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`text-xs ${priorityStyles[task.priority]}`}>
              {task.priority === 'high' && <Pin className="w-3 h-3 mr-1" />}
              {priorityLabels[task.priority]}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(task.createdAt)}
            </span>
          </div>

          {/* Título */}
          <h4 className="font-medium text-sm text-foreground leading-tight">
            {task.title}
          </h4>

          {/* Descripción (si existe) */}
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Asignado */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{task.assignee?.name || 'Unassigned'}</span>
          </div>

          {/* Acciones según estado */}
          <div className="flex items-center gap-2 pt-1">
            {task.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs h-7 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                onClick={() => onStatusChange(task.id, 'review')}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Mark for Review
              </Button>
            )}

            {task.status === 'review' && canValidate && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs h-7 border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                  onClick={() => onStatusChange(task.id, 'approved')}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs h-7 border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => onStatusChange(task.id, 'rejected')}
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Reject
                </Button>
              </>
            )}

            {task.status === 'review' && !canValidate && (
              <span className="text-xs text-muted-foreground italic w-full text-center">
                Pending validation...
              </span>
            )}

            {task.status === 'approved' && (
              <span className="text-xs text-neon-green flex items-center gap-1 w-full justify-center">
                <CheckCircle2 className="w-3 h-3" />
                Approved
              </span>
            )}

            {task.status === 'rejected' && (
              <span className="text-xs text-destructive flex items-center gap-1 w-full justify-center">
                <XCircle className="w-3 h-3" />
                Rejected
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import TaskColumn from './TaskColumn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ListTodo, Loader2, Trash2, RotateCcw, Clock, User, X } from 'lucide-react';
import type { TaskStatus } from '../../types';
import { useAuthStore } from '../../stores/authStore';

// Configuración de columnas del tablero Kanban
const columns: { title: string; status: TaskStatus; colorClass: string }[] = [
  { title: 'Pending', status: 'pending', colorClass: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
  { title: 'In Review', status: 'review', colorClass: 'bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan' },
  { title: 'Approved', status: 'approved', colorClass: 'bg-neon-green/10 border-neon-green/30 text-neon-green' },
  { title: 'Rejected', status: 'rejected', colorClass: 'bg-destructive/10 border-destructive/30 text-destructive' },
];

export default function TaskBoard() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = 'role' in (user || {}) && (user as { role: string }).role === 'admin';
  const isTeamLeader = 'role' in (user || {}) && (user as { role: string }).role === 'teamLeader';
  const canCreateTasks = isAdmin || isTeamLeader;

  // Estado del formulario de nueva tarea
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assigneeId: '',
  });

  // Estado del panel de tareas eliminadas
  const [showDeleted, setShowDeleted] = useState(false);

  // Solo fetch tareas eliminadas cuando el panel está abierto (lazy loading)
  const { tasks, tasksDeleted, createTask, updateTaskStatus, deleteTask, restoreTask } = useTasks(showDeleted);

  // Filtrar tareas por estado y ordenar por prioridad (high > medium > low)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const tasksByStatus = (status: TaskStatus) => {
    return (tasks.data?.filter((t) => t.status === status) || [])
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  // Manejar cambio de estado
  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTaskStatus.mutate({ id: taskId, status });
  };

  // Eliminar tarea (soft delete, solo admin)
  const handleDelete = (taskId: string) => {
    deleteTask.mutate(taskId);
  };

  // Restaurar tarea eliminada (solo admin)
  const handleRestore = (taskId: string) => {
    restoreTask.mutate(taskId);
  };

  // Crear nueva tarea
  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    createTask.mutate({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      assigneeId: newTask.assigneeId || user?.id || '',
    });
    setNewTask({ title: '', description: '', priority: 'medium', assigneeId: '' });
    setIsDialogOpen(false);
  };

  // Loading state
  if (tasks.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-neon-magenta/10 border border-neon-magenta/30 flex items-center justify-center glow-magenta">
            <ListTodo className="w-5 h-5 text-neon-magenta" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Task Board</h1>
            <p className="text-sm text-muted-foreground">Manage and track team tasks</p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Botón de tareas eliminadas (solo admin) */}
          {isAdmin && (
            <Button
              onClick={() => setShowDeleted(!showDeleted)}
              variant="outline"
              className={`border-border ${showDeleted ? 'bg-destructive/10 text-destructive border-destructive/30' : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'}`}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Deleted ({tasksDeleted.data?.length || 0})
            </Button>
          )}

          {/* Botón de crear tarea (solo admin/teamLeader) */}
          {canCreateTasks && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-neon-magenta text-background hover:bg-neon-magenta/90">
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="taskTitle" className="text-muted-foreground">Title</Label>
                    <Input
                      id="taskTitle"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Enter task title"
                      className="bg-input border-border focus:border-neon-magenta focus:ring-neon-magenta/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taskDesc" className="text-muted-foreground">Description</Label>
                    <Input
                      id="taskDesc"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Enter task description (optional)"
                      className="bg-input border-border focus:border-neon-magenta focus:ring-neon-magenta/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(v) => setNewTask({ ...newTask, priority: v as 'low' | 'medium' | 'high' })}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleCreateTask}
                    className="w-full bg-neon-magenta text-background hover:bg-neon-magenta/90"
                    disabled={!newTask.title.trim() || createTask.isPending}
                  >
                    {createTask.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Create Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Panel de tareas eliminadas (solo admin, colapsable) */}
      {showDeleted && isAdmin && (
        <div className="border border-destructive/30 rounded-lg bg-destructive/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Deleted Tasks
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 hover:text-destructive"
              onClick={() => setShowDeleted(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {tasksDeleted.data?.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No deleted tasks</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {tasksDeleted.data?.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-card/50 border border-border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {task.assignee?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hover:text-neon-green hover:bg-neon-green/10 shrink-0"
                    title="Restore task"
                    onClick={() => handleRestore(task.id)}
                    disabled={restoreTask.isPending}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tablero Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <TaskColumn
            key={col.status}
            title={col.title}
            status={col.status}
            tasks={tasksByStatus(col.status)}
            colorClass={col.colorClass}
            onStatusChange={handleStatusChange}
            onDelete={isAdmin ? handleDelete : undefined}
          />
        ))}
      </div>
    </div>
  );
}

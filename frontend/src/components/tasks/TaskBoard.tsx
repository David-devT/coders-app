import { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { useCoders } from '../../hooks/useCoders';
import { useClans } from '../../hooks/useClans';
import TaskColumn from './TaskColumn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ListTodo, Loader2, Trash2, RotateCcw, Clock, User, X } from 'lucide-react';
import type { TaskStatus } from '../../types';
import { useAuthStore } from '../../stores/authStore';

const columns: { title: string; status: TaskStatus; colorClass: string }[] = [
  { title: 'Pending', status: 'pending', colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { title: 'In Review', status: 'review', colorClass: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20' },
  { title: 'Approved', status: 'approved', colorClass: 'bg-neon-green/10 text-neon-green border-neon-green/20' },
  { title: 'Rejected', status: 'rejected', colorClass: 'bg-destructive/10 text-destructive border-destructive/20' },
];

export default function TaskBoard() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = 'role' in (user || {}) && (user as { role: string }).role === 'admin';
  const isTeamLeader = 'role' in (user || {}) && (user as { role: string }).role === 'teamLeader';
  const canCreateTasks = isAdmin || isTeamLeader;

  const { coders } = useCoders();
  const { clans } = useClans();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assigneeId: '',
    clanId: '',
  });

  const [showDeleted, setShowDeleted] = useState(false);
  const { tasks, tasksDeleted, createTask, updateTaskStatus, deleteTask, restoreTask } = useTasks(showDeleted);

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const tasksByStatus = (status: TaskStatus) => {
    return (tasks.data?.filter((t) => t.status === status) || [])
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTaskStatus.mutate({ id: taskId, status });
  };

  const handleDelete = (taskId: string) => {
    deleteTask.mutate(taskId);
  };

  const handleRestore = (taskId: string) => {
    restoreTask.mutate(taskId);
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    createTask.mutate({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      assigneeId: newTask.assigneeId || user?.id || '',
      clanId: newTask.clanId || undefined,
    });
    setNewTask({ title: '', description: '', priority: 'medium', assigneeId: '', clanId: '' });
    setIsDialogOpen(false);
  };

  if (tasks.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kanban Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neon-magenta/15 border border-neon-magenta/30 flex items-center justify-center glow-magenta">
            <ListTodo className="w-6 h-6 text-neon-magenta" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">Kanban Task Board</h1>
            <p className="text-xs text-muted-foreground">Supervisa y gestiona entregables de equipos a través del flujo de estados</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              onClick={() => setShowDeleted(!showDeleted)}
              variant="outline"
              className={`h-10 text-xs font-bold rounded-xl border ${
                showDeleted
                  ? 'bg-destructive/15 text-destructive border-destructive/40'
                  : 'glass-panel text-muted-foreground hover:text-destructive hover:bg-destructive/10'
              }`}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Tasks Eliminadas ({tasksDeleted.data?.length || 0})
            </Button>
          )}

          {canCreateTasks && (
            <>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="h-10 bg-gradient-to-r from-neon-magenta to-purple-600 hover:from-neon-magenta/90 hover:to-purple-600/90 text-background font-bold text-xs rounded-xl shadow-lg glow-magenta"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Task
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass-card border-white/10 p-6 rounded-2xl max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-foreground">Crear Nueva Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="taskTitle" className="text-xs font-semibold text-muted-foreground">Título de la Task</Label>
                      <Input
                        id="taskTitle"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="Ej. Configurar autenticación JWT"
                        className="glass-input h-10 rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="taskDesc" className="text-xs font-semibold text-muted-foreground">Descripción</Label>
                      <Input
                        id="taskDesc"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Descripción detallada de la tarea..."
                        className="glass-input h-10 rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Prioridad (Priority)</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(v) => setNewTask({ ...newTask, priority: v as 'low' | 'medium' | 'high' })}
                      >
                        <SelectTrigger className="glass-input h-10 rounded-xl text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-panel border-white/10 text-xs">
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="assigneeSelect" className="text-xs font-semibold text-muted-foreground">Coder Asignado (Assignee)</Label>
                      <select
                        id="assigneeSelect"
                        value={newTask.assigneeId}
                        onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl glass-input text-xs text-foreground focus:border-neon-magenta focus:ring-1 focus:ring-neon-magenta/20"
                      >
                        <option value="">Asignar a mí mismo ({user?.name || 'Usuario Actual'})</option>
                        {coders.data?.map((c) => (
                          <option key={c.id} value={c.id} className="bg-card text-foreground">
                            {c.name} ({c.clan?.name || 'Sin Clan'})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="clanSelect" className="text-xs font-semibold text-muted-foreground">Clan</Label>
                      <select
                        id="clanSelect"
                        value={newTask.clanId}
                        onChange={(e) => setNewTask({ ...newTask, clanId: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl glass-input text-xs text-foreground focus:border-neon-magenta focus:ring-1 focus:ring-neon-magenta/20"
                      >
                        <option value="">Sin Clan asignado</option>
                        {clans.data?.map((clan) => (
                          <option key={clan.id} value={clan.id} className="bg-card text-foreground">
                            {clan.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      onClick={handleCreateTask}
                      className="w-full h-10 bg-gradient-to-r from-neon-magenta to-purple-600 hover:from-neon-magenta/90 text-background font-bold text-xs rounded-xl shadow-lg glow-magenta mt-2"
                      disabled={!newTask.title.trim() || createTask.isPending}
                    >
                      {createTask.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Crear Task
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Deleted Tasks Drawer Panel */}
      {showDeleted && isAdmin && (
        <div className="glass-panel border-destructive/30 rounded-2xl p-4 bg-destructive/5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Archivo de Tasks Eliminadas
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 hover:text-destructive text-muted-foreground"
              onClick={() => setShowDeleted(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {tasksDeleted.data?.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No se encontraron tasks eliminadas</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
              {tasksDeleted.data?.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-xl glass-card border-white/5">
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="text-xs font-bold text-foreground truncate">{task.title}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neon-cyan" />
                        {new Date(task.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-neon-magenta" />
                        {task.assignee?.name || 'Sin Asignar'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-neon-green hover:bg-neon-green/10 rounded-xl shrink-0"
                    title="Restaurar task"
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

      {/* Columns Grid */}
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

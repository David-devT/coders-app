import { useState } from 'react';
import { toast } from 'sonner';
import { useTasks } from '../../hooks/useTasks';
import { useCoders } from '../../hooks/useCoders';
import { useClans } from '../../hooks/useClans';
import TaskColumn from './TaskColumn';
import TaskDetailModal from './TaskDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ListTodo, Loader2, Trash2, RotateCcw, Clock, User, X, Shield, CheckCircle2, Search, Calendar, Download, GitPullRequest } from 'lucide-react';
import type { Task, TaskStatus } from '../../types';
import { useAuthStore } from '../../stores/authStore';

// Definición de las 4 columnas de flujo de estados del tablero Kanban
const columns: { title: string; status: TaskStatus; colorClass: string }[] = [
  { title: 'Pending', status: 'pending', colorClass: 'bg-[#5E5653]/25 text-[#E9E6E7] border-[#7B7F8A]/30' },
  { title: 'In Review', status: 'review', colorClass: 'bg-[#6B7C98]/20 text-[#6B7C98] border-[#6B7C98]/35' },
  { title: 'Approved', status: 'approved', colorClass: 'bg-[#AB978C]/20 text-[#AB978C] border-[#AB978C]/35' },
  { title: 'Rejected', status: 'rejected', colorClass: 'bg-[#E05252]/15 text-[#E05252] border-[#E05252]/30' },
];

// Tablero interactivo Kanban para gestión y supervisión de tareas técnicas
export default function TaskBoard() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = 'role' in (user || {}) && (user as { role: string }).role === 'admin';
  const isTeamLeader = 'role' in (user || {}) && (user as { role: string }).role === 'teamLeader';
  const canCreateTasks = isAdmin || isTeamLeader;

  const { coders } = useCoders();
  const { clans } = useClans();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClanFilter, setSelectedClanFilter] = useState('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('all');

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assigneeId: '',
    clanId: '',
    dueDate: '',
    githubUrl: '',
  });

  const [showDeleted, setShowDeleted] = useState(false);
  const { tasks, tasksDeleted, createTask, updateTaskStatus, deleteTask, restoreTask } = useTasks(showDeleted);

  // Ordena y filtra tareas de cada columna según filtros activos y nivel de prioridad
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const tasksByStatus = (status: TaskStatus) => {
    return (tasks.data?.filter((t) => {
      if (t.status !== status) return false;
      if (selectedClanFilter !== 'all' && t.clan?.id !== selectedClanFilter) return false;
      if (selectedPriorityFilter !== 'all' && t.priority !== selectedPriorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        const matchesAssignee = t.assignee?.name?.toLowerCase().includes(q);
        const matchesClan = t.clan?.name?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesAssignee && !matchesClan) return false;
      }
      return true;
    }) || []).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  // Dispara la mutación para modificar el estado de una tarea con soporte de feedback
  const handleStatusChange = (taskId: string, status: TaskStatus, feedback?: string | null) => {
    updateTaskStatus.mutate(
      { id: taskId, status, feedback },
      {
        onSuccess: () => {
          toast.success(`Estado de task actualizado a ${status.toUpperCase()}`);
          if (selectedTask?.id === taskId) {
            setSelectedTask((prev) => (prev ? { ...prev, status, feedback: feedback !== undefined ? feedback : prev.feedback } : null));
          }
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Error al cambiar estado de la task');
        },
      }
    );
  };

  // Valida los permisos de rol (RBAC) y transiciones válidas al arrastrar y soltar (Drag & Drop)
  const handleDropTask = (taskId: string, targetStatus: TaskStatus) => {
    const task = tasks.data?.find((t) => t.id === taskId);
    if (!task) return;
    if (task.status === targetStatus) return;

    if (task.status === 'pending' && targetStatus === 'review') {
      const isAssignee = !!user?.id && task.assignee?.id === user.id;
      if (!isAssignee && !isAdmin) {
        toast.error('Solo el Coder asignado o Admin pueden enviar la task a Review');
        return;
      }
    } else if (task.status === 'review' && (targetStatus === 'approved' || targetStatus === 'rejected')) {
      if (!isAdmin && !isTeamLeader) {
        toast.error('Solo Team Leaders o Admin pueden Aprobar o Rechazar tareas');
        return;
      }
    } else if (task.status === 'rejected' && targetStatus === 'pending') {
      if (!isAdmin && !isTeamLeader) {
        toast.error('Solo Team Leaders o Admin pueden reabrir tareas rechazadas');
        return;
      }
    } else {
      toast.error(`Transición no permitida: no puedes mover directo de "${task.status}" a "${targetStatus}"`);
      return;
    }

    handleStatusChange(taskId, targetStatus);
  };

  // Envía la tarea a la papelera (soft delete)
  const handleDelete = (taskId: string) => {
    deleteTask.mutate(taskId, {
      onSuccess: () => toast.success('Task movida a eliminadas'),
      onError: () => toast.error('Error al eliminar task'),
    });
  };

  // Recupera una tarea eliminada devolviéndola al tablero Kanban
  const handleRestore = (taskId: string) => {
    restoreTask.mutate(taskId, {
      onSuccess: () => toast.success('Task restaurada exitosamente'),
      onError: () => toast.error('Error al restaurar task'),
    });
  };

  // Crea una nueva tarea técnica y la sitúa en estado pendiente
  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    createTask.mutate(
      {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        assigneeId: newTask.assigneeId || user?.id || '',
        clanId: newTask.clanId || undefined,
        dueDate: newTask.dueDate || undefined,
        githubUrl: newTask.githubUrl ? newTask.githubUrl.trim() : undefined,
      },
      {
        onSuccess: () => {
          toast.success('Nueva task creada con éxito');
          setNewTask({ title: '', description: '', priority: 'medium', assigneeId: '', clanId: '', dueDate: '', githubUrl: '' });
          setIsDialogOpen(false);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Error al crear task');
        },
      }
    );
  };

  // Exporta la lista actual de tareas filtradas a un archivo CSV descargable
  const handleExportCSV = () => {
    const allFilteredTasks = tasks.data?.filter((t) => {
      if (selectedClanFilter !== 'all' && t.clan?.id !== selectedClanFilter) return false;
      if (selectedPriorityFilter !== 'all' && t.priority !== selectedPriorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        const matchesAssignee = t.assignee?.name?.toLowerCase().includes(q);
        const matchesClan = t.clan?.name?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesAssignee && !matchesClan) return false;
      }
      return true;
    }) || [];

    if (allFilteredTasks.length === 0) {
      toast.error('No hay tareas para exportar con los filtros actuales');
      return;
    }

    const headers = ['ID', 'Título', 'Estado', 'Prioridad', 'Clan', 'Asignado', 'Fecha Límite', 'GitHub PR', 'Feedback'];
    const rows = allFilteredTasks.map((t) => [
      `"${t.id}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.status}"`,
      `"${t.priority}"`,
      `"${t.clan?.name || 'Sin Clan'}"`,
      `"${t.assignee?.name || 'Sin Asignar'}"`,
      `"${t.dueDate ? new Date(t.dueDate).toLocaleDateString('es-ES') : 'N/A'}"`,
      `"${t.githubUrl || 'N/A'}"`,
      `"${(t.feedback || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Reporte de tareas exportado a CSV');
  };

  if (tasks.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#AB978C]" />
      </div>
    );
  }

  // Métricas agregadas en tiempo real para las tarjetas KPI
  const totalTasks = tasks.data?.length || 0;
  const approvedTasks = tasks.data?.filter((t) => t.status === 'approved').length || 0;
  const pipelineTasks = tasks.data?.filter((t) => t.status === 'pending' || t.status === 'review').length || 0;
  const approvalRate = totalTasks > 0 ? ((approvedTasks / totalTasks) * 100).toFixed(0) : '100';
  const totalCoders = coders.data?.length || 0;
  const totalClans = clans.data?.length || 0;

  return (
    <div className="space-y-6">
      {/* Resumen de métricas clave KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="kpi-card p-4 rounded-2xl border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#7B7F8A]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Coders Activos</span>
            <span className="w-2 h-2 rounded-full bg-[#AB978C] animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{totalCoders}</span>
            <span className="text-[11px] text-[#AB978C] font-semibold">en plataforma</span>
          </div>
        </div>

        <div className="kpi-card p-4 rounded-2xl border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#7B7F8A]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Clanes Activos</span>
            <Shield className="w-3.5 h-3.5 text-[#6B7C98]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{totalClans}</span>
            <span className="text-[11px] text-[#7B7F8A] font-semibold">unidades técnicas</span>
          </div>
        </div>

        <div className="kpi-card p-4 rounded-2xl border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#7B7F8A]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Tasks en Pipeline</span>
            <Clock className="w-3.5 h-3.5 text-[#6B7C98]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#6B7C98]">{pipelineTasks}</span>
            <span className="text-[11px] text-[#7B7F8A] font-semibold">de {totalTasks} totales</span>
          </div>
        </div>

        <div className="kpi-card p-4 rounded-2xl border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#AB978C]">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-[#AB978C]">Tasa Aprobación</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#AB978C]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#AB978C] drop-shadow-[0_0_12px_rgba(171,151,140,0.35)]">
              {approvalRate}%
            </span>
            <span className="text-[11px] text-[#E9E6E7] font-semibold">{approvedTasks} completadas</span>
          </div>
        </div>
      </div>

      {/* Cabecera del tablero con acciones de crear y papelera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#AB978C]/15 border border-[#AB978C]/30 flex items-center justify-center glow-bronze">
            <ListTodo className="w-6 h-6 text-[#AB978C]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">Kanban Task Board</h1>
            <p className="text-xs text-muted-foreground">Supervisa y gestiona entregables de equipos a través del flujo de estados</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón para exportar reporte de tareas en CSV */}
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="h-10 text-xs font-bold rounded-xl border border-white/10 glass-panel text-muted-foreground hover:text-foreground hover:bg-white/5"
            title="Exportar tareas visibles a CSV"
          >
            <Download className="w-4 h-4 mr-2 text-[#6B7C98]" />
            Exportar CSV
          </Button>

          {/* Botón para ver tareas eliminadas (solo administradores) */}
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

          {/* Diálogo modal para registrar una nueva tarea técnica */}
          {canCreateTasks && (
            <>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="h-10 bg-[#AB978C] hover:bg-[#AB978C]/90 text-[#0E1015] font-extrabold text-xs rounded-xl shadow-lg glow-bronze transition-all"
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
                        className="w-full h-10 px-3 rounded-xl glass-input text-xs text-foreground focus:border-[#AB978C] focus:ring-1 focus:ring-[#AB978C]/30"
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
                        className="w-full h-10 px-3 rounded-xl glass-input text-xs text-foreground focus:border-[#AB978C] focus:ring-1 focus:ring-[#AB978C]/30"
                      >
                        <option value="">Sin Clan asignado</option>
                        {clans.data?.map((clan) => (
                          <option key={clan.id} value={clan.id} className="bg-card text-foreground">
                            {clan.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="taskDueDate" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#6B7C98]" /> Fecha Límite (Due Date)
                      </Label>
                      <Input
                        id="taskDueDate"
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        className="glass-input h-10 rounded-xl text-xs text-foreground [color-scheme:dark]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="taskGithubUrl" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <GitPullRequest className="w-3.5 h-3.5 text-[#AB978C]" /> Enlace a PR / Commit en GitHub (Opcional)
                      </Label>
                      <Input
                        id="taskGithubUrl"
                        value={newTask.githubUrl}
                        onChange={(e) => setNewTask({ ...newTask, githubUrl: e.target.value })}
                        placeholder="https://github.com/usuario/repo/pull/123"
                        className="glass-input h-10 rounded-xl text-xs text-foreground"
                      />
                    </div>
                    <Button
                      onClick={handleCreateTask}
                      className="w-full h-10 bg-[#AB978C] hover:bg-[#AB978C]/90 text-[#0E1015] font-extrabold text-xs rounded-xl shadow-lg glow-bronze mt-2"
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

      {/* Panel desplegable de tareas archivadas / eliminadas */}
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
                        <Clock className="w-3 h-3 text-[#6B7C98]" />
                        {new Date(task.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-[#AB978C]" />
                        {task.assignee?.name || 'Sin Asignar'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-[#AB978C] hover:bg-[#AB978C]/15 rounded-xl shrink-0"
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

      {/* Barra de Filtros Rápidos (Búsqueda predictiva, Clan y Prioridad) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 glass-panel p-3 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Filtrar tasks por título, descripción, coder o clan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input h-10 pl-10 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Selector de Clan */}
          <select
            value={selectedClanFilter}
            onChange={(e) => setSelectedClanFilter(e.target.value)}
            className="h-10 px-3 rounded-xl glass-input text-xs text-foreground focus:border-[#AB978C] focus:ring-1 focus:ring-[#AB978C]/30 bg-[#14171E] min-w-[140px]"
          >
            <option value="all">Todos los Clanes</option>
            {clans.data?.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#14171E] text-foreground">
                {c.name}
              </option>
            ))}
          </select>

          {/* Selector de Prioridad */}
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="h-10 px-3 rounded-xl glass-input text-xs text-foreground focus:border-[#AB978C] focus:ring-1 focus:ring-[#AB978C]/30 bg-[#14171E] min-w-[130px]"
          >
            <option value="all">Todas las Prioridades</option>
            <option value="high" className="bg-[#14171E] text-[#E05252]">Alta (High)</option>
            <option value="medium" className="bg-[#14171E] text-[#AB978C]">Media (Medium)</option>
            <option value="low" className="bg-[#14171E] text-[#7B7F8A]">Baja (Low)</option>
          </select>

          {/* Botón reset filtros si alguno está activo */}
          {(searchQuery || selectedClanFilter !== 'all' || selectedPriorityFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedClanFilter('all');
                setSelectedPriorityFilter('all');
              }}
              className="h-10 px-3 text-xs text-muted-foreground hover:text-[#AB978C] rounded-xl shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Cuadrícula de columnas del tablero Kanban */}
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
            onDropTask={handleDropTask}
            onSelectTask={(t) => setSelectedTask(t)}
          />
        ))}
      </div>

      {/* Modal detallado de tarea con notas del TL y acciones contextuales */}
      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onStatusChange={handleStatusChange}
        onDelete={isAdmin ? handleDelete : undefined}
      />
    </div>
  );
}

import { useState, type ReactNode } from 'react';
import TaskCard from './TaskCard';
import type { Task, TaskStatus } from '../../types';
import { Clock, Search, CheckCircle2, AlertTriangle } from 'lucide-react';

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  colorClass: string;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
  onDropTask?: (taskId: string, targetStatus: TaskStatus) => void;
  onSelectTask?: (task: Task) => void;
}

// Iconos vectoriales SVG representativos para cada columna de estado en el tablero
const statusIcons: Record<TaskStatus, ReactNode> = {
  pending: <Clock className="w-4 h-4 text-[#E9E6E7]" />,
  review: <Search className="w-4 h-4 text-[#6B7C98]" />,
  approved: <CheckCircle2 className="w-4 h-4 text-[#AB978C]" />,
  rejected: <AlertTriangle className="w-4 h-4 text-[#E05252]" />,
};

// Columna individual del tablero Kanban con soporte para arrastrar y soltar
export default function TaskColumn({
  title,
  status,
  tasks,
  colorClass,
  onStatusChange,
  onDelete,
  onDropTask,
  onSelectTask,
}: TaskColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  // Permite que la columna actúe como receptor de elementos arrastrados
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  // Restablece el estilo visual cuando el cursor abandona la columna
  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Procesa la tarea soltada e invoca la validación de transición
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onDropTask) {
      onDropTask(taskId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden border transition-all duration-200 ${
        isDragOver
          ? 'border-[#AB978C] ring-2 ring-[#AB978C]/40 bg-[#AB978C]/5 scale-[1.01]'
          : 'border-white/5'
      }`}
    >
      {/* Encabezado con título de columna y contador de tareas con icono SVG vectorial */}
      <div className={`flex items-center justify-between px-4 py-3 border-b border-white/5 ${colorClass}`}>
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center">{statusIcons[status]}</span>
          <h3 className="font-extrabold text-xs uppercase tracking-wider">{title}</h3>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/40 border border-white/10">
          {tasks.length}
        </span>
      </div>


      {/* Lista contenedora de tarjetas de tareas */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto sm:min-h-[350px]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground/60 text-xs border border-dashed border-white/5 rounded-xl">
            <p>Sin tasks en {title}</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onSelect={onSelectTask}
            />
          ))
        )}
      </div>
    </div>
  );
}

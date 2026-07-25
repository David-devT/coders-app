import TaskCard from './TaskCard';
import type { Task, TaskStatus } from '../../types';

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  colorClass: string;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

// Iconos de estado por columna
const statusIcons: Record<TaskStatus, string> = {
  pending: '⏳',
  review: '👀',
  approved: '✅',
  rejected: '❌',
};

export default function TaskColumn({ title, status, tasks, colorClass, onStatusChange }: TaskColumnProps) {
  return (
    <div className="flex-1 min-w-[280px]">
      {/* Header de columna */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-t-lg border border-b-0 ${colorClass}`}>
        <span className="text-sm">{statusIcons[status]}</span>
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="ml-auto text-xs bg-background/50 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Lista de tarjetas */}
      <div className="space-y-2 p-2 bg-muted/20 rounded-b-lg border border-t-0 border-border min-h-[200px]">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-xs">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}

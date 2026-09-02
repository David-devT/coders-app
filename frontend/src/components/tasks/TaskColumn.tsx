import TaskCard from './TaskCard';
import type { Task, TaskStatus } from '../../types';

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  colorClass: string;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
}

const statusIcons: Record<TaskStatus, string> = {
  pending: '⚡',
  review: '🔍',
  approved: '✨',
  rejected: '🛡️',
};

export default function TaskColumn({ title, status, tasks, colorClass, onStatusChange, onDelete }: TaskColumnProps) {
  return (
    <div className="flex-1 min-w-[290px] flex flex-col glass-panel rounded-2xl overflow-hidden border border-white/5">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b border-white/5 ${colorClass}`}>
        <div className="flex items-center gap-2">
          <span className="text-base">{statusIcons[status]}</span>
          <h3 className="font-extrabold text-xs uppercase tracking-wider">{title}</h3>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/40 border border-white/10">
          {tasks.length}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[350px]">
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
            />
          ))
        )}
      </div>
    </div>
  );
}

// Interfaces TypeScript para el dominio de la aplicación

// Coder: miembro de un clan con datos básicos y referencia a clan asignado
export interface Coder {
  id: string;
  name: string;
  email: string;
  clan?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

// Clan: unidad organizativa con líder opcional y lista de coders asignados
export interface Clan {
  id: string;
  name: string;
  description?: string;
  teamLeader?: { id: string; name: string; email: string } | null;
  coders?: { id: string; name: string; email: string }[];
  createdAt: string;
  updatedAt: string;
}

// TeamLeader: usuario con privilegios de gestión de clans (role: teamLeader | admin)
export interface TeamLeader {
  id: string;
  name: string;
  email: string;
  role: 'teamLeader' | 'admin';
  clans?: { id: string; name: string }[];
  createdAt: string;
  updatedAt: string;
}

// Respuesta de autenticación: usuario + token JWT
export interface AuthResponse {
  user: Coder | TeamLeader;
  token: string;
}

// Tarea: unidad de trabajo asignada a un coder, con estados de validación
export type TaskStatus = 'pending' | 'review' | 'approved' | 'rejected';

// Entrada individual en el registro de auditoría de una tarea técnica
export interface TaskHistoryItem {
  id: string;
  status: TaskStatus;
  changedBy: { id: string | null; name: string; role: string };
  feedback?: string | null;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  assignee?: { id: string; name: string; email: string } | null;
  clan?: { id: string; name: string } | null;
  dueDate?: string | null;
  feedback?: string | null;
  githubUrl?: string | null;
  history?: TaskHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

// Notificación interna del sistema dirigida al usuario
export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  link?: string | null;
  createdAt: string;
}

// Carga útil de notificaciones y conteo de no leídas
export interface NotificationsData {
  notifications: NotificationItem[];
  unreadCount: number;
}

// Wrapper genérico de respuesta API con status ok y datos tipados
export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string;
}

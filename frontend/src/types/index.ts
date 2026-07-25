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

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  assignee?: { id: string; name: string; email: string } | null;
  clan?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

// Wrapper genérico de respuesta API con status ok y datos tipados
export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string;
}

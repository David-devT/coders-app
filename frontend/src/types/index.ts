export interface Coder {
  _id: string;
  name: string;
  email: string;
  clan?: Clan;
  createdAt: string;
  updatedAt: string;
}

export interface Clan {
  _id: string;
  name: string;
  description?: string;
  teamLeader?: TeamLeader;
  coders?: Coder[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamLeader {
  _id: string;
  name: string;
  email: string;
  role: 'teamLeader' | 'admin';
  clans?: Clan[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: Coder | TeamLeader;
  token: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string;
}

export type ActivityType = 'diaria' | 'semanal' | 'temporada';
export type ActivityPriority = 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C';
export type ActivityMode = 'individual' | 'grupal' | 'ambas';
export type ActivityPreference = 'individual' | 'grupal' | null;

export interface Reward {
  id: string;
  nombre: string;
  descripcion?: string;
  cantidad?: number;
}

export interface Activity {
  id: string;
  nombre: string;
  tipo: ActivityType;
  prioridad: ActivityPriority;
  tiempo_aprox: string;
  mejora: string;
  detalle: string;
  modo: ActivityMode;
  preferencia: ActivityPreference;
  created_at: string;
  updated_at: string;
  rewards?: Reward[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface UserProgress {
  id: number;
  user_id: number;
  activity_id: string;
  completed_date: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  nombre?: string;
  tipo?: ActivityType;
  prioridad?: ActivityPriority;
}

export type EventType = 'pvp' | 'faction' | 'world_event';

export interface ScheduledEvent {
  id: string;
  nombre: string;
  horarios: string[];
  duracion_minutos: number;
  descripcion: string;
  tipo: EventType;
  rewards?: Reward[];
  created_at: string;
  updated_at: string;
}

export interface UpcomingEvent extends ScheduledEvent {
  time: string;
  minutesUntil: number;
  status: 'active' | 'upcoming';
  previousScheduleTime?: string;
  minutesSincePrevious?: number;
  totalMinutesBetweenSchedules?: number;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    details?: any;
  };
}

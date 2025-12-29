export type EventType = 'pvp' | 'faction' | 'world_event';

export interface ScheduledEvent {
  id: string;
  nombre: string;
  horarios: string[];
  duracion_minutos: number;
  descripcion: string;
  tipo: EventType;
  created_at: Date;
  updated_at: Date;
}

export interface ScheduledEventCreate {
  id: string;
  nombre: string;
  horarios: string[];
  duracion_minutos: number;
  descripcion: string;
  tipo: EventType;
}

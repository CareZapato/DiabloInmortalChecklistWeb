export type ActivityType = 'diaria' | 'semanal' | 'temporada';
export type ActivityPriority = 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C';

export interface Activity {
  id: string;
  nombre: string;
  tipo: ActivityType;
  prioridad: ActivityPriority;
  tiempo_aprox: string;
  recompensas: string;
  mejora: string;
  detalle: string;
  created_at: Date;
  updated_at: Date;
}

export interface ActivityCreate {
  id: string;
  nombre: string;
  tipo: ActivityType;
  prioridad: ActivityPriority;
  tiempo_aprox: string;
  recompensas: string;
  mejora: string;
  detalle: string;
}

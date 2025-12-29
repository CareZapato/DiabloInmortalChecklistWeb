export interface UserProgress {
  id: number;
  user_id: number;
  activity_id: string;
  completed_date: Date;
  is_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserProgressCreate {
  user_id: number;
  activity_id: string;
  completed_date: string;
  is_completed: boolean;
}

export interface UserProgressUpdate {
  is_completed: boolean;
}

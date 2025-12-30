export interface Reward {
  id: string;
  nombre: string;
  descripcion?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface EventReward {
  event_id: string;
  reward_id: string;
  cantidad?: number;
}

export interface ActivityReward {
  activity_id: string;
  reward_id: string;
  cantidad?: number;
}

export interface RewardWithDetails extends Reward {
  cantidad?: number;
}

import api from './api';
import { Reward } from '../types';

export const rewardService = {
  // Get all rewards
  async getAll(): Promise<Reward[]> {
    const response = await api.get('/rewards');
    return response.data;
  },

  // Get activities that give a specific reward
  async getActivitiesByReward(rewardId: string): Promise<any[]> {
    const response = await api.get(`/rewards/${rewardId}/activities`);
    return response.data;
  },

  // Get events that give a specific reward
  async getEventsByReward(rewardId: string): Promise<any[]> {
    const response = await api.get(`/rewards/${rewardId}/events`);
    return response.data;
  },
};

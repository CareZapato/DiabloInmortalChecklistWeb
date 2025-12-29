import api from './api';
import { Activity, ApiResponse } from '../types';

export const activityService = {
  async getAll(): Promise<Activity[]> {
    const response = await api.get<ApiResponse<Activity[]>>('/activities');
    return response.data.data;
  },

  async getById(id: string): Promise<Activity> {
    const response = await api.get<ApiResponse<Activity>>(`/activities/${id}`);
    return response.data.data;
  },
};

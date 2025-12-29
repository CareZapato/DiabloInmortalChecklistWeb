import api from './api';
import { UserProgress, ApiResponse } from '../types';

export const progressService = {
  async getAll(): Promise<UserProgress[]> {
    const response = await api.get<ApiResponse<UserProgress[]>>('/progress');
    return response.data.data;
  },

  async getByDate(date: string): Promise<UserProgress[]> {
    const response = await api.get<ApiResponse<UserProgress[]>>(`/progress/date/${date}`);
    return response.data.data;
  },

  async update(activityId: string, isCompleted: boolean, completedDate: string): Promise<UserProgress> {
    const response = await api.put<ApiResponse<UserProgress>>(`/progress/${activityId}`, {
      is_completed: isCompleted,
      completed_date: completedDate,
    });
    return response.data.data;
  },
};

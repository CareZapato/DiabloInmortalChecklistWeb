import api from './api';
import { ScheduledEvent, UpcomingEvent, ApiResponse } from '../types';

export const eventService = {
  async getAll(): Promise<ScheduledEvent[]> {
    const response = await api.get<ApiResponse<ScheduledEvent[]>>('/events');
    return response.data.data;
  },

  async getUpcoming(): Promise<UpcomingEvent[]> {
    const response = await api.get<ApiResponse<UpcomingEvent[]>>('/events/upcoming');
    return response.data.data;
  },
};

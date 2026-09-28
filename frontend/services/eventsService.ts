import api from './api';
import { EventFilters } from '../types';

export const eventsService = {
  getEvents: (filters?: EventFilters) =>
    api.get('/api/events', { params: filters }),

  getEvent: (id: number) =>
    api.get(`/api/events/${id}`),

  createEvent: (data: any) =>
    api.post('/api/events', data),

  updateEvent: (id: number, data: any) =>
    api.put(`/api/events/${id}`, data),

  deleteEvent: (id: number) =>
    api.delete(`/api/events/${id}`),
};

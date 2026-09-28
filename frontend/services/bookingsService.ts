import api from './api';

export const bookingsService = {
  createBooking: (data: { event_id: number; ticket_type: string; quantity: number }) =>
    api.post('/api/bookings', data),

  getBookings: () =>
    api.get('/api/bookings'),

  getBooking: (id: number) =>
    api.get(`/api/bookings/${id}`),

  cancelBooking: (id: number) =>
    api.put(`/api/bookings/${id}/cancel`),
};

export const favoritesService = {
  getFavorites: () =>
    api.get('/api/favorites'),

  addFavorite: (eventId: number) =>
    api.post('/api/favorites', { event_id: eventId }),

  removeFavorite: (eventId: number) =>
    api.delete(`/api/favorites/${eventId}`),
};

export const notificationsService = {
  getNotifications: () =>
    api.get('/api/notifications'),

  markRead: (id: number) =>
    api.put(`/api/notifications/${id}/read`),

  markAllRead: () =>
    api.put('/api/notifications/read-all'),
};

export const organizerService = {
  getDashboard: () =>
    api.get('/api/organizer/dashboard'),

  getOrganizerEvents: () =>
    api.get('/api/organizer/events'),

  getAttendees: (eventId: number, search?: string) =>
    api.get(`/api/organizer/events/${eventId}/attendees`, { params: { search } }),
};

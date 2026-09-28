import api from './api';
import { RegisterData } from '../types';

export const authService = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),

  register: (data: RegisterData) =>
    api.post('/api/auth/register', data),

  getMe: () =>
    api.get('/api/auth/me'),

  updateProfile: (data: { name?: string; mobile?: string }) =>
    api.put('/api/auth/profile', data),
};

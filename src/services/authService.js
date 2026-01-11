import { handleApiError } from '@/utils/errorHandler';
import api from './api';

export const authService = {
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async register(data) {
    try {
      const response = await api.post('/auth/register', data);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

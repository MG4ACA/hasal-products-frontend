import api from './api';

export const authService = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: data => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

import api from './api';

export const authService = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }).then(res => res.data),
  register: data => api.post('/auth/register', data).then(res => res.data),
  getCurrentUser: () => api.get('/auth/me').then(res => res.data),
  logout: () => api.post('/auth/logout').then(res => res.data),
};

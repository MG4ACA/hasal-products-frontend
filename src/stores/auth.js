import { authService } from '@/services/authService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);
  const token = ref(sessionStorage.getItem('token'));
  const loading = ref(false);
  const error = ref(null);

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userRole = computed(() => user.value?.role || null);

  // Actions
  const login = async (email, password) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.login(email, password);
      token.value = response.data.token;
      user.value = response.data.user;
      sessionStorage.setItem('token', token.value);
      return response;
    } catch (err) {
      error.value = err.message || 'Login failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    sessionStorage.removeItem('token');
  };

  const fetchCurrentUser = async () => {
    if (!token.value) return;
    try {
      const response = await authService.getCurrentUser();
      user.value = response.data.user;
    } catch (err) {
      error.value = err.message;
      logout();
    }
  };

  // Initialize user on store creation
  if (token.value) {
    fetchCurrentUser();
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    userRole,
    login,
    logout,
    fetchCurrentUser,
  };
});

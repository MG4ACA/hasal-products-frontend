import { authService } from '@/services/authService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);
  const token = ref(sessionStorage.getItem('token'));
  const tokenExpiresAt = ref(sessionStorage.getItem('tokenExpiresAt'));
  const loading = ref(false);
  const error = ref(null);
  const showExpiryWarning = ref(false);
  const timeRemaining = ref(null);
  let expiryCheckInterval = null;

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value && !isTokenExpired());
  const userRole = computed(() => user.value?.role || null);
  const isTokenExpiringSoon = computed(() => {
    if (!timeRemaining.value) return false;
    return timeRemaining.value <= 5 * 60 * 1000; // 5 minutes
  });

  // Token expiry methods
  const isTokenExpired = () => {
    if (!tokenExpiresAt.value) return false;
    return Date.now() >= parseInt(tokenExpiresAt.value);
  };

  const calculateTimeRemaining = () => {
    if (!tokenExpiresAt.value) {
      timeRemaining.value = null;
      return null;
    }
    const remaining = parseInt(tokenExpiresAt.value) - Date.now();
    timeRemaining.value = remaining > 0 ? remaining : 0;
    return timeRemaining.value;
  };

  const startExpiryCheck = () => {
    if (expiryCheckInterval) clearInterval(expiryCheckInterval);

    expiryCheckInterval = setInterval(() => {
      const remaining = calculateTimeRemaining();

      if (remaining === 0) {
        showExpiryWarning.value = false;
        logout();
      } else if (remaining && remaining <= 5 * 60 * 1000) {
        showExpiryWarning.value = true;
      }
    }, 10000); // Check every 10 seconds
  };

  const stopExpiryCheck = () => {
    if (expiryCheckInterval) {
      clearInterval(expiryCheckInterval);
      expiryCheckInterval = null;
    }
  };

  // Actions
  const login = async (username, password) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.login(username, password);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      token.value = response.token;
      user.value = response.user;

      // Calculate expiry time (24 hours from now)
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      tokenExpiresAt.value = expiresAt.toString();

      sessionStorage.setItem('token', token.value);
      sessionStorage.setItem('tokenExpiresAt', expiresAt.toString());

      calculateTimeRemaining();
      startExpiryCheck();

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
    tokenExpiresAt.value = null;
    timeRemaining.value = null;
    showExpiryWarning.value = false;
    error.value = null;
    stopExpiryCheck();
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('tokenExpiresAt');
  };

  const fetchCurrentUser = async () => {
    if (!token.value) return;
    try {
      const response = await authService.getCurrentUser();

      // Check for error response
      if (response.error) {
        error.value = response.message;
        logout();
        return;
      }

      // Response is already the user object from authService
      user.value = response;
      calculateTimeRemaining();
      startExpiryCheck();
    } catch (err) {
      console.error('Error fetching current user:', err);
      error.value = err.message;
      logout();
    }
  };

  const initializeAuth = async () => {
    if (token.value && !isTokenExpired()) {
      await fetchCurrentUser();
    } else if (token.value && isTokenExpired()) {
      logout();
    }
  };

  return {
    user,
    token,
    tokenExpiresAt,
    timeRemaining,
    showExpiryWarning,
    loading,
    error,
    isAuthenticated,
    userRole,
    isTokenExpiringSoon,
    login,
    logout,
    fetchCurrentUser,
    initializeAuth,
    isTokenExpired,
    calculateTimeRemaining,
    startExpiryCheck,
    stopExpiryCheck,
  };
});

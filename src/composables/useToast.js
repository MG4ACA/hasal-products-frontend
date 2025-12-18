import { ref } from 'vue';

/**
 * Composable for toast notifications
 */
export const useToast = () => {
  const toasts = ref([]);

  const addToast = (message, severity = 'info', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, severity };

    toasts.value.push(toast);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  };

  const success = (message, duration = 3000) => addToast(message, 'success', duration);
  const error = (message, duration = 5000) => addToast(message, 'error', duration);
  const warn = (message, duration = 4000) => addToast(message, 'warn', duration);
  const info = (message, duration = 3000) => addToast(message, 'info', duration);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warn,
    info,
  };
};

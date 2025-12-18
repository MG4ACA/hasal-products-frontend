import { useToast } from 'primevue/usetoast';

export function useToastNotification() {
  const toast = useToast();

  const showSuccess = (message, title = 'Success') => {
    toast.add({
      severity: 'success',
      summary: title,
      detail: message,
      life: 3000,
    });
  };

  const showError = (message, title = 'Error') => {
    toast.add({
      severity: 'error',
      summary: title,
      detail: message,
      life: 4000,
    });
  };

  const showWarning = (message, title = 'Warning') => {
    toast.add({
      severity: 'warn',
      summary: title,
      detail: message,
      life: 3000,
    });
  };

  const showInfo = (message, title = 'Info') => {
    toast.add({
      severity: 'info',
      summary: title,
      detail: message,
      life: 3000,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}

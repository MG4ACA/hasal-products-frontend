<template>
  <div class="dashboard-container">
    <!-- Token Expiry Warning -->
    <div v-if="authStore.showExpiryWarning" class="expiry-warning">
      <div class="warning-content">
        <i class="pi pi-exclamation-triangle warning-icon" />
        <div class="warning-text">
          <p class="warning-title">Session Expiring Soon</p>
          <p class="warning-message">
            Your session will expire in {{ formatTimeRemaining(authStore.timeRemaining) }}
          </p>
        </div>
        <div class="warning-actions">
          <Button label="Logout Now" severity="danger" size="small" @click="handleLogout" />
        </div>
      </div>
    </div>

    <div class="welcome-section">
      <h1>Welcome, {{ authStore.user?.full_name || authStore.user?.username }}!</h1>
      <p>
        Role: <strong>{{ authStore.userRole }}</strong>
      </p>
    </div>

    <div class="widgets-grid">
      <div class="widget">
        <h3>Today's Sales</h3>
        <p class="value">LKR 0.00</p>
      </div>
      <div class="widget">
        <h3>Outstanding Receivables</h3>
        <p class="value">LKR 0.00</p>
      </div>
      <div class="widget">
        <h3>Low Stock Items</h3>
        <p class="value">0</p>
      </div>
    </div>

    <Button label="Logout" class="mt-4" severity="danger" @click="handleLogout" />
  </div>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useAuthStore } from '@/stores/auth';
import Button from 'primevue/button';
import { watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const { showWarning, showInfo } = useToastNotification();

// Watch for token expiry warnings
watch(
  () => authStore.showExpiryWarning,
  newVal => {
    if (newVal) {
      showWarning(
        `Your session will expire in ${formatTimeRemaining(authStore.timeRemaining)}. Please save your work.`,
        'Session Expiring Soon'
      );
    }
  }
);

const formatTimeRemaining = milliseconds => {
  if (!milliseconds) return 'loading...';
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

const handleLogout = () => {
  showInfo('You have been logged out successfully.', 'Logout');
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
}

.expiry-warning {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.warning-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.warning-icon {
  font-size: 1.5rem;
  color: #ff9800;
  flex-shrink: 0;
}

.warning-text {
  flex: 1;
}

.warning-title {
  font-weight: bold;
  color: #d79600;
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
}

.warning-message {
  color: #997404;
  margin: 0;
  font-size: 0.9rem;
}

.warning-actions {
  flex-shrink: 0;
}

.welcome-section {
  margin-bottom: 2rem;
}

.dashboard-container h1 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
}

.welcome-section p {
  color: #666;
  margin-bottom: 0;
}

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.widget {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.widget h3 {
  color: #667eea;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.widget .value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}
</style>

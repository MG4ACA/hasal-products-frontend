<template>
  <div class="dashboard-container">
    <h1>Dashboard</h1>
    <p>Welcome to Hasal POS System</p>

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

    <Button label="Logout" @click="handleLogout" class="mt-4" severity="danger" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
}

.dashboard-container h1 {
  color: #333;
  margin-bottom: 0.5rem;
}

.dashboard-container p {
  color: #999;
  margin-bottom: 2rem;
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

<template>
  <div class="topbar">
    <div class="topbar-left">
      <h2>{{ pageTitle }}</h2>
    </div>
    <div class="topbar-right">
      <div class="user-profile">
        <span>{{ authStore.user?.email }}</span>
        <Button
          icon="pi pi-sign-out"
          class="p-button-rounded p-button-text"
          @click="handleLogout"
          v-tooltip="'Logout'"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const pageTitle = computed(() => {
  return route.name || 'Dashboard';
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.topbar-left h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-right: 1rem;
  border-right: 1px solid #e0e0e0;
}

.user-profile span {
  color: #666;
  font-size: 0.9rem;
}
</style>

<template>
  <div id="app" class="app">
    <RouterView v-if="!isAuthenticated" />
    <AppLayout v-else />
    <Toast />
    <ConfirmDialog />
  </div>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';
import { RouterView } from 'vue-router';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
</script>

<style>
* {
  margin: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
    'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  background-color: #f5f5f5;
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* Print Styles - Hide all UI chrome when printing */
@media print {
  /* Hide sidebar, topbar, and layout chrome */
  .app-layout {
    display: block !important;
  }

  .main-content {
    margin: 0 !important;
    padding: 0 !important;
  }

  .page-content {
    padding: 0 !important;
    margin: 0 !important;
    background: white !important;
  }

  /* Force hide specific components */
  .app-layout > *:not(.main-content) {
    display: none !important;
  }

  /* Hide any navigation, headers, buttons, etc */
  nav,
  header,
  .sidebar,
  .topbar,
  button,
  .p-button {
    display: none !important;
  }
}
</style>

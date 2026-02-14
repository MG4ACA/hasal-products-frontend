<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <Topbar />
      <div class="page-content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue';
import Topbar from './Topbar.vue';
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  background-color: #f5f5f5;
}

/* Print Styles - Hide sidebar and topbar when printing */
@media print {
  .app-layout {
    display: block !important;
    height: auto !important;
  }

  /* Hide the Sidebar component completely */
  .app-layout > :first-child {
    display: none !important;
  }

  .main-content {
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
  }

  .page-content {
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
    background-color: white !important;
  }
}
</style>

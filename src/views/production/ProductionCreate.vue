<script setup>
import ProductionRunForm from '@/components/production/ProductionRunForm.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useProductionStore } from '@/stores/production';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const productionStore = useProductionStore();
const { showSuccess, showError } = useToastNotification();
const loading = ref(false);

// Breadcrumb items
const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Production', to: '/production-runs' },
  { label: 'Create' },
];

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

// Handle form submission
const handleSubmit = async formData => {
  loading.value = true;
  try {
    await productionStore.createProductionRun(formData);
    showSuccess('Production run created successfully');
    router.push('/production-runs');
  } catch (error) {
    console.error('Failed to create production run:', error);
    showError(error.message || 'Failed to create production run');
  } finally {
    loading.value = false;
  }
};

// Handle cancel
const handleCancel = () => {
  router.push('/production-runs');
};
</script>

<template>
  <div class="production-create">
    <!-- Breadcrumb -->
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Create Production Run</h1>
          <p>Start a new production run</p>
        </div>
      </div>
    </div>

    <!-- Production Form -->
    <ProductionRunForm :loading="loading" @submit="handleSubmit" @cancel="handleCancel" />
  </div>
</template>

<style scoped>
.production-create {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-text h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.header-text p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .production-create {
    padding: 1rem;
  }

  .page-header {
    padding: 1rem;
  }

  .header-text h1 {
    font-size: 1.25rem;
  }
}
</style>

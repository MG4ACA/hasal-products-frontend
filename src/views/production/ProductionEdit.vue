<script setup>
import ProductionRunForm from '@/components/production/ProductionRunForm.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useProductionStore } from '@/stores/production';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const productionStore = useProductionStore();
const { showSuccess, showError } = useToastNotification();

const runId = ref(route.params.id);
const isLoading = ref(true);
const notFound = ref(false);
const loading = ref(false);

// Breadcrumb items
const breadcrumbItems = ref([
  { label: 'Dashboard', to: '/' },
  { label: 'Production', to: '/production-runs' },
  { label: 'Edit' },
]);

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

// Load production run data
onMounted(async () => {
  try {
    isLoading.value = true;
    await productionStore.fetchProductionRunById(runId.value);

    if (!productionStore.currentProductionRun) {
      notFound.value = true;
      showError('Production run not found');
    } else {
      // Update breadcrumb with production run number
      breadcrumbItems.value = [
        { label: 'Dashboard', to: '/' },
        { label: 'Production', to: '/production-runs' },
        { label: productionStore.currentProductionRun.run_number },
      ];
    }
  } catch (error) {
    console.error('Failed to load production run:', error);
    notFound.value = true;
    showError('Failed to load production run details');
  } finally {
    isLoading.value = false;
  }
});

// Handle form submission
const handleSubmit = async formData => {
  loading.value = true;
  try {
    await productionStore.updateProductionRun(runId.value, formData);
    showSuccess('Production run updated successfully');
    router.push('/production-runs');
  } catch (error) {
    console.error('Failed to update production run:', error);
    showError(error.message || 'Failed to update production run');
  } finally {
    loading.value = false;
  }
};

// Handle cancel
const handleCancel = () => {
  router.push('/production-runs');
};

const getStatusSeverity = status => {
  const severityMap = {
    planned: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger',
  };
  return severityMap[status] || 'info';
};
</script>

<template>
  <div class="production-edit">
    <!-- Breadcrumb -->
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner />
      <p>Loading production run details...</p>
    </div>

    <!-- Not Found State -->
    <div v-else-if="notFound" class="not-found-container">
      <i class="pi pi-exclamation-triangle" />
      <h2>Production Run Not Found</h2>
      <p>The production run you're looking for doesn't exist or has been deleted.</p>
      <Button
        label="Back to Production"
        icon="pi pi-arrow-left"
        @click="router.push('/production-runs')"
      />
    </div>

    <!-- Edit Form -->
    <template v-else>
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Edit Production Run</h1>
            <p>Update production run information</p>
            <div class="run-code">
              <span class="code-label">Run Number:</span>
              <span class="code-value">{{ productionStore.currentProductionRun?.run_number }}</span>
              <span class="status-badge">
                <Tag
                  :value="productionStore.currentProductionRun?.status"
                  :severity="getStatusSeverity(productionStore.currentProductionRun?.status)"
                />
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <ProductionRunForm
        :run-id="runId"
        :loading="loading"
        :initial-data="productionStore.currentProductionRun"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </template>
  </div>
</template>

<style scoped>
.production-edit {
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

.run-code {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.code-label {
  color: #6b7280;
  font-weight: 500;
}

.code-value {
  color: #1f2937;
  font-weight: 600;
  font-family: monospace;
}

.status-badge {
  display: inline-flex;
  align-items: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  gap: 1rem;
  color: #667eea;
}

.not-found-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  gap: 1rem;
  text-align: center;
}

.not-found-container i {
  font-size: 3rem;
  color: #ef4444;
}

.not-found-container h2 {
  color: #1f2937;
  margin: 0;
}

.not-found-container p {
  color: #6b7280;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .production-edit {
    padding: 1rem;
  }

  .page-header {
    padding: 1rem;
  }

  .header-text h1 {
    font-size: 1.25rem;
  }

  .run-code {
    flex-wrap: wrap;
  }
}
</style>

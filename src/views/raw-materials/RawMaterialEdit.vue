<script setup>
import BatchList from '@/components/raw-materials/BatchList.vue';
import RawMaterialForm from '@/components/raw-materials/RawMaterialForm.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useRawMaterialStore } from '@/stores/rawMaterial';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const rawMaterialStore = useRawMaterialStore();
const { showSuccess, showError } = useToastNotification();

const rawMaterialId = ref(route.params.id);
const isLoading = ref(true);
const notFound = ref(false);
const showBatchDialog = ref(false);

// Breadcrumb items
const breadcrumbItems = ref([
  { label: 'Dashboard', to: '/' },
  { label: 'Raw Materials', to: '/raw-materials' },
  { label: 'Edit' },
]);

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

// Load raw material data
onMounted(async () => {
  try {
    isLoading.value = true;
    await rawMaterialStore.fetchRawMaterialById(rawMaterialId.value);

    if (!rawMaterialStore.currentRawMaterial) {
      notFound.value = true;
      showError('Raw material not found');
    } else {
      // Update breadcrumb with raw material name
      breadcrumbItems.value = [
        { label: 'Dashboard', to: '/' },
        { label: 'Raw Materials', to: '/raw-materials' },
        { label: rawMaterialStore.currentRawMaterial.name },
      ];
    }
  } catch (error) {
    console.error('Failed to load raw material:', error);
    notFound.value = true;
    showError('Failed to load raw material details');
  } finally {
    isLoading.value = false;
  }
});

// Handle form submission
const handleSubmit = async formData => {
  try {
    await rawMaterialStore.updateRawMaterial(rawMaterialId.value, formData);
    showSuccess('Raw material updated successfully');
    router.push('/raw-materials');
  } catch (error) {
    console.error('Failed to update raw material:', error);
    showError(error.message || 'Failed to update raw material');
  }
};

// Handle cancel
const handleCancel = () => {
  router.push('/raw-materials');
};
</script>

<template>
  <div class="raw-material-edit">
    <!-- Breadcrumb -->
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner />
      <p>Loading raw material details...</p>
    </div>

    <!-- Not Found State -->
    <div v-else-if="notFound" class="not-found-container">
      <i class="pi pi-exclamation-triangle" />
      <h2>Raw Material Not Found</h2>
      <p>The raw material you're looking for doesn't exist or has been deleted.</p>
      <button class="p-button" @click="router.push('/raw-materials')">
        <i class="pi pi-arrow-left" />
        Back to Raw Materials
      </button>
    </div>

    <!-- Edit Form -->
    <template v-else>
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Edit Raw Material</h1>
            <p>Update raw material information</p>
            <div class="material-info">
              <div class="info-item">
                <span class="info-label">Material Code:</span>
                <span class="code-value">{{ rawMaterialStore.currentRawMaterial?.code }}</span>
              </div>
              <div v-if="rawMaterialStore.currentRawMaterial?.current_stock" class="info-item">
                <span class="info-label">Current Stock:</span>
                <span class="stock-value">
                  {{ rawMaterialStore.currentRawMaterial.current_stock }}
                  {{ rawMaterialStore.currentRawMaterial.unit }}
                </span>
              </div>
            </div>
          </div>
          <Button label="View Batches" icon="pi pi-list" outlined @click="showBatchDialog = true" />
        </div>
      </div>

      <!-- Raw Material Form -->
      <RawMaterialForm
        :initial-data="rawMaterialStore.currentRawMaterial"
        :is-edit="true"
        :loading="rawMaterialStore.loading"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />

      <!-- Batch List Dialog -->
      <Dialog
        v-model:visible="showBatchDialog"
        modal
        :style="{ width: '90vw', maxWidth: '1200px' }"
        :dismissable-mask="true"
      >
        <BatchList
          v-if="showBatchDialog && rawMaterialStore.currentRawMaterial"
          :material-id="rawMaterialStore.currentRawMaterial.id"
          :material-name="rawMaterialStore.currentRawMaterial.name"
          :unit="rawMaterialStore.currentRawMaterial.unit"
          @close="showBatchDialog = false"
        />
      </Dialog>
    </template>
  </div>
</template>

<style scoped>
.raw-material-edit {
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
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
}

.material-info {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.info-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.info-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.code-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  background: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.stock-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #059669;
  background: #d1fae5;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-container p {
  margin-top: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Not Found State */
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.not-found-container i {
  font-size: 4rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.not-found-container h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.not-found-container p {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

.not-found-container button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.not-found-container button:hover {
  background: #2563eb;
}

/* Responsive */
@media (max-width: 768px) {
  .raw-material-edit {
    padding: 1rem;
  }

  .page-header {
    padding: 1rem;
  }

  .header-text h1 {
    font-size: 1.25rem;
  }

  .material-info {
    flex-direction: column;
    gap: 0.5rem;
  }

  .not-found-container {
    padding: 3rem 1.5rem;
  }

  .not-found-container i {
    font-size: 3rem;
  }

  .not-found-container h2 {
    font-size: 1.25rem;
  }
}
</style>

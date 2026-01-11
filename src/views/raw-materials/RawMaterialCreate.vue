<script setup>
import RawMaterialForm from '@/components/raw-materials/RawMaterialForm.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useRawMaterialStore } from '@/stores/rawMaterial';
import { useRouter } from 'vue-router';

const router = useRouter();
const rawMaterialStore = useRawMaterialStore();
const { showSuccess, showError } = useToastNotification();

// Breadcrumb items
const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Raw Materials', to: '/raw-materials' },
  { label: 'Create' },
];

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

// Handle form submission
const handleSubmit = async formData => {
  try {
    await rawMaterialStore.createRawMaterial(formData);
    showSuccess('Raw material created successfully');
    router.push('/raw-materials');
  } catch (error) {
    console.error('Failed to create raw material:', error);
    showError(error.message || 'Failed to create raw material');
  }
};

// Handle cancel
const handleCancel = () => {
  router.push('/raw-materials');
};
</script>

<template>
  <div class="raw-material-create">
    <!-- Breadcrumb -->
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Create Raw Material</h1>
          <p>Add a new raw material to the inventory</p>
        </div>
      </div>
    </div>

    <!-- Raw Material Form -->
    <RawMaterialForm
      :loading="rawMaterialStore.loading"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.raw-material-create {
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
  .raw-material-create {
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

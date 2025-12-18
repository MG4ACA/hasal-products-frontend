<script setup>
import SupplierForm from '@/components/suppliers/SupplierForm.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useSupplierStore } from '@/stores/supplier';
import Breadcrumb from 'primevue/breadcrumb';
import { useRouter } from 'vue-router';

const router = useRouter();
const supplierStore = useSupplierStore();
const { showSuccess, showError } = useToastNotification();

// Breadcrumb items
const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Suppliers', to: '/suppliers' },
  { label: 'Create' },
];

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

// Handle form submission
const handleSubmit = async formData => {
  try {
    await supplierStore.createSupplier(formData);
    showSuccess('Supplier created successfully');
    router.push('/suppliers');
  } catch (error) {
    console.error('Failed to create supplier:', error);
    showError(error.response?.data?.message || 'Failed to create supplier');
  }
};

// Handle cancel
const handleCancel = () => {
  router.push('/suppliers');
};
</script>

<template>
  <div class="supplier-create">
    <!-- Breadcrumb -->
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Create Supplier</h1>
          <p>Add a new supplier to the system</p>
        </div>
      </div>
    </div>

    <!-- Supplier Form -->
    <SupplierForm :loading="supplierStore.loading" @submit="handleSubmit" @cancel="handleCancel" />
  </div>
</template>

<style scoped>
.supplier-create {
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
  .supplier-create {
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

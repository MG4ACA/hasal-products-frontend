<script setup>
import SupplierForm from '@/components/suppliers/SupplierForm.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useSupplierStore } from '@/stores/supplier';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const supplierStore = useSupplierStore();
const { showSuccess, showError } = useToastNotification();

const supplierId = ref(route.params.id);
const isLoading = ref(true);
const notFound = ref(false);

// Breadcrumb items
const breadcrumbItems = ref([
  { label: 'Dashboard', to: '/' },
  { label: 'Suppliers', to: '/suppliers' },
  { label: 'Edit' },
]);

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

// Load supplier data
onMounted(async () => {
  try {
    isLoading.value = true;
    await supplierStore.fetchSupplierById(supplierId.value);

    if (!supplierStore.currentSupplier) {
      notFound.value = true;
      showError('Supplier not found');
    } else {
      // Update breadcrumb with supplier name
      breadcrumbItems.value = [
        { label: 'Dashboard', to: '/' },
        { label: 'Suppliers', to: '/suppliers' },
        { label: supplierStore.currentSupplier.name },
      ];
    }
  } catch (error) {
    console.error('Failed to load supplier:', error);
    notFound.value = true;
    showError('Failed to load supplier details');
  } finally {
    isLoading.value = false;
  }
});

// Handle form submission
const handleSubmit = async formData => {
  try {
    await supplierStore.updateSupplier(supplierId.value, formData);
    showSuccess('Supplier updated successfully');
    router.push('/suppliers');
  } catch (error) {
    console.error('Failed to update supplier:', error);
    showError(error.response?.data?.message || 'Failed to update supplier');
  }
};

// Handle cancel
const handleCancel = () => {
  router.push('/suppliers');
};
</script>

<template>
  <div class="supplier-edit">
    <!-- Breadcrumb -->
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner />
      <p>Loading supplier details...</p>
    </div>

    <!-- Not Found State -->
    <div v-else-if="notFound" class="not-found-container">
      <i class="pi pi-exclamation-triangle" />
      <h2>Supplier Not Found</h2>
      <p>The supplier you're looking for doesn't exist or has been deleted.</p>
      <button class="p-button" @click="router.push('/suppliers')">
        <i class="pi pi-arrow-left" />
        Back to Suppliers
      </button>
    </div>

    <!-- Edit Form -->
    <template v-else>
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Edit Supplier</h1>
            <p>Update supplier information</p>
            <div class="supplier-code">
              <span class="code-label">Supplier Code:</span>
              <span class="code-value">{{ supplierStore.currentSupplier?.code }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Supplier Form -->
      <SupplierForm
        :initial-data="supplierStore.currentSupplier"
        :is-edit="true"
        :loading="supplierStore.loading"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </template>
  </div>
</template>

<style scoped>
.supplier-edit {
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
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
}

.supplier-code {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
}

.code-label {
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
  .supplier-edit {
    padding: 1rem;
  }

  .page-header {
    padding: 1rem;
  }

  .header-text h1 {
    font-size: 1.25rem;
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

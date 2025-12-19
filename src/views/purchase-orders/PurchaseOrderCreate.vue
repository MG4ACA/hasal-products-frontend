<template>
  <div class="purchase-order-create">
    <!-- Breadcrumb -->
    <nav class="breadcrumb">
      <router-link to="/dashboard"> Dashboard </router-link>
      <span class="separator">/</span>
      <router-link to="/purchase-orders"> Purchase Orders </router-link>
      <span class="separator">/</span>
      <span class="current">Create</span>
    </nav>

    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Create Purchase Order</h1>
        <p class="page-subtitle">Create a new purchase order for raw materials</p>
      </div>
    </div>

    <!-- Form -->
    <PurchaseOrderForm :loading="submitting" @submit="handleSubmit" @cancel="handleCancel" />
  </div>
</template>

<script setup>
import PurchaseOrderForm from '@/components/purchase-orders/PurchaseOrderForm.vue';
import { usePurchaseOrderStore } from '@/stores/purchaseOrder';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const purchaseOrderStore = usePurchaseOrderStore();
const toast = useToast();

const submitting = ref(false);

const handleSubmit = async formData => {
  try {
    submitting.value = true;
    await purchaseOrderStore.createPurchaseOrder(formData);

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Purchase order created successfully',
      life: 3000,
    });

    router.push('/purchase-orders');
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to create purchase order',
      life: 3000,
    });
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  router.push('/purchase-orders');
};
</script>

<style scoped>
.purchase-order-create {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.breadcrumb a {
  color: #2563eb;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.breadcrumb .separator {
  color: #cbd5e0;
}

.breadcrumb .current {
  color: #4a5568;
  font-weight: 600;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #718096;
  margin: 0;
}
</style>

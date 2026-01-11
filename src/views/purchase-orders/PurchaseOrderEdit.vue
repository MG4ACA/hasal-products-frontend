<template>
  <div class="purchase-order-edit">
    <!-- Breadcrumb -->
    <nav class="breadcrumb">
      <router-link to="/dashboard"> Dashboard </router-link>
      <span class="separator">/</span>
      <router-link to="/purchase-orders"> Purchase Orders </router-link>
      <span class="separator">/</span>
      <span class="current">{{ purchaseOrder?.po_number || 'Edit' }}</span>
    </nav>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <ProgressSpinner />
      <p>Loading purchase order...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <Card>
        <template #content>
          <Message severity="error" :closable="false">
            {{ error }}
          </Message>
          <Button
            label="Back to Purchase Orders"
            icon="pi pi-arrow-left"
            class="p-button-text"
            @click="router.push('/purchase-orders')"
          />
        </template>
      </Card>
    </div>

    <!-- Content -->
    <div v-else-if="purchaseOrder">
      <!-- Status Warning -->
      <Message
        v-if="purchaseOrder.status !== 'pending'"
        severity="warn"
        :closable="false"
        class="status-warning"
      >
        <strong>Warning:</strong> This purchase order has status "{{ purchaseOrder.status }}". Only
        pending purchase orders can be edited.
      </Message>

      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Edit Purchase Order</h1>
          <p class="page-subtitle">
            {{ purchaseOrder.po_number }}
          </p>
        </div>
        <Tag :severity="getStatusSeverity(purchaseOrder.status)" :value="purchaseOrder.status" />
      </div>

      <!-- Form -->
      <PurchaseOrderForm
        v-if="purchaseOrder.status === 'pending'"
        :initial-data="purchaseOrder"
        :is-edit="true"
        :loading="submitting"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />

      <Card v-else class="readonly-notice">
        <template #content>
          <div class="notice-content">
            <i class="pi pi-lock" style="font-size: 3rem; color: #cbd5e0" />
            <p>
              This purchase order cannot be edited because it has already been
              {{ purchaseOrder.status }}.
            </p>
            <Button
              label="View Purchase Order"
              icon="pi pi-eye"
              @click="router.push(`/purchase-orders/${purchaseOrder.id}/view`)"
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import PurchaseOrderForm from '@/components/purchase-orders/PurchaseOrderForm.vue';
import { usePurchaseOrderStore } from '@/stores/purchaseOrder';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const purchaseOrderStore = usePurchaseOrderStore();
const toast = useToast();

const loading = ref(false);
const submitting = ref(false);
const error = ref(null);

const purchaseOrder = computed(() => purchaseOrderStore.currentPurchaseOrder);

const getStatusSeverity = status => {
  const severities = {
    pending: 'warning',
    approved: 'info',
    received: 'success',
    cancelled: 'danger',
  };
  return severities[status] || 'secondary';
};

const loadPurchaseOrder = async () => {
  try {
    loading.value = true;
    error.value = null;
    const id = parseInt(route.params.id);

    if (isNaN(id)) {
      error.value = 'Invalid purchase order ID';
      return;
    }

    await purchaseOrderStore.fetchPurchaseOrderById(id);

    if (!purchaseOrder.value) {
      error.value = 'Purchase order not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load purchase order';
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async formData => {
  try {
    submitting.value = true;
    const id = parseInt(route.params.id);
    await purchaseOrderStore.updatePurchaseOrder(id, formData);

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Purchase order updated successfully',
      life: 3000,
    });

    router.push('/purchase-orders');
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Failed to update purchase order',
      life: 3000,
    });
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  router.push('/purchase-orders');
};

onMounted(() => {
  loadPurchaseOrder();
});
</script>

<style scoped>
.purchase-order-edit {
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

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-state p {
  margin-top: 16px;
  color: #718096;
}

.status-warning {
  margin-bottom: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  font-family: 'Courier New', monospace;
}

.readonly-notice {
  max-width: 600px;
  margin: 40px auto;
}

.notice-content {
  text-align: center;
  padding: 40px 20px;
}

.notice-content p {
  margin: 20px 0;
  color: #4a5568;
  font-size: 1.05rem;
}
</style>

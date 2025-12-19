<template>
  <div class="purchase-order-index">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Purchase Orders</h1>
        <p class="page-subtitle">Manage purchase orders and inventory receipts</p>
      </div>
      <Button
        label="Create Purchase Order"
        icon="pi pi-plus"
        class="p-button-success"
        @click="navigateToCreate"
      />
    </div>

    <!-- Filters Section -->
    <Card class="filters-card">
      <template #content>
        <div class="filters-grid">
          <div class="filter-item">
            <label for="search">Search PO Number</label>
            <InputText
              id="search"
              v-model="filters.search"
              placeholder="Enter PO number..."
              @input="debouncedSearch"
            />
          </div>

          <div class="filter-item">
            <label for="status">Status</label>
            <Dropdown
              id="status"
              v-model="filters.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="All Statuses"
              @change="applyFilters"
            />
          </div>

          <div class="filter-item">
            <label for="supplier">Supplier</label>
            <Dropdown
              id="supplier"
              v-model="filters.supplier_id"
              :options="supplierOptions"
              option-label="name"
              option-value="id"
              placeholder="All Suppliers"
              filter
              show-clear
              @change="applyFilters"
            />
          </div>

          <div class="filter-item">
            <label for="startDate">Start Date</label>
            <Calendar
              id="startDate"
              v-model="filters.start_date"
              date-format="yy-mm-dd"
              placeholder="From date"
              show-icon
              @date-select="applyFilters"
            />
          </div>

          <div class="filter-item">
            <label for="endDate">End Date</label>
            <Calendar
              id="endDate"
              v-model="filters.end_date"
              date-format="yy-mm-dd"
              placeholder="To date"
              show-icon
              @date-select="applyFilters"
            />
          </div>

          <div class="filter-item filter-actions">
            <Button
              label="Reset"
              icon="pi pi-refresh"
              class="p-button-outlined"
              @click="resetFilters"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Purchase Orders List -->
    <Card class="list-card">
      <template #content>
        <PurchaseOrderList
          :purchase-orders="purchaseOrderStore.getPurchaseOrders"
          :loading="purchaseOrderStore.isLoading"
          @view="viewPurchaseOrder"
          @edit="editPurchaseOrder"
          @delete="confirmDelete"
          @receive="openReceiveDialog"
        />

        <!-- Pagination -->
        <div v-if="pagination.total > 0" class="pagination-container">
          <Paginator
            :rows="pagination.limit"
            :total-records="pagination.total"
            :first="(pagination.page - 1) * pagination.limit"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            current-page-report-template="Showing {first} to {last} of {totalRecords} purchase orders"
            @page="onPageChange"
          />
        </div>
      </template>
    </Card>

    <!-- Receive PO Dialog -->
    <Dialog
      v-model:visible="receiveDialogVisible"
      header="Receive Purchase Order"
      :modal="true"
      :style="{ width: '800px' }"
      :closable="true"
    >
      <ReceivePO
        v-if="receiveDialogVisible && selectedPoId"
        :purchase-order-id="selectedPoId"
        @cancel="closeReceiveDialog"
        @success="handleReceiveSuccess"
      />
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      header="Delete Purchase Order"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle" style="font-size: 3rem; color: #f59e0b" />
        <p>Are you sure you want to delete this purchase order?</p>
        <p class="warning-text">This action cannot be undone.</p>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          class="p-button-text"
          @click="deleteDialogVisible = false"
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          class="p-button-danger"
          :loading="deleting"
          @click="deletePurchaseOrder"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import PurchaseOrderList from '@/components/purchase-orders/PurchaseOrderList.vue';
import ReceivePO from '@/components/purchase-orders/ReceivePO.vue';
import { usePurchaseOrderStore } from '@/stores/purchaseOrder';
import { useSupplierStore } from '@/stores/supplier';

import { useToast } from 'primevue/usetoast';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const purchaseOrderStore = usePurchaseOrderStore();
const supplierStore = useSupplierStore();
const toast = useToast();

const filters = reactive({
  search: '',
  status: '',
  supplier_id: null,
  start_date: null,
  end_date: null,
});

const pagination = computed(() => purchaseOrderStore.getPagination);
const receiveDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const selectedPoId = ref(null);
const deleting = ref(false);

const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Received', value: 'received' },
  { label: 'Cancelled', value: 'cancelled' },
];

const supplierOptions = computed(() => supplierStore.getSuppliers);

let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};

const applyFilters = async () => {
  try {
    const params = {
      page: 1,
      limit: pagination.value.limit,
      search: filters.search,
      status: filters.status,
      supplier_id: filters.supplier_id,
      start_date: filters.start_date ? formatDateForAPI(filters.start_date) : null,
      end_date: filters.end_date ? formatDateForAPI(filters.end_date) : null,
    };

    await purchaseOrderStore.fetchPurchaseOrders(params);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load purchase orders',
      life: 3000,
    });
  }
};

const resetFilters = () => {
  filters.search = '';
  filters.status = '';
  filters.supplier_id = null;
  filters.start_date = null;
  filters.end_date = null;
  purchaseOrderStore.resetFilters();
  loadPurchaseOrders();
};

const onPageChange = event => {
  const params = {
    page: event.page + 1,
    limit: event.rows,
    ...purchaseOrderStore.getFilters,
  };
  purchaseOrderStore.fetchPurchaseOrders(params);
};

const loadPurchaseOrders = async () => {
  try {
    await purchaseOrderStore.fetchPurchaseOrders({ page: 1, limit: 10 });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load purchase orders',
      life: 3000,
    });
  }
};

const loadSuppliers = async () => {
  try {
    await supplierStore.fetchSuppliers({ page: 1, limit: 1000 });
  } catch (error) {
    console.error('Failed to load suppliers:', error);
  }
};

const navigateToCreate = () => {
  router.push('/purchase-orders/create');
};

const viewPurchaseOrder = id => {
  router.push(`/purchase-orders/${id}/view`);
};

const editPurchaseOrder = id => {
  router.push(`/purchase-orders/${id}/edit`);
};

const confirmDelete = id => {
  selectedPoId.value = id;
  deleteDialogVisible.value = true;
};

const deletePurchaseOrder = async () => {
  try {
    deleting.value = true;
    await purchaseOrderStore.deletePurchaseOrder(selectedPoId.value);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Purchase order deleted successfully',
      life: 3000,
    });
    deleteDialogVisible.value = false;
    selectedPoId.value = null;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to delete purchase order',
      life: 3000,
    });
  } finally {
    deleting.value = false;
  }
};

const openReceiveDialog = async id => {
  selectedPoId.value = id;
  await purchaseOrderStore.fetchPurchaseOrderById(id);
  receiveDialogVisible.value = true;
};

const closeReceiveDialog = () => {
  receiveDialogVisible.value = false;
  selectedPoId.value = null;
};

const handleReceiveSuccess = () => {
  closeReceiveDialog();
  loadPurchaseOrders();
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Purchase order received successfully',
    life: 3000,
  });
};

const formatDateForAPI = date => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

onMounted(() => {
  loadPurchaseOrders();
  loadSuppliers();
});
</script>

<style scoped>
.purchase-order-index {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-content {
  flex: 1;
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

.filters-card {
  margin-bottom: 24px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-item label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
}

.list-card {
  margin-bottom: 24px;
}

.pagination-container {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.confirmation-content {
  text-align: center;
  padding: 20px;
}

.confirmation-content p {
  margin: 16px 0 8px 0;
  font-size: 1rem;
  color: #4a5568;
}

.warning-text {
  font-size: 0.9rem;
  color: #e53e3e;
  font-weight: 600;
}

:deep(.p-card-body) {
  padding: 20px;
}

:deep(.p-card-content) {
  padding: 0;
}
</style>

<template>
  <div class="purchase-order-view">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
      <p>Loading purchase order details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #e53e3e" />
      <p style="color: #e53e3e; margin-top: 12px">
        {{ error }}
      </p>
    </div>

    <!-- PO Details -->
    <div v-else-if="purchaseOrder" class="po-details">
      <!-- Header Section -->
      <div class="po-header">
        <div class="header-left">
          <h2 class="po-number">
            {{ purchaseOrder.po_number }}
          </h2>
          <Tag :value="purchaseOrder.status" :severity="getStatusSeverity(purchaseOrder.status)" />
        </div>
        <div class="header-right">
          <Button
            label="Back"
            icon="pi pi-arrow-left"
            class="p-button-text p-button-sm"
            @click="$emit('close')"
          />
          <Button
            v-if="purchaseOrder.status === 'pending'"
            label="Edit"
            icon="pi pi-pencil"
            class="p-button-outlined"
            @click="$emit('edit', purchaseOrder.id)"
          />
          <Button
            v-if="purchaseOrder.status === 'approved'"
            label="Receive"
            icon="pi pi-check-circle"
            class="p-button-success"
            @click="$emit('receive', purchaseOrder.id)"
          />
        </div>
      </div>

      <!-- Info Grid -->
      <Card class="info-card">
        <template #content>
          <div class="info-grid">
            <div class="info-item">
              <label>Supplier</label>
              <div class="info-value">
                <strong>{{ purchaseOrder.supplier?.name }}</strong>
                <span class="supplier-code">{{ purchaseOrder.supplier?.code }}</span>
              </div>
            </div>

            <div class="info-item">
              <label>Contact Person</label>
              <div class="info-value">
                {{ purchaseOrder.supplier?.contact_person || 'N/A' }}
              </div>
            </div>

            <div class="info-item">
              <label>Phone</label>
              <div class="info-value">
                {{ purchaseOrder.supplier?.phone || 'N/A' }}
              </div>
            </div>

            <div class="info-item">
              <label>Email</label>
              <div class="info-value">
                {{ purchaseOrder.supplier?.email || 'N/A' }}
              </div>
            </div>

            <div class="info-item">
              <label>Order Date</label>
              <div class="info-value">
                {{ formatDate(purchaseOrder.order_date) }}
              </div>
            </div>

            <div class="info-item">
              <label>Expected Delivery</label>
              <div class="info-value">
                {{ purchaseOrder.expected_date ? formatDate(purchaseOrder.expected_date) : 'N/A' }}
              </div>
            </div>

            <div class="info-item">
              <label>Received Date</label>
              <div class="info-value">
                {{
                  purchaseOrder.received_date
                    ? formatDate(purchaseOrder.received_date)
                    : 'Not received'
                }}
              </div>
            </div>

            <div class="info-item">
              <label>Total Amount</label>
              <div class="info-value amount">
                {{ formatCurrency(purchaseOrder.total_amount) }}
              </div>
            </div>
          </div>

          <div v-if="purchaseOrder.notes" class="notes-section">
            <label>Notes</label>
            <p class="notes-text">
              {{ purchaseOrder.notes }}
            </p>
          </div>
        </template>
      </Card>

      <!-- Items Section -->
      <Card class="items-card">
        <template #header>
          <div class="card-header">
            <h3>Order Items</h3>
            <span class="item-count">{{ purchaseOrder.items?.length || 0 }} items</span>
          </div>
        </template>
        <template #content>
          <DataTable :value="purchaseOrder.items" responsive-layout="scroll">
            <Column field="material.code" header="Material Code">
              <template #body="{ data }">
                <span class="material-code">{{ data.material?.code }}</span>
              </template>
            </Column>
            <Column field="material.name" header="Material Name">
              <template #body="{ data }">
                <span class="material-name">{{ data.material?.name }}</span>
              </template>
            </Column>
            <Column field="quantity" header="Quantity">
              <template #body="{ data }">
                <span class="quantity"
                  >{{ formatNumber(data.quantity) }} {{ data.material?.unit }}</span
                >
              </template>
            </Column>
            <Column field="unit_cost" header="Unit Cost">
              <template #body="{ data }">
                <span class="unit-cost">{{ formatCurrency(data.unit_cost) }}</span>
              </template>
            </Column>
            <Column field="total_cost" header="Total Cost">
              <template #body="{ data }">
                <span class="total-cost">{{ formatCurrency(data.quantity * data.unit_cost) }}</span>
              </template>
            </Column>
          </DataTable>

          <div class="items-total">
            <span class="total-label">Total Amount:</span>
            <span class="total-value">{{ formatCurrency(purchaseOrder.total_amount) }}</span>
          </div>
        </template>
      </Card>

      <!-- Batches Section (if received) -->
      <Card v-if="batches.length > 0" class="batches-card">
        <template #header>
          <div class="card-header">
            <h3>Received Batches</h3>
            <span class="batch-count">{{ batches.length }} batches</span>
          </div>
        </template>
        <template #content>
          <DataTable :value="batches" responsive-layout="scroll">
            <Column field="batch_number" header="Batch Number">
              <template #body="{ data }">
                <span class="batch-number">{{ data.batch_number }}</span>
              </template>
            </Column>
            <Column field="batch_type" header="Type">
              <template #body="{ data }">
                <Tag
                  :value="data.batch_type === 'receipt' ? 'Receipt' : 'Return'"
                  :severity="data.batch_type === 'receipt' ? 'success' : 'warning'"
                />
              </template>
            </Column>
            <Column field="material.name" header="Material">
              <template #body="{ data }">
                <span>{{ data.material?.name }}</span>
              </template>
            </Column>
            <Column field="initial_quantity" header="Quantity">
              <template #body="{ data }">
                <span :class="{ 'negative-qty': data.initial_quantity < 0 }">
                  {{ formatNumber(data.initial_quantity) }} {{ data.material?.unit }}
                </span>
              </template>
            </Column>
            <Column field="expiry_date" header="Expiry Date">
              <template #body="{ data }">
                <span>{{ data.expiry_date ? formatDate(data.expiry_date) : 'N/A' }}</span>
              </template>
            </Column>
            <Column v-if="hasReturns" field="return_reason" header="Return Reason">
              <template #body="{ data }">
                <span v-if="data.return_reason">{{ formatReturnReason(data.return_reason) }}</span>
                <span v-else>-</span>
              </template>
            </Column>
            <Column v-if="hasReturns" field="return_disposition" header="Disposition">
              <template #body="{ data }">
                <Tag
                  v-if="data.return_disposition"
                  :value="data.return_disposition === 'stock' ? 'Return to Stock' : 'Dispose'"
                  :severity="data.return_disposition === 'stock' ? 'info' : 'danger'"
                />
                <span v-else>-</span>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- Audit Info -->
      <Card class="audit-card">
        <template #content>
          <div class="audit-info">
            <div class="audit-item">
              <i class="pi pi-calendar" />
              <span>Created: {{ formatDateTime(purchaseOrder.created_at) }}</span>
            </div>
            <div class="audit-item">
              <i class="pi pi-clock" />
              <span>Last Updated: {{ formatDateTime(purchaseOrder.updated_at) }}</span>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { usePurchaseOrderStore } from '@/stores/purchaseOrder';
import { formatCurrency, formatDate, formatDateTime, formatNumber } from '@/utils/formatters';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Tag from 'primevue/tag';
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
  purchaseOrderId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['edit', 'receive', 'close']);

const purchaseOrderStore = usePurchaseOrderStore();
const loading = ref(false);
const error = ref(null);

const purchaseOrder = computed(() => purchaseOrderStore.currentPurchaseOrder);

const batches = computed(() => {
  // In a real implementation, this would come from the API
  // For now, we'll return an empty array as batches are tracked separately
  return [];
});

const hasReturns = computed(() => {
  return batches.value.some(batch => batch.batch_type === 'return');
});

const getStatusSeverity = status => {
  const severityMap = {
    pending: 'warning',
    approved: 'info',
    received: 'success',
    cancelled: 'danger',
  };
  return severityMap[status] || 'secondary';
};

const formatReturnReason = reason => {
  const reasonMap = {
    damaged: 'Damaged',
    expired: 'Expired',
    excess: 'Excess',
    quality_issue: 'Quality Issue',
    wrong_item: 'Wrong Item',
    other: 'Other',
  };
  return reasonMap[reason] || reason;
};

const loadPurchaseOrder = async () => {
  try {
    loading.value = true;
    error.value = null;
    await purchaseOrderStore.fetchPurchaseOrderById(props.purchaseOrderId);
  } catch (err) {
    error.value = err.message || 'Failed to load purchase order';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadPurchaseOrder();
});
</script>

<style scoped>
.purchase-order-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
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
  font-size: 1rem;
}

.po-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.po-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.po-number {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  font-family: 'Courier New', monospace;
}

.header-right {
  display: flex;
  gap: 12px;
}

.info-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item label {
  font-weight: 600;
  color: #718096;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  color: #2d3748;
  font-size: 1rem;
}

.info-value strong {
  font-size: 1.1rem;
}

.supplier-code {
  display: block;
  font-size: 0.875rem;
  color: #718096;
  font-family: 'Courier New', monospace;
  margin-top: 2px;
}

.info-value.amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2563eb;
  font-family: 'Courier New', monospace;
}

.notes-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.notes-section label {
  display: block;
  font-weight: 600;
  color: #718096;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.notes-text {
  color: #2d3748;
  line-height: 1.6;
  margin: 0;
}

.items-card,
.batches-card,
.audit-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #2d3748;
}

.item-count,
.batch-count {
  background: #edf2f7;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  color: #4a5568;
  font-weight: 600;
}

.material-code {
  font-family: 'Courier New', monospace;
  color: #4a5568;
  font-size: 0.9rem;
}

.material-name {
  font-weight: 600;
  color: #2d3748;
}

.quantity,
.unit-cost,
.total-cost {
  font-family: 'Courier New', monospace;
  color: #2d3748;
}

.items-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e2e8f0;
}

.total-label {
  font-weight: 600;
  color: #4a5568;
  font-size: 1.1rem;
}

.total-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2563eb;
  font-family: 'Courier New', monospace;
}

.batch-number {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #2563eb;
}

.negative-qty {
  color: #e53e3e;
  font-weight: 600;
}

.audit-card {
  background: #f7fafc;
}

.audit-info {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.audit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
  font-size: 0.875rem;
}

.audit-item i {
  color: #a0aec0;
}

:deep(.p-card-content) {
  padding: 20px;
}

:deep(.p-card-header) {
  padding: 0;
}
</style>

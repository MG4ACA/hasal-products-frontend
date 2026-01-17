<template>
  <div class="purchase-order-list">
    <DataTable
      :value="purchaseOrders"
      :loading="loading"
      striped-rows
      responsive-layout="scroll"
      :paginator="false"
      data-key="id"
      class="p-datatable-sm"
    >
      <template #empty>
        <div class="empty-state">
          <i class="pi pi-inbox empty-icon" />
          <p class="empty-text">No purchase orders found</p>
          <p class="empty-subtext">Create your first purchase order to get started</p>
        </div>
      </template>

      <Column field="po_number" header="PO Number" :sortable="true" style="min-width: 150px">
        <template #body="{ data }">
          <span class="po-number-badge">{{ data.po_number }}</span>
        </template>
      </Column>

      <Column field="supplier.name" header="Supplier" :sortable="true" style="min-width: 180px">
        <template #body="{ data }">
          <div class="supplier-cell">
            <div class="supplier-name">
              {{ data.supplier?.name || 'N/A' }}
            </div>
            <div class="supplier-code">
              {{ data.supplier?.code || '' }}
            </div>
          </div>
        </template>
      </Column>

      <Column field="order_date" header="Order Date" :sortable="true" style="min-width: 120px">
        <template #body="{ data }">
          {{ formatDate(data.order_date) }}
        </template>
      </Column>

      <Column
        field="expected_date"
        header="Expected Delivery"
        :sortable="true"
        style="min-width: 150px"
      >
        <template #body="{ data }">
          {{ data.expected_date ? formatDate(data.expected_date) : 'N/A' }}
        </template>
      </Column>

      <Column field="total_amount" header="Total Amount" :sortable="true" style="min-width: 130px">
        <template #body="{ data }">
          <span class="amount-value">{{ formatCurrency(data.total_amount) }}</span>
        </template>
      </Column>

      <Column field="status" header="Status" :sortable="true" style="min-width: 120px">
        <template #body="{ data }">
          <Tag :severity="getStatusSeverity(data.status)" :value="getStatusLabel(data.status)" />
        </template>
      </Column>

      <Column header="Actions" style="min-width: 180px" :frozen="true" align-frozen="right">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button
              v-tooltip.top="'View Details'"
              icon="pi pi-eye"
              class="p-button-rounded p-button-text p-button-sm"
              @click="$emit('view', data.id)"
            />
            <Button
              v-if="data.status === 'pending'"
              v-tooltip.top="'Edit'"
              icon="pi pi-pencil"
              class="p-button-rounded p-button-text p-button-sm p-button-warning"
              @click="$emit('edit', data.id)"
            />
            <Button
              v-if="data.status === 'pending' || data.status === 'partial'"
              v-tooltip.top="'Receive PO'"
              icon="pi pi-check"
              class="p-button-rounded p-button-text p-button-sm"
              @click="$emit('receive', data.id)"
            />
            <Button
              v-if="data.status === 'pending'"
              v-tooltip.top="'Delete'"
              icon="pi pi-trash"
              class="p-button-rounded p-button-text p-button-sm p-button-danger"
              @click="$emit('delete', data.id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { formatCurrency, formatDate } from '@/utils/formatters';

defineProps({
  purchaseOrders: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['view', 'edit', 'delete', 'receive']);

const getStatusSeverity = status => {
  const severities = {
    pending: 'warning',
    approved: 'info',
    received: 'success',
    cancelled: 'danger',
  };
  return severities[status] || 'secondary';
};

const getStatusLabel = status => {
  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    received: 'Received',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
};
</script>

<style scoped>
.purchase-order-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  color: #cbd5e0;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4a5568;
  margin: 0 0 8px 0;
}

.empty-subtext {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
}

.po-number-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #edf2f7;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  font-weight: 600;
  color: #2d3748;
}

.supplier-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.supplier-name {
  font-weight: 600;
  color: #2d3748;
}

.supplier-code {
  font-size: 0.8rem;
  color: #718096;
  font-family: 'Courier New', monospace;
}

.amount-value {
  font-weight: 600;
  color: #2d3748;
  font-family: 'Courier New', monospace;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f7fafc;
  color: #2d3748;
  font-weight: 600;
  padding: 12px;
  border-bottom: 2px solid #e2e8f0;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #f7fafc;
}
</style>

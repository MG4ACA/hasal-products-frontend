<template>
  <div class="supplier-list">
    <DataTable :value="suppliers" :loading="loading" striped-rows responsive-layout="scroll">
      <template #empty>
        <div class="empty-state">
          <i class="pi pi-inbox" style="font-size: 3rem; color: #ccc" />
          <p>No suppliers found</p>
        </div>
      </template>

      <Column field="code" header="Code" sortable>
        <template #body="{ data }">
          <span class="supplier-code">{{ data.code }}</span>
        </template>
      </Column>

      <Column field="name" header="Name" sortable>
        <template #body="{ data }">
          <strong>{{ data.name }}</strong>
        </template>
      </Column>

      <Column field="contact_person" header="Contact Person" sortable />

      <Column field="phone" header="Phone" />

      <Column field="email" header="Email" />

      <Column field="payment_terms" header="Payment Terms" sortable>
        <template #body="{ data }">
          <span :class="`payment-badge payment-${data.payment_terms}`">
            {{ formatPaymentTerms(data.payment_terms) }}
          </span>
        </template>
      </Column>

      <Column field="balance" header="Balance" sortable>
        <template #body="{ data }">
          <span :class="['balance', parseFloat(data.balance) > 0 ? 'balance-positive' : '']">
            LKR {{ formatCurrency(data.balance) }}
          </span>
        </template>
      </Column>

      <Column field="status" header="Status" sortable>
        <template #body="{ data }">
          <span :class="`status-badge status-${data.status}`">
            {{ data.status }}
          </span>
        </template>
      </Column>

      <Column header="Actions" :exportable="false">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button
              v-tooltip.top="'View'"
              icon="pi pi-eye"
              class="p-button-text p-button-rounded"
              @click="$emit('view', data.id)"
            />
            <Button
              v-tooltip.top="'Edit'"
              icon="pi pi-pencil"
              class="p-button-text p-button-rounded p-button-warning"
              @click="$emit('edit', data.id)"
            />
            <Button
              v-tooltip.top="'Delete'"
              icon="pi pi-trash"
              class="p-button-text p-button-rounded p-button-danger"
              @click="$emit('delete', data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

defineProps({
  suppliers: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['view', 'edit', 'delete']);

const formatPaymentTerms = terms => {
  const termsMap = {
    cash: 'Cash',
    credit: 'Credit',
    check: 'Check',
  };
  return termsMap[terms] || terms;
};

const formatCurrency = value => {
  return parseFloat(value || 0).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
</script>

<style scoped>
.supplier-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.supplier-code {
  font-family: monospace;
  background: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.payment-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
}

.payment-cash {
  background: #e8f5e9;
  color: #2e7d32;
}

.payment-credit {
  background: #fff3e0;
  color: #e65100;
}

.payment-check {
  background: #e3f2fd;
  color: #1565c0;
}

.balance {
  font-weight: 600;
  color: #333;
}

.balance-positive {
  color: #d32f2f;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-inactive {
  background: #ffebee;
  color: #c62828;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}
</style>

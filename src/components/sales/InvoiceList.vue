<script setup>
defineProps({
  invoices: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['view', 'edit', 'delete']);

const formatCurrency = amount => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
  }).format(amount || 0);
};

const formatDate = date => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB');
};

const getPaymentStatusSeverity = status => {
  const severityMap = {
    paid: 'success',
    unpaid: 'danger',
    partial: 'warning',
  };
  return severityMap[status] || 'secondary';
};

const getPaymentMethodTag = method => {
  const tagMap = {
    cash: { severity: 'success', label: 'Cash' },
    credit: { severity: 'warning', label: 'Credit' },
    check: { severity: 'info', label: 'Check' },
  };
  return tagMap[method] || { severity: 'secondary', label: method };
};
</script>

<template>
  <DataTable :value="invoices" :loading="loading" responsive-layout="scroll">
    <template #empty>
      <div class="empty-state">
        <i class="pi pi-info-circle" style="font-size: 3rem" />
        <p>No invoices found</p>
      </div>
    </template>

    <Column field="invoice_number" header="Invoice #" sortable>
      <template #body="{ data }">
        <span class="font-semibold">{{ data.invoice_number }}</span>
      </template>
    </Column>

    <Column field="invoice_date" header="Date" sortable>
      <template #body="{ data }">
        {{ formatDate(data.invoice_date) }}
      </template>
    </Column>

    <Column field="outlet" header="Outlet" sortable>
      <template #body="{ data }">
        <div v-if="data.outlet">
          <div class="font-semibold">
            {{ data.outlet.name }}
          </div>
          <div class="text-sm text-gray-500">
            {{ data.outlet.code }}
          </div>
        </div>
        <span v-else>-</span>
      </template>
    </Column>

    <Column field="sales_ref" header="Sales Ref">
      <template #body="{ data }">
        <span v-if="data.sales_ref" class="sales-ref-badge">
          {{ data.sales_ref.name }}
        </span>
        <span v-else class="text-gray-400">-</span>
      </template>
    </Column>

    <Column field="route" header="Route">
      <template #body="{ data }">
        <span v-if="data.route" class="route-badge">
          {{ data.route.name }}
        </span>
        <span v-else class="text-gray-400">-</span>
      </template>
    </Column>

    <Column field="total_amount" header="Total" sortable>
      <template #body="{ data }">
        <div>
          <span class="font-semibold">{{ formatCurrency(data.total_amount) }}</span>
          <div v-if="data.discount_percent > 0" class="text-xs text-gray-500">
            {{ data.discount_percent }}% invoice discount
          </div>
        </div>
      </template>
    </Column>

    <Column field="payment_method" header="Payment">
      <template #body="{ data }">
        <Tag
          :value="getPaymentMethodTag(data.payment_method).label"
          :severity="getPaymentMethodTag(data.payment_method).severity"
        />
      </template>
    </Column>

    <Column field="payment_status" header="Status" sortable>
      <template #body="{ data }">
        <Tag
          :value="data.payment_status"
          :severity="getPaymentStatusSeverity(data.payment_status)"
          style="text-transform: capitalize"
        />
      </template>
    </Column>

    <Column header="Actions">
      <template #body="{ data }">
        <div class="action-buttons">
          <Button
            v-tooltip.top="'View'"
            icon="pi pi-eye"
            class="p-button-rounded p-button-text p-button-info"
            @click="emit('view', data.id)"
          />
          <!-- Edit button disabled - backend only supports updating notes and payment_status
          <Button
            v-tooltip.top="'Edit'"
            icon="pi pi-pencil"
            class="p-button-rounded p-button-text"
            @click="emit('edit', data.id)"
          />
          -->
          <Button
            v-tooltip.top="'Delete'"
            icon="pi pi-trash"
            class="p-button-rounded p-button-text p-button-danger"
            @click="emit('delete', data)"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-state i {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.font-semibold {
  font-weight: 600;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-400 {
  color: #9ca3af;
}

.sales-ref-badge {
  background-color: #e0f2fe;
  color: #075985;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.route-badge {
  background-color: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}
</style>

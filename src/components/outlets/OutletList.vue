<script setup>
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Tag from 'primevue/tag';

defineProps({
  outlets: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['view', 'edit', 'delete']);

const getStatusSeverity = status => {
  return status === 'active' ? 'success' : 'danger';
};

const getPaymentTermsTag = terms => {
  return terms === 'credit' ? 'warning' : 'info';
};

const formatCurrency = amount => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
  }).format(amount || 0);
};
</script>

<template>
  <DataTable :value="outlets" :loading="loading" paginator :rows="10" responsive-layout="scroll">
    <template #empty>
      <div class="empty-state">
        <i class="pi pi-info-circle" style="font-size: 3rem" />
        <p>No outlets found</p>
      </div>
    </template>

    <Column field="code" header="Code" sortable>
      <template #body="{ data }">
        <span class="font-semibold">{{ data.code }}</span>
      </template>
    </Column>

    <Column field="name" header="Outlet Name" sortable>
      <template #body="{ data }">
        {{ data.name }}
      </template>
    </Column>

    <Column field="owner_name" header="Owner" sortable>
      <template #body="{ data }">
        {{ data.owner_name || '-' }}
      </template>
    </Column>

    <Column field="phone" header="Phone">
      <template #body="{ data }">
        {{ data.phone || '-' }}
      </template>
    </Column>

    <Column field="route" header="Route">
      <template #body="{ data }">
        <span v-if="data.route" class="route-badge">{{ data.route.name }}</span>
        <span v-else class="text-gray-400">-</span>
      </template>
    </Column>

    <Column field="payment_terms" header="Payment" sortable>
      <template #body="{ data }">
        <Tag
          :value="data.payment_terms"
          :severity="getPaymentTermsTag(data.payment_terms)"
          style="text-transform: capitalize"
        />
      </template>
    </Column>

    <Column field="balance" header="Balance" sortable>
      <template #body="{ data }">
        <span :class="{ 'text-danger': data.balance > 0 }">
          {{ formatCurrency(data.balance) }}
        </span>
      </template>
    </Column>

    <Column field="status" header="Status" sortable>
      <template #body="{ data }">
        <Tag
          :value="data.status"
          :severity="getStatusSeverity(data.status)"
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
          <Button
            v-tooltip.top="'Edit'"
            icon="pi pi-pencil"
            class="p-button-rounded p-button-text p-button-success"
            @click="emit('edit', data.id)"
          />
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

.text-gray-400 {
  color: #9ca3af;
}

.text-danger {
  color: #ef4444;
  font-weight: 600;
}

.route-badge {
  background-color: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}
</style>

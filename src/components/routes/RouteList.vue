<script setup>
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Tag from 'primevue/tag';

defineProps({
  routes: {
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
</script>

<template>
  <DataTable :value="routes" :loading="loading" responsive-layout="scroll">
    <template #empty>
      <div class="empty-state">
        <i class="pi pi-info-circle" style="font-size: 3rem" />
        <p>No routes found</p>
      </div>
    </template>

    <Column field="code" header="Code" sortable>
      <template #body="{ data }">
        <span class="font-semibold">{{ data.code }}</span>
      </template>
    </Column>

    <Column field="name" header="Route Name" sortable>
      <template #body="{ data }">
        {{ data.name }}
      </template>
    </Column>

    <Column field="description" header="Description">
      <template #body="{ data }">
        <span class="text-gray-600">{{ data.description || '-' }}</span>
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
            class="p-button-rounded p-button-text"
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

.text-gray-600 {
  color: #4b5563;
}
</style>

<script setup>
defineProps({
  vehicles: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['view', 'edit', 'delete', 'assign']);

const getStatusSeverity = status => {
  return status === 'active' ? 'success' : 'danger';
};
</script>

<template>
  <DataTable :value="vehicles" :loading="loading" responsive-layout="scroll">
    <template #empty>
      <div class="empty-state">
        <i class="pi pi-info-circle" style="font-size: 3rem" />
        <p>No vehicles found</p>
      </div>
    </template>

    <Column field="code" header="Code" sortable>
      <template #body="{ data }">
        <span class="font-semibold">{{ data.code }}</span>
      </template>
    </Column>

    <Column field="name" header="Vehicle Name" sortable>
      <template #body="{ data }">
        {{ data.name }}
      </template>
    </Column>

    <Column field="registration_number" header="Registration" sortable>
      <template #body="{ data }">
        <span class="registration-badge">{{ data.registration_number }}</span>
      </template>
    </Column>

    <Column field="currentAssignment" header="Assigned Territory">
      <template #body="{ data }">
        <span v-if="data.currentAssignment" class="route-badge">
          {{ data.currentAssignment.route?.name || 'Unknown' }}
        </span>
        <Tag v-else value="Unassigned" severity="secondary" />
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
            v-tooltip.top="'View History'"
            icon="pi pi-eye"
            class="p-button-rounded p-button-text p-button-info"
            @click="emit('view', data.id)"
          />
          <Button
            v-tooltip.top="'Assign/Unassign'"
            icon="pi pi-link"
            class="p-button-rounded p-button-text p-button-warning"
            @click="emit('assign', data)"
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

.registration-badge {
  background-color: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #374151;
}

.route-badge {
  background-color: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}
</style>

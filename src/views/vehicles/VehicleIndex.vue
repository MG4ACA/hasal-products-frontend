<script setup>
import VehicleAssignment from '@/components/vehicles/VehicleAssignment.vue';
import VehicleList from '@/components/vehicles/VehicleList.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useVehicleStore } from '@/stores/vehicle';
import { useConfirm } from 'primevue/useconfirm';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const vehicleStore = useVehicleStore();
const { showSuccess, showError } = useToastNotification();
const confirm = useConfirm();

const searchQuery = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const showAssignmentDialog = ref(false);
const selectedVehicleId = ref(null);

const statusOptions = [
  { label: 'All Status', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

// Debounce timer
let searchTimeout;
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchVehicles();
  }, 500);
});

watch([statusFilter], () => {
  currentPage.value = 1;
  fetchVehicles();
});

const fetchVehicles = async () => {
  loading.value = true;
  try {
    await vehicleStore.fetchVehicles({
      search: searchQuery.value,
      status: statusFilter.value,
      page: currentPage.value,
      limit: pageSize.value,
    });
  } catch (error) {
    showError('Failed to fetch vehicles');
  } finally {
    loading.value = false;
  }
};

const handlePageChange = event => {
  currentPage.value = event.page + 1;
  fetchVehicles();
};

const handleView = id => {
  router.push(`/vehicles/${id}/history`);
};

const handleAssign = vehicle => {
  selectedVehicleId.value = vehicle.id;
  showAssignmentDialog.value = true;
};

const handleAssignmentChange = () => {
  fetchVehicles();
};

const handleEdit = id => {
  router.push(`/vehicles/${id}/edit`);
};

const handleDelete = vehicle => {
  confirm.require({
    message: `Are you sure you want to delete vehicle "${vehicle.name}"? This action cannot be undone.`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await vehicleStore.deleteVehicle(vehicle.id);
        showSuccess('Vehicle deleted successfully');
        fetchVehicles();
      } catch (error) {
        showError(error.message || 'Failed to delete vehicle');
      }
    },
  });
};

const handleCreate = () => {
  router.push('/vehicles/create');
};

onMounted(() => {
  fetchVehicles();
});
</script>

<template>
  <div class="vehicle-index">
    <ConfirmDialog />
    <VehicleAssignment
      v-model:visible="showAssignmentDialog"
      :vehicle-id="selectedVehicleId"
      @assigned="handleAssignmentChange"
      @unassigned="handleAssignmentChange"
    />

    <div class="page-header">
      <div>
        <h1>Vehicles</h1>
        <p class="text-muted">Manage fleet vehicles</p>
      </div>
      <Button label="Add Vehicle" icon="pi pi-plus" @click="handleCreate" />
    </div>

    <div class="filters-card">
      <div class="filters">
        <div class="search-box">
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
              v-model="searchQuery"
              placeholder="Search vehicles..."
              class="search-input"
            />
          </span>
        </div>

        <Dropdown
          v-model="statusFilter"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          placeholder="Filter by status"
          class="filter-dropdown"
        />
      </div>
    </div>

    <div class="content-card">
      <VehicleList
        :vehicles="vehicleStore.vehicles"
        :loading="loading"
        @view="handleView"
        @assign="handleAssign"
        @edit="handleEdit"
        @delete="handleDelete"
      />

      <Paginator
        v-if="vehicleStore.totalVehicles > pageSize"
        :rows="pageSize"
        :total-records="vehicleStore.totalVehicles"
        @page="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.vehicle-index {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
}

.text-muted {
  color: #6b7280;
  margin: 0.25rem 0 0;
}

.filters-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.filters {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: center;
}

.search-box {
  flex: 1;
}

.search-input {
  width: 100%;
}

.filter-dropdown {
  min-width: 200px;
}

.content-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .vehicle-index {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-header button {
    width: 100%;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .filter-dropdown {
    width: 100%;
  }
}
</style>

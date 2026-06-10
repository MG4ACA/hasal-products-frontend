<script setup>
import VehicleAssignment from '@/components/vehicles/VehicleAssignment.vue';
import VehicleList from '@/components/vehicles/VehicleList.vue';
import { useFilterClear } from '@/composables/useFilterClear';
import { useToastNotification } from '@/composables/useToastNotification';
import { useVehicleStore } from '@/stores/vehicle';
import { useConfirm } from 'primevue/useconfirm';
import { onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const vehicleStore = useVehicleStore();
const { showSuccess, showError } = useToastNotification();
const confirm = useConfirm();

const filters = reactive({
  search: '',
  status: '',
  page: 1,
  limit: 10,
});

const initialFilters = {
  search: '',
  status: '',
  page: 1,
  limit: 10,
};

const { activeFilterCount, hasActiveFilters, clearAllFilters } = useFilterClear(filters);

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
watch(
  () => filters.search,
  () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filters.page = 1;
      fetchVehicles();
    }, 500);
  }
);

watch(
  () => filters.status,
  () => {
    filters.page = 1;
    fetchVehicles();
  }
);

const fetchVehicles = async () => {
  loading.value = true;
  try {
    // Update store filters and pagination
    vehicleStore.pagination.page = filters.page;
    vehicleStore.pagination.limit = filters.limit;
    vehicleStore.filters.search = filters.search;
    vehicleStore.filters.status = filters.status;

    await vehicleStore.fetchVehicles();
  } catch (error) {
    showError('Failed to fetch vehicles');
  } finally {
    loading.value = false;
  }
};

const handlePageChange = event => {
  filters.page = event.page + 1;
  fetchVehicles();
};

const onClearFilters = () => {
  clearAllFilters(initialFilters, {
    onClear: fetchVehicles,
  });
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
      <div class="header-actions">
        <Button
          v-tooltip="'Refresh'"
          icon="pi pi-refresh"
          rounded
          severity="primary"
          @click="fetchVehicles"
        />
        <Button label="Add Vehicle" icon="pi pi-plus" @click="handleCreate" />
      </div>
    </div>

    <div class="filters-card">
      <div class="filters">
        <div class="search-box">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="filters.search"
              placeholder="Search vehicles..."
              class="search-input"
            />
          </IconField>
        </div>

        <Dropdown
          v-model="filters.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          placeholder="Filter by status"
          class="filter-dropdown"
        />

        <Avatar
          v-badge.info="activeFilterCount"
          :icon="hasActiveFilters ? 'pi pi-filter-slash' : 'pi pi-filter'"
          class="p-overlay-badge"
          @click="hasActiveFilters && onClearFilters()"
        />
      </div>
    </div>

    <Card class="list-card">
      <template #content>
        <VehicleList
          :vehicles="vehicleStore.vehicles"
          :loading="loading"
          @view="handleView"
          @assign="handleAssign"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </template>
    </Card>

    <!-- Pagination -->
    <Card class="pagination-card">
      <template #content>
        <div v-if="vehicleStore.pagination.total > 0" class="pagination-container">
          <Paginator
            :rows="filters.limit"
            :total-records="vehicleStore.pagination.total"
            :first="(filters.page - 1) * filters.limit"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            current-page-report-template="Showing {first} to {last} of {totalRecords} vehicles"
            @page="handlePageChange"
          />
        </div>
      </template>
    </Card>
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
  display: flex;
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

.pagination-container {
  margin-top: 1.5rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
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

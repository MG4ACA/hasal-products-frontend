<script setup>
import OutletList from '@/components/outlets/OutletList.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useOutletStore } from '@/stores/outlet';
import { useRouteStore } from '@/stores/route';
import { useConfirm } from 'primevue/useconfirm';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const outletStore = useOutletStore();
const routeStore = useRouteStore();
const { showSuccess, showError } = useToastNotification();
const confirm = useConfirm();

const loading = ref(false);
const filters = reactive({
  search: '',
  status: '',
  route_id: '',
  page: 1,
  limit: 10,
});

const pagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
});

const statusOptions = [
  { label: 'All Status', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const routes = ref([{ label: 'All Routes', value: '' }]);

let searchTimeout;
const onSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filters.page = 1;
    fetchData();
  }, 500);
};

const fetchData = async () => {
  loading.value = true;
  try {
    // Update store filters and pagination
    outletStore.pagination.page = filters.page;
    outletStore.pagination.limit = filters.limit;
    outletStore.filters.search = filters.search;
    outletStore.filters.status = filters.status;
    outletStore.filters.route_id = filters.route_id;

    await outletStore.fetchOutlets();
    pagination.value = outletStore.pagination;
  } catch (err) {
    showError(err.message || 'Failed to load outlets');
  } finally {
    loading.value = false;
  }
};

const loadRoutes = async () => {
  try {
    await routeStore.fetchRoutes({ limit: 100, status: 'active' });
    routes.value = [
      { label: 'All Routes', value: '' },
      ...routeStore.activeRoutes.map(r => ({
        label: r.name,
        value: r.id,
      })),
    ];
  } catch (error) {
    console.error('Failed to load routes:', error);
  }
};

const isFiltersActive = computed(() => {
  return filters.search !== '' || filters.status !== '' || filters.route_id !== '';
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.search !== '') count++;
  if (filters.status !== '') count++;
  if (filters.route_id !== '') count++;
  return count;
});

const clearFilters = async () => {
  filters.search = '';
  filters.status = '';
  filters.route_id = '';
  filters.page = 1;
  await fetchData();
};

const onPageChange = event => {
  filters.page = event.page + 1;
  fetchData();
};

const viewOutlet = id => {
  router.push(`/outlets/${id}`);
};

const editOutlet = id => {
  router.push(`/outlets/${id}/edit`);
};

const confirmDelete = outlet => {
  confirm.require({
    message: `Are you sure you want to delete "${outlet.name}"?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await outletStore.deleteOutlet(outlet.id);
        showSuccess('Outlet deleted successfully');
        await fetchData();
      } catch (error) {
        showError(error.message || 'Failed to delete outlet');
      }
    },
  });
};

const onSort = event => {
  const sortField = event.sortField;
  const sortOrder = event.sortOrder === 1 ? 'ASC' : 'DESC';
  outletStore.setSorting(sortField, sortOrder);
};

onMounted(() => {
  loadRoutes();
  fetchData();
});
</script>

<template>
  <div class="outlets-page">
    <div class="page-header">
      <div>
        <h1>Outlets</h1>
        <p>Manage customer outlets and their information</p>
      </div>
      <div class="header-actions">
        <Button
          v-tooltip="'Refresh'"
          icon="pi pi-refresh"
          rounded
          severity="primary"
          @click="fetchData"
        />
        <Button
          label="Add Outlet"
          icon="pi pi-plus"
          @click="() => router.push('/outlets/create')"
        />
      </div>
    </div>

    <div class="filters-section">
      <div class="search-box">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model="filters.search" placeholder="Search outlets..." @input="onSearch" />
        </IconField>
      </div>

      <div class="filter-controls">
        <Dropdown
          v-model="filters.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          placeholder="Filter by Status"
          @change="fetchData"
        />
        <Dropdown
          v-model="filters.route_id"
          :options="routes"
          option-label="label"
          option-value="value"
          placeholder="Filter by Route"
          @change="fetchData"
        />
        <Avatar
          v-badge.info="activeFilterCount"
          :icon="isFiltersActive ? 'pi pi-filter-slash' : 'pi pi-filter'"
          class="p-overlay-badge"
          @click="isFiltersActive && clearFilters()"
        />
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
    </div>

    <!-- Outlets List -->
    <Card class="list-card">
      <template #content>
        <OutletList
          v-if="!loading"
          :outlets="outletStore.outlets"
          :loading="loading"
          @view="viewOutlet"
          @edit="editOutlet"
          @delete="confirmDelete"
          @sort="onSort"
        />
      </template>
    </Card>

    <!-- Pagination -->
    <Card class="pagination-card">
      <template #content>
        <div v-if="pagination.total > 0" class="pagination-container">
          <Paginator
            :rows="pagination.limit"
            :total-records="pagination.total"
            :first="(pagination.page - 1) * pagination.limit"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            current-page-report-template="Showing {first} to {last} of {totalRecords} outlets"
            @page="onPageChange"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.outlets-page {
  padding: 1.5rem;
}

.page-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.page-header p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
}

.search-box {
  flex: 1;
}

.search-box input {
  width: 100%;
}

.filter-controls {
  display: flex;
  gap: 1rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .outlets-page {
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

  .filters-section {
    flex-direction: column;
  }

  .search-box {
    max-width: 100%;
  }

  .filter-controls {
    width: 100%;
    flex-direction: column;
  }
}
</style>

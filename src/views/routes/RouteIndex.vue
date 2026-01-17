<script setup>
import RouteList from '@/components/routes/RouteList.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useRouteStore } from '@/stores/route';
import { useConfirm } from 'primevue/useconfirm';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const routeStore = useRouteStore();
const { showSuccess, showError } = useToastNotification();
const confirm = useConfirm();

const filters = reactive({
  search: '',
  status: '',
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

let searchTimeout;
const onSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filters.page = 1;
    fetchData();
  }, 500);
};

const fetchData = async () => {
  try {
    // Update store filters and pagination
    routeStore.pagination.page = filters.page;
    routeStore.pagination.limit = filters.limit;
    routeStore.filters.search = filters.search;
    routeStore.filters.status = filters.status;

    await routeStore.fetchRoutes();
    pagination.value = routeStore.pagination;
  } catch (err) {
    showError(err.message || 'Failed to load routes');
  }
};

const isFiltersActive = computed(() => {
  return filters.search !== '' || filters.status !== '';
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.search !== '') count++;
  if (filters.status !== '') count++;
  return count;
});

const clearFilters = async () => {
  filters.search = '';
  filters.status = '';
  filters.page = 1;
  await fetchData();
};

const onPageChange = event => {
  filters.page = event.page + 1;
  routeStore.pagination.page = filters.page;
  fetchData();
};

const viewRoute = id => {
  router.push(`/routes/${id}`);
};

const editRoute = id => {
  router.push(`/routes/${id}/edit`);
};

const confirmDelete = route => {
  confirm.require({
    message: `Are you sure you want to delete "${route.name}"?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await routeStore.deleteRoute(route.id);
        showSuccess('Route deleted successfully');
        await fetchData();
      } catch (error) {
        showError(error.message || 'Failed to delete route');
      }
    },
  });
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="routes-page">
    <div class="page-header">
      <div>
        <h1>Routes</h1>
        <p>Manage delivery routes for your business</p>
      </div>
      <div class="header-actions">
        <Button
          v-tooltip="'Refresh'"
          icon="pi pi-refresh"
          rounded
          severity="primary"
          @click="fetchData"
        />
        <Button label="Add Route" icon="pi pi-plus" @click="() => router.push('/routes/create')" />
      </div>
    </div>

    <div class="filters-section">
      <div class="search-box">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model="filters.search" placeholder="Search routes..." @input="onSearch" />
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
        <Avatar
          v-badge.info="activeFilterCount"
          :icon="isFiltersActive ? 'pi pi-filter-slash' : 'pi pi-filter'"
          class="p-overlay-badge"
          @click="isFiltersActive && clearFilters()"
        />
      </div>
    </div>

    <div v-if="routeStore.loading" class="loading-container">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
    </div>

    <RouteList
      v-else
      :routes="routeStore.routes"
      :loading="routeStore.loading"
      @view="viewRoute"
      @edit="editRoute"
      @delete="confirmDelete"
    />

    <div v-if="!routeStore.loading && routeStore.routes.length > 0" class="pagination-container">
      <Paginator
        :rows="pagination.limit"
        :total-records="pagination.total"
        :first="(pagination.page - 1) * pagination.limit"
        @page="onPageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.routes-page {
  padding: 1.5rem;
}

.page-header {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
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

.pagination-container {
  margin-top: 1.5rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .routes-page {
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

<script setup>
import RawMaterialList from '@/components/raw-materials/RawMaterialList.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useRawMaterialStore } from '@/stores/rawMaterial';
import { useConfirm } from 'primevue/useconfirm';
import { computed, onMounted, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const rawMaterialStore = useRawMaterialStore();
const { showSuccess, showError } = useToastNotification();
const confirm = useConfirm();

// Filters
const filters = reactive({
  search: '',
  category: null,
  status: null,
  page: 1,
  limit: 10,
});

const isFiltersActive = computed(() => {
  return filters.search !== '' || filters.category !== null || filters.status !== null;
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.search !== '') count++;
  if (filters.category !== null) count++;
  if (filters.status !== null) count++;
  return count;
});

const clearFilters = async () => {
  filters.search = '';
  filters.category = null;
  filters.status = null;
  filters.page = 1;
  await loadRawMaterials();
};

// Category options
const categoryOptions = [
  { label: 'All Categories', value: null },
  { label: 'Spice', value: 'spice' },
  { label: 'Packaging', value: 'packaging' },
  { label: 'Other', value: 'other' },
];

// Status options
const statusOptions = [
  { label: 'All Status', value: null },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

// Search debounce timer
let searchTimer = null;

// Load raw materials
const loadRawMaterials = async () => {
  try {
    const params = {
      page: filters.page,
      limit: filters.limit,
    };

    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.status) params.status = filters.status;

    await rawMaterialStore.fetchRawMaterials(params);
  } catch (error) {
    console.error('Failed to load raw materials:', error);
    showError('Failed to load raw materials');
  }
};

// Handle search input with debounce
watch(
  () => filters.search,
  () => {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      filters.page = 1; // Reset to first page on search
      loadRawMaterials();
    }, 500);
  }
);

// Handle filter changes
watch([() => filters.category, () => filters.status], () => {
  filters.page = 1; // Reset to first page on filter change
  loadRawMaterials();
});

// Handle pagination
const onPageChange = event => {
  filters.page = event.page + 1; // PrimeVue uses 0-based index
  filters.limit = event.rows;
  loadRawMaterials();
};

// Navigate to create page
const handleCreate = () => {
  router.push('/raw-materials/create');
};

// Navigate to view page
const handleView = rawMaterial => {
  router.push(`/raw-materials/${rawMaterial.id}`);
};

// Navigate to edit page
const handleEdit = rawMaterial => {
  router.push(`/raw-materials/${rawMaterial.id}/edit`);
};

// Navigate to traceability views
const navigateToBatchGenealogy = () => {
  router.push('/batch-traceability/genealogy');
};

const navigateToReturnOrigin = () => {
  router.push('/batch-traceability/return-origin');
};

const navigateToMaterialSummary = () => {
  router.push('/batch-traceability/material-summary');
};

// Handle delete with confirmation
const handleDelete = rawMaterial => {
  confirm.require({
    message: `Are you sure you want to delete "${rawMaterial.name}"? This action cannot be undone.`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await rawMaterialStore.deleteRawMaterial(rawMaterial.id);
        showSuccess('Raw material deleted successfully');
        loadRawMaterials(); // Reload list
      } catch (error) {
        console.error('Failed to delete raw material:', error);
        showError(error.message || 'Failed to delete raw material');
      }
    },
  });
};

// Load data on mount
onMounted(() => {
  loadRawMaterials();
});
</script>

<template>
  <div class="raw-material-index">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Raw Materials</h1>
          <p>Manage raw materials and inventory</p>
        </div>
        <div class="header-actions">
          <Button
            v-tooltip="'Refresh'"
            icon="pi pi-refresh"
            rounded
            severity="primary"
            @click="loadRawMaterials"
          />
          <Button label="Add Raw Material" icon="pi pi-plus" @click="handleCreate" />
        </div>
      </div>
    </div>

    <!-- Batch Traceability Quick Access -->
    <!-- <div class="traceability-menu">
      <h3>Batch Traceability Tools</h3>
      <div class="traceability-cards">
        <div class="traceability-card" @click="navigateToBatchGenealogy">
          <div class="card-icon">
            <i class="pi pi-sitemap" />
          </div>
          <div class="card-content">
            <h4>Batch Genealogy</h4>
            <p>Trace all returns from a receipt batch</p>
          </div>
          <i class="pi pi-arrow-right" />
        </div>

        <div class="traceability-card" @click="navigateToReturnOrigin">
          <div class="card-icon">
            <i class="pi pi-arrow-up-left" />
          </div>
          <div class="card-content">
            <h4>Return Origin Tracer</h4>
            <p>Trace a return batch back to source</p>
          </div>
          <i class="pi pi-arrow-right" />
        </div>

        <div class="traceability-card" @click="navigateToMaterialSummary">
          <div class="card-icon">
            <i class="pi pi-chart-bar" />
          </div>
          <div class="card-content">
            <h4>Material Returns Summary</h4>
            <p>View comprehensive returns by material</p>
          </div>
          <i class="pi pi-arrow-right" />
        </div>
      </div>
    </div> -->

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <!-- Search -->
        <div class="search-box">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="filters.search"
              placeholder="Search by name or code..."
              class="search-input"
            />
          </IconField>
        </div>

        <!-- Category Filter -->
        <Dropdown
          v-model="filters.category"
          :options="categoryOptions"
          option-label="label"
          option-value="value"
          placeholder="All Categories"
          class="filter-dropdown"
        />

        <!-- Status Filter -->
        <Dropdown
          v-model="filters.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          placeholder="All Status"
          class="filter-dropdown"
        />

        <!-- Clear Filters Button -->
        <Avatar
          v-badge.info="activeFilterCount"
          :icon="isFiltersActive ? 'pi pi-filter-slash' : 'pi pi-filter'"
          class="p-overlay-badge"
          @click="isFiltersActive && clearFilters()"
        />
      </div>
    </div>

    <!-- Raw Materials List -->
    <Card class="list-card">
      <template #content>
        <RawMaterialList
          :raw-materials="rawMaterialStore.rawMaterials"
          :loading="rawMaterialStore.loading"
          @view="handleView"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </template>
    </Card>

    <!-- Pagination -->
    <Card class="pagination-card">
      <template #content>
        <div v-if="rawMaterialStore.pagination.total > 0" class="pagination-container">
          <Paginator
            :rows="filters.limit"
            :total-records="rawMaterialStore.pagination.total"
            :first="(filters.page - 1) * filters.limit"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            current-page-report-template="Showing {first} to {last} of {totalRecords} raw materials"
            @page="onPageChange"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.raw-material-index {
  padding: 1.5rem;
}

.page-header {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-text h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.header-text p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Traceability Menu */
.traceability-menu {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  border-top: 4px solid #2563eb;
}

.traceability-menu h3 {
  margin: 0 0 1.2rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}

.traceability-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.2rem;
}

.traceability-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%);
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.traceability-card:hover {
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
  transform: translateY(-2px);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 8px;
  color: #2563eb;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-content h4 {
  margin: 0 0 0.3rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.card-content p {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.traceability-card i:last-child {
  color: #d1d5db;
  font-size: 1.2rem;
  transition:
    transform 0.3s ease,
    color 0.3s ease;
}

.traceability-card:hover i:last-child {
  color: #2563eb;
  transform: translateX(4px);
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
}

.filter-dropdown {
  min-width: 200px;
}

.pagination-section {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .raw-material-index {
    padding: 1rem;
  }

  .page-header {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .traceability-menu {
    padding: 1rem;
  }

  .traceability-cards {
    grid-template-columns: 1fr;
  }

  .filters-section {
    padding: 1rem;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: 100%;
  }

  .filter-dropdown {
    min-width: 100%;
  }
}
</style>

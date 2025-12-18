<script setup>
import RawMaterialList from '@/components/raw-materials/RawMaterialList.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useRawMaterialStore } from '@/stores/rawMaterial';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import { useConfirm } from 'primevue/useconfirm';
import { onMounted, reactive, watch } from 'vue';
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
  // For now, redirect to edit. Later we can create a dedicated view page
  router.push(`/raw-materials/${rawMaterial.id}/edit`);
};

// Navigate to edit page
const handleEdit = rawMaterial => {
  router.push(`/raw-materials/${rawMaterial.id}/edit`);
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
        showError(error.response?.data?.message || 'Failed to delete raw material');
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
        <Button label="Add Raw Material" icon="pi pi-plus" @click="handleCreate" />
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <!-- Search -->
        <div class="search-box">
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
              v-model="filters.search"
              placeholder="Search by name or code..."
              class="search-input"
            />
          </span>
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
      </div>
    </div>

    <!-- Raw Materials List -->
    <RawMaterialList
      :raw-materials="rawMaterialStore.rawMaterials"
      :loading="rawMaterialStore.loading"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- Pagination -->
    <div v-if="rawMaterialStore.pagination.total > 0" class="pagination-section">
      <Paginator
        :rows="filters.limit"
        :total-records="rawMaterialStore.pagination.total"
        :first="(filters.page - 1) * filters.limit"
        :rows-per-page-options="[10, 25, 50]"
        @page="onPageChange"
      />
    </div>
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

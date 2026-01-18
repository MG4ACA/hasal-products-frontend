<template>
  <div class="suppliers-page">
    <div class="page-header">
      <div>
        <h1>Suppliers</h1>
        <p>Manage your suppliers and their information</p>
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
          label="Add Supplier"
          icon="pi pi-plus"
          @click="() => router.push('/suppliers/create')"
        />
      </div>
    </div>

    <div class="filters-section">
      <div class="search-box">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model="filters.search" placeholder="Search suppliers..." @input="onSearch" />
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
          v-model="filters.payment_terms"
          :options="paymentTermsOptions"
          option-label="label"
          option-value="value"
          placeholder="Filter by Payment Terms"
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

    <!-- Suppliers List -->
    <Card class="list-card">
      <template #content>
        <SupplierList
          v-if="!loading"
          :suppliers="supplierStore.suppliers"
          :loading="loading"
          @view="viewSupplier"
          @edit="editSupplier"
          @delete="confirmDelete"
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
            current-page-report-template="Showing {first} to {last} of {totalRecords} suppliers"
            @page="onPageChange"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import SupplierList from '@/components/suppliers/SupplierList.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useSupplierStore } from '@/stores/supplier';
import { useConfirm } from 'primevue/useconfirm';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const supplierStore = useSupplierStore();
const { showSuccess, showError } = useToastNotification();
const confirm = useConfirm();

const loading = ref(false);
const filters = reactive({
  search: '',
  status: '',
  payment_terms: '',
  page: 1,
  limit: 10,
});

const isFiltersActive = computed(() => {
  return filters.search !== '' || filters.status !== '' || filters.payment_terms !== '';
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.search !== '') count++;
  if (filters.status !== '') count++;
  if (filters.payment_terms !== '') count++;
  return count;
});

const clearFilters = async () => {
  filters.search = '';
  filters.status = '';
  filters.payment_terms = '';
  filters.page = 1;
  await fetchData();
};

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

const paymentTermsOptions = [
  { label: 'All Terms', value: '' },
  { label: 'Cash', value: 'cash' },
  { label: 'Credit', value: 'credit' },
  { label: 'Check', value: 'check' },
];

onMounted(() => {
  fetchData();
});

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
    await supplierStore.fetchSuppliers(filters);
    pagination.value = supplierStore.pagination;
  } catch (err) {
    showError(err.message || 'Failed to load suppliers');
  } finally {
    loading.value = false;
  }
};

const onPageChange = event => {
  filters.page = event.page + 1;
  fetchData();
};

const viewSupplier = id => {
  router.push(`/suppliers/${id}`);
};

const editSupplier = id => {
  router.push(`/suppliers/${id}/edit`);
};

const confirmDelete = supplier => {
  confirm.require({
    message: `Are you sure you want to delete "${supplier.name}"?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteSupplier(supplier.id),
  });
};

const deleteSupplier = async id => {
  try {
    await supplierStore.deleteSupplier(id);
    showSuccess('Supplier deleted successfully');
    fetchData();
  } catch (err) {
    showError(err.message || 'Failed to delete supplier');
  }
};
</script>

<style scoped>
.suppliers-page {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.8rem;
  color: #333;
  margin: 0;
}

.page-header p {
  color: #666;
  margin: 0.5rem 0 0 0;
}

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
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
  padding: 4rem;
  color: #667eea;
}

.pagination-container {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}
</style>

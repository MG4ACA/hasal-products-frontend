<template>
  <div class="products-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Products</h1>
        <p class="page-subtitle">Manage products and SKUs</p>
      </div>
      <div class="header-actions">
        <Button
          v-tooltip="'Refresh'"
          icon="pi pi-refresh"
          rounded
          severity="primary"
          @click="handleRefresh"
        />
        <Button label="Add Product" icon="pi pi-plus" @click="navigateToCreate" />
      </div>
    </div>

    <Card class="filters-card">
      <template #content>
        <div class="filters-section">
          <div class="search-box">
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="filters.search"
                placeholder="Search products..."
                @input="onSearch"
              />
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
      </template>
    </Card>

    <!-- Products List -->
    <Card class="list-card">
      <template #content>
        <ProductList
          :products="productStore.products"
          :loading="loading"
          @view="viewProduct"
          @edit="editProduct"
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
            current-page-report-template="Showing {first} to {last} of {totalRecords} products"
            @page="onPageChange"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import ProductList from '@/components/products/ProductList.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useProductStore } from '@/stores/product';
import { useConfirm } from 'primevue/useconfirm';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const productStore = useProductStore();
const { showError, showSuccess } = useToastNotification();
const confirm = useConfirm();

const loading = ref(false);
const filters = reactive({
  search: '',
  status: '',
  page: 1,
  limit: 10,
});

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
    await productStore.fetchProducts(filters);
    pagination.value = productStore.pagination;
  } catch (err) {
    showError(err.message || 'Failed to load products');
  } finally {
    loading.value = false;
  }
};

const handleRefresh = () => {
  filters.page = 1;
  fetchData();
};

const onPageChange = event => {
  filters.page = event.page + 1;
  fetchData();
};

const navigateToCreate = () => {
  router.push('/products/create');
};

const viewProduct = id => {
  router.push(`/products/${id}/view`);
};

const editProduct = id => {
  router.push(`/products/${id}/edit`);
};

const confirmDelete = product => {
  confirm.require({
    message: `Are you sure you want to delete "${product.name}"?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteProduct(product.id),
  });
};

const deleteProduct = async id => {
  try {
    await productStore.deleteProduct(id);
    showSuccess('Product deleted successfully');
    fetchData();
  } catch (err) {
    showError(err.message || 'Failed to delete product');
  }
};
</script>

<style scoped>
.products-page {
  padding: 1.5rem;
}

.page-header {
  display: flex;
  margin-bottom: 1.5rem;
  justify-content: space-between;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a202c;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #718096;
}
.filters-card {
  margin-bottom: 1.5rem;
}
.filters-section {
  display: flex;
  gap: 1rem;
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

.pagination-container {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}
</style>

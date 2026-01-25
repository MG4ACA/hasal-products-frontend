<template>
  <div class="production-page">
    <div class="page-header">
      <div>
        <h1>Production Runs</h1>
        <p>Manage production and manufacturing</p>
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
          label="Create Production"
          icon="pi pi-plus"
          @click="() => router.push('/production-runs/create')"
        />
      </div>
    </div>

    <!-- Filters -->
    <Card class="filters-card">
      <template #content>
        <div class="filters-section">
          <div class="search-box">
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="filters.search"
                placeholder="Search production runs..."
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
            <Dropdown
              v-model="filters.product_id"
              :options="productOptions"
              option-label="label"
              option-value="value"
              placeholder="Filter by Product"
              @change="fetchData"
            />
            <Dropdown
              v-model="filters.recipe_id"
              :options="recipeOptions"
              option-label="label"
              option-value="value"
              placeholder="Filter by Recipe"
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

    <div v-if="loading" class="loading-container">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
    </div>

    <!-- Production Runs List -->
    <Card class="list-card">
      <template #content>
        <ProductionRunList
          v-if="!loading"
          :production-runs="productionStore.productionRuns"
          :loading="loading"
          @view="viewProduction"
          @edit="editProduction"
          @delete="confirmDelete"
          @refresh="fetchData"
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
            current-page-report-template="Showing {first} to {last} of {totalRecords} production runs"
            @page="onPageChange"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import ProductionRunList from '@/components/production/ProductionRunList.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useProductStore } from '@/stores/product';
import { useProductionStore } from '@/stores/production';
import { useRecipeStore } from '@/stores/recipe';
import { useConfirm } from 'primevue/useconfirm';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const productionStore = useProductionStore();
const productStore = useProductStore();
const recipeStore = useRecipeStore();
const { showSuccess, showError } = useToastNotification();
const confirm = useConfirm();

const loading = ref(false);
const productOptions = ref([]);
const recipeOptions = ref([]);
const filters = reactive({
  search: '',
  status: '',
  product_id: '',
  recipe_id: '',
  page: 1,
  limit: 10,
});

const isFiltersActive = computed(() => {
  return (
    filters.search !== '' ||
    filters.status !== '' ||
    filters.product_id !== '' ||
    filters.recipe_id !== ''
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.search !== '') count++;
  if (filters.status !== '') count++;
  if (filters.product_id !== '') count++;
  if (filters.recipe_id !== '') count++;
  return count;
});

const clearFilters = async () => {
  filters.search = '';
  filters.status = '';
  filters.product_id = '';
  filters.recipe_id = '';
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
  { label: 'Planned', value: 'planned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];
onMounted(() => {
  Promise.all([fetchData(), loadProducts(), loadRecipes()]);
});

const loadProducts = async () => {
  try {
    await productStore.fetchProducts();
    productOptions.value = productStore.products.map(p => ({
      label: `${p.code} - ${p.name}`,
      value: p.id,
    }));
  } catch (err) {
    console.error('Failed to load products:', err);
  }
};

const loadRecipes = async () => {
  try {
    await recipeStore.fetchRecipes();
    recipeOptions.value = recipeStore.recipes.map(r => ({
      label: `${r.name} (v${r.version})`,
      value: r.id,
    }));
  } catch (err) {
    console.error('Failed to load recipes:', err);
  }
};

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
    await productionStore.fetchProductionRuns(filters);
    pagination.value = productionStore.pagination;
  } catch (err) {
    showError(err.message || 'Failed to load production runs');
  } finally {
    loading.value = false;
  }
};

const onPageChange = event => {
  filters.page = event.page + 1;
  fetchData();
};

const viewProduction = id => {
  router.push(`/production-runs/${id}/view`);
};

const editProduction = id => {
  router.push(`/production-runs/${id}/edit`);
};

const confirmDelete = production => {
  confirm.require({
    message: `Are you sure you want to delete production run "${production.run_number}"?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteProduction(production.id),
  });
};

const deleteProduction = async id => {
  try {
    await productionStore.deleteProductionRun(id);
    showSuccess('Production run deleted successfully');
    fetchData();
  } catch (err) {
    showError(err.message || 'Failed to delete production run');
  }
};
</script>

<style scoped>
.production-page {
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
  flex-wrap: wrap;
}

.filters-card {
  margin-bottom: 1.5rem;
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

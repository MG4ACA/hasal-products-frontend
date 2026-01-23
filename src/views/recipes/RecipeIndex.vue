<template>
  <div class="recipes-page">
    <div class="page-header">
      <div>
        <h1>Recipes</h1>
        <p>Manage recipes and formulations</p>
      </div>
      <div class="header-actions">
        <Button
          v-tooltip="'Refresh'"
          icon="pi pi-refresh"
          rounded
          severity="primary"
          @click="handleRefresh"
        />
        <Button label="Create Recipe" icon="pi pi-plus" @click="navigateToCreate" />
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
                placeholder="Search recipes..."
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
              @change="onStatusChange"
            />
            <div class="">
              <Dropdown
                v-model="filters.product"
                :options="productOptions"
                option-label="label"
                option-value="value"
                placeholder="Filter by Product"
                class="w-full"
                :loading="loadingProducts"
                @change="handleProductFilter"
              />
            </div>
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

    <!-- Recipes List -->
    <Card class="list-card">
      <template #content>
        <RecipeList
          v-if="!loading"
          :recipes="recipeStore.recipes"
          :loading="loading"
          @view="viewRecipe"
          @edit="editRecipe"
          @duplicate="duplicateRecipe"
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
            current-page-report-template="Showing {first} to {last} of {totalRecords} recipes"
            @page="onPageChange"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import RecipeList from '@/components/recipes/RecipeList.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useProductStore } from '@/stores/product';
import { useRecipeStore } from '@/stores/recipe';
import { useConfirm } from 'primevue/useconfirm';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const recipeStore = useRecipeStore();
const productStore = useProductStore();
const { showSuccess, showError } = useToastNotification();
const confirm = useConfirm();

const loading = ref(false);
const loadingProducts = ref(false);
const filters = reactive({
  search: '',
  status: '',
  product: '',
  page: 1,
  limit: 10,
});

const isFiltersActive = computed(() => {
  return filters.search !== '' || filters.status !== '' || filters.product !== '';
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.search !== '') count++;
  if (filters.status !== '') count++;
  if (filters.product !== '') count++;
  return count;
});

const clearFilters = async () => {
  filters.search = '';
  filters.status = '';
  filters.product = '';
  filters.page = 1;
  await recipeStore.clearFilters();
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

const productOptions = ref([{ label: 'All Products', value: '' }]);

onMounted(async () => {
  fetchData();
  await loadProducts();
});

let searchTimeout;
const onSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filters.page = 1;
    recipeStore.setSearch(filters.search);
  }, 500);
};

const onStatusChange = () => {
  filters.page = 1;
  recipeStore.setStatusFilter(filters.status);
};

const fetchData = async () => {
  loading.value = true;
  try {
    await recipeStore.fetchRecipes();
    pagination.value = recipeStore.pagination;
  } catch (err) {
    showError(err.message || 'Failed to load recipes');
  } finally {
    loading.value = false;
  }
};

const loadProducts = async () => {
  loadingProducts.value = true;
  try {
    await productStore.fetchProducts();
    productOptions.value = [
      { label: 'All Products', value: '' },
      ...productStore.products.map(p => ({
        label: `${p.code} - ${p.name}`,
        value: p.id,
      })),
    ];
  } catch (error) {
    console.error('Failed to load products');
  } finally {
    loadingProducts.value = false;
  }
};

const handleProductFilter = () => {
  recipeStore.setProductFilter(filters.product);
  fetchData();
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
  router.push('/recipes/create');
};

const viewRecipe = id => {
  router.push(`/recipes/${id}/view`);
};

const editRecipe = id => {
  router.push(`/recipes/${id}/edit`);
};

const duplicateRecipe = recipe => {
  // Prepare duplicate data with "- Copy" suffix
  const duplicateData = {
    product_id: recipe.product_id,
    product_sku_id: recipe.product_sku_id,
    name: `${recipe.name} - Copy`,
    description: recipe.description,
    expected_yield: recipe.expected_yield,
    yield_unit: recipe.yield_unit,
    status: recipe.status || 'active',
    items: recipe.items
      ? recipe.items.map(item => ({
          raw_material_id: item.material_id,
          quantity: item.quantity,
          unit: item.unit,
        }))
      : [],
  };

  // Store in Pinia and navigate
  recipeStore.setDuplicateData(duplicateData);
  router.push('/recipes/create');
};

const confirmDelete = recipe => {
  confirm.require({
    message: `Are you sure you want to delete "${recipe.name}"?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteRecipe(recipe.id),
  });
};

const deleteRecipe = async id => {
  try {
    await recipeStore.deleteRecipe(id);
    showSuccess('Recipe deleted successfully');
    fetchData();
  } catch (err) {
    showError(err.message || 'Failed to delete recipe');
  }
};
</script>

<style scoped>
.recipes-page {
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

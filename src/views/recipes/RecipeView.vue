<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useRecipeStore } from '@/stores/recipe';
import { formatDate, formatNumber } from '@/utils/formatters';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const recipeStore = useRecipeStore();
const { showError, showSuccess } = useToastNotification();

const recipeId = ref(route.params.id);
const isLoading = ref(true);
const notFound = ref(false);

// Breadcrumb items
const breadcrumbItems = ref([
  { label: 'Dashboard', to: '/' },
  { label: 'Recipes', to: '/recipes' },
  { label: 'View' },
]);

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

// Load recipe data
onMounted(async () => {
  try {
    isLoading.value = true;
    await recipeStore.fetchRecipeById(recipeId.value);

    if (!recipeStore.currentRecipe) {
      notFound.value = true;
      showError('Recipe not found');
    } else {
      // Update breadcrumb with recipe name
      breadcrumbItems.value = [
        { label: 'Dashboard', to: '/' },
        { label: 'Recipes', to: '/recipes' },
        { label: recipeStore.currentRecipe.name },
      ];
    }
  } catch (error) {
    console.error('Failed to load recipe:', error);
    notFound.value = true;
    showError('Failed to load recipe details');
  } finally {
    isLoading.value = false;
  }
});

// Handle edit button
const handleEdit = () => {
  router.push(`/recipes/${recipeId.value}/edit`);
};

// Handle back button
const handleBack = () => {
  router.push('/recipes');
};

const totalCost = computed(() => {
  const recipe = recipeStore.currentRecipe;
  if (!recipe?.items) return 0;
  return recipe.items.reduce((sum, item) => {
    const cost = parseFloat(item.material?.average_cost || 0) * parseFloat(item.quantity || 0);
    return sum + cost;
  }, 0);
});

const costPerUnit = computed(() => {
  const recipe = recipeStore.currentRecipe;
  const batchSize = parseFloat(recipe?.expected_yield || 0);
  if (!recipe || batchSize === 0) return 0;
  return totalCost.value / batchSize;
});

const calculateItemCost = item => {
  const cost = parseFloat(item.material?.average_cost || 0) * parseFloat(item.quantity || 0);
  return formatNumber(cost);
};
</script>

<template>
  <div class="recipe-view">
    <!-- Breadcrumb -->
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner />
      <p>Loading recipe details...</p>
    </div>

    <!-- Not Found State -->
    <div v-else-if="notFound" class="not-found-container">
      <i class="pi pi-exclamation-triangle" />
      <h2>Recipe Not Found</h2>
      <p>The recipe you're looking for doesn't exist or has been deleted.</p>
      <Button label="Back to Recipes" icon="pi pi-arrow-left" @click="handleBack" />
    </div>

    <!-- Recipe Details -->
    <template v-else>
      <!-- Page Header with Actions -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>{{ recipeStore.currentRecipe?.name }}</h1>
            <p>Recipe Details & Bill of Materials</p>
            <div class="recipe-meta">
              <span class="product-name">
                Product: <strong>{{ recipeStore.currentRecipe?.product?.name || 'N/A' }}</strong>
              </span>
              <span v-if="recipeStore.currentRecipe?.version" class="version-badge">
                v{{ recipeStore.currentRecipe?.version }}
              </span>
              <span class="status-badge">
                <Tag
                  :value="recipeStore.currentRecipe?.is_active ? 'active' : 'inactive'"
                  :severity="recipeStore.currentRecipe?.is_active ? 'success' : 'danger'"
                />
              </span>
            </div>
          </div>
          <div class="header-actions">
            <Button label="Edit" icon="pi pi-pencil" severity="primary" @click="handleEdit" />
            <Button label="Back" icon="pi pi-arrow-left" severity="secondary" @click="handleBack" />
          </div>
        </div>
      </div>

      <!-- Recipe Information Cards -->
      <div class="info-grid">
        <!-- Basic Information -->
        <div class="info-card">
          <div class="card-header">
            <i class="pi pi-list" />
            <h3>Recipe Information</h3>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">Product:</span>
              <span class="value">{{ recipeStore.currentRecipe?.product?.name || 'N/A' }}</span>
            </div>
            <div class="info-row">
              <span class="label">SKU Variant:</span>
              <span class="value">{{ recipeStore.currentRecipe?.productSku?.size || 'N/A' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Expected Yield:</span>
              <span class="value"
                >{{ formatNumber(recipeStore.currentRecipe?.expected_yield) }}
                {{ recipeStore.currentRecipe?.yield_unit }}</span
              >
            </div>
            <div class="info-row">
              <span class="label">Version:</span>
              <span class="value">{{ recipeStore.currentRecipe?.version }}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value">
                <Tag
                  :value="recipeStore.currentRecipe?.is_active ? 'active' : 'inactive'"
                  :severity="recipeStore.currentRecipe?.is_active ? 'success' : 'danger'"
                />
              </span>
            </div>
          </div>
        </div>

        <!-- Cost Summary -->
        <div class="info-card">
          <div class="card-header">
            <i class="pi pi-dollar" />
            <h3>Cost Summary</h3>
          </div>
          <div class="card-content">
            <div class="cost-item">
              <div class="cost-label">Total Recipe Cost</div>
              <div class="cost-value primary">Rs. {{ totalCost.toFixed(2) }}</div>
            </div>
            <div class="cost-item">
              <div class="cost-label">Cost per Unit</div>
              <div class="cost-value">Rs. {{ costPerUnit.toFixed(2) }}</div>
            </div>
            <div class="cost-item">
              <div class="cost-label">Total Materials</div>
              <div class="cost-value">
                {{ recipeStore.currentRecipe?.items?.length || 0 }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bill of Materials -->
      <Card class="bom-card">
        <template #title>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-list-check" />
            <span>Bill of Materials (BOM)</span>
          </div>
        </template>
        <template #content>
          <DataTable
            :value="recipeStore.currentRecipe?.items || []"
            striped-rows
            responsive-layout="scroll"
            class="p-datatable-sm"
          >
            <template #empty>
              <div class="empty-state">
                <i class="pi pi-inbox" style="font-size: 3rem; color: #ccc" />
                <p>No materials in this recipe</p>
              </div>
            </template>

            <Column header="Raw Material" style="min-width: 200px">
              <template #body="{ data }">
                <div class="material-cell">
                  <div class="font-semibold">
                    {{ data.material?.code }}
                  </div>
                  <div class="text-sm text-600">
                    {{ data.material?.name }}
                  </div>
                </div>
              </template>
            </Column>

            <Column header="Quantity" style="min-width: 120px">
              <template #body="{ data }">
                {{ formatNumber(data.quantity) }} {{ data.unit }}
              </template>
            </Column>

            <Column header="Unit Cost" style="min-width: 120px">
              <template #body="{ data }">
                Rs. {{ formatNumber(data.material?.average_cost || 0) }}
              </template>
            </Column>

            <Column header="Total Cost" style="min-width: 120px">
              <template #body="{ data }"> Rs. {{ calculateItemCost(data) }} </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- Description -->
      <Card v-if="recipeStore.currentRecipe?.description" class="description-card">
        <template #title>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-file-edit" />
            <span>Description</span>
          </div>
        </template>
        <template #content>
          <p>{{ recipeStore.currentRecipe?.description }}</p>
        </template>
      </Card>

      <!-- Timestamps -->
      <div class="timestamps">
        <div class="timestamp-item">
          <span class="label">Created:</span>
          <span class="value">{{ formatDate(recipeStore.currentRecipe?.created_at) }}</span>
        </div>
        <div class="timestamp-item">
          <span class="label">Updated:</span>
          <span class="value">{{ formatDate(recipeStore.currentRecipe?.updated_at) }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.recipe-view {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.header-text h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.header-text p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.recipe-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.product-name {
  color: #6b7280;
  font-size: 0.875rem;
}

.version-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.card-header i {
  color: #667eea;
  font-size: 1.25rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.card-content {
  padding: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.value {
  color: #1f2937;
  font-weight: 500;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.cost-item:last-child {
  border-bottom: none;
}

.cost-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.cost-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.cost-value.primary {
  color: #667eea;
}

.bom-card,
.description-card {
  margin-bottom: 1.5rem;
}

.material-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.material-cell .text-600 {
  color: #6b7280;
}

.timestamps {
  display: flex;
  justify-content: flex-end;
  gap: 2rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.timestamp-item {
  display: flex;
  gap: 0.5rem;
}

.timestamp-item .label {
  color: #6b7280;
  font-weight: 500;
}

.timestamp-item .value {
  color: #1f2937;
}

.loading-container,
.not-found-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  gap: 1rem;
  text-align: center;
}

.not-found-container i {
  font-size: 3rem;
  color: #ef4444;
}

.not-found-container h2 {
  color: #1f2937;
  margin: 0;
}

.not-found-container p {
  color: #6b7280;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .recipe-view {
    padding: 1rem;
  }

  .page-header {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
  }

  .header-text h1 {
    font-size: 1.5rem;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .header-actions button {
    width: 100%;
  }

  .timestamps {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>

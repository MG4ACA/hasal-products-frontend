<template>
  <div class="recipe-view">
    <Card v-if="recipe">
      <template #title>
        <div class="flex justify-content-between align-items-center">
          <div>
            Recipe Details
            <Tag
              v-if="recipe.version > 1"
              :value="`v${recipe.version}`"
              severity="info"
              class="ml-2"
            />
          </div>
          <div class="flex gap-2">
            <Button label="Edit" icon="pi pi-pencil" severity="warning" @click="editRecipe" />
            <Button
              label="Back"
              icon="pi pi-arrow-left"
              severity="secondary"
              outlined
              @click="goBack"
            />
          </div>
        </div>
      </template>

      <template #content>
        <!-- Recipe Information -->
        <div class="mb-4">
          <h3>Recipe Information</h3>
          <Divider />
          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 text-sm">Recipe Name</label>
                <div class="text-lg font-bold">
                  {{ recipe.name }}
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 text-sm">Product</label>
                <div class="text-lg">
                  {{ recipe.Product?.name || 'N/A' }}
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 text-sm">SKU</label>
                <div class="text-lg">
                  {{ recipe.ProductSku?.variant || 'N/A' }}
                </div>
              </div>
            </div>

            <div class="col-12 md:col-3">
              <div class="field">
                <label class="text-500 text-sm">Batch Size</label>
                <div class="text-lg">{{ formatNumber(recipe.batch_size) }} {{ recipe.unit }}</div>
              </div>
            </div>

            <div class="col-12 md:col-3">
              <div class="field">
                <label class="text-500 text-sm">Version</label>
                <div class="text-lg">
                  {{ recipe.version }}
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 text-sm">Status</label>
                <div>
                  <Tag
                    :value="recipe.status"
                    :severity="recipe.status === 'active' ? 'success' : 'danger'"
                  />
                </div>
              </div>
            </div>

            <div class="col-12">
              <div class="field">
                <label class="text-500 text-sm">Description</label>
                <div class="text-lg">
                  {{ recipe.description || 'No description' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bill of Materials -->
        <div class="mb-4">
          <h3>Bill of Materials (BOM)</h3>
          <Divider />

          <DataTable :value="recipe.items" striped-rows class="p-datatable-sm">
            <template #empty>
              <div class="text-center p-4">No materials in this recipe</div>
            </template>

            <Column header="Raw Material">
              <template #body="{ data }">
                {{ data.RawMaterial?.code }} - {{ data.RawMaterial?.name }}
              </template>
            </Column>

            <Column field="quantity" header="Quantity">
              <template #body="{ data }">
                {{ formatNumber(data.quantity) }} {{ data.unit }}
              </template>
            </Column>

            <Column header="Unit Cost">
              <template #body="{ data }">
                Rs. {{ formatNumber(data.RawMaterial?.average_cost || 0) }}
              </template>
            </Column>

            <Column header="Total Cost">
              <template #body="{ data }"> Rs. {{ calculateItemCost(data) }} </template>
            </Column>
          </DataTable>

          <!-- Cost Summary -->
          <div class="mt-3 p-3 surface-100 border-round">
            <div class="grid">
              <div class="col-12 md:col-4">
                <div class="text-500 text-sm mb-1">Total Recipe Cost</div>
                <div class="text-xl font-bold text-primary">Rs. {{ totalCost.toFixed(2) }}</div>
              </div>
              <div class="col-12 md:col-4">
                <div class="text-500 text-sm mb-1">Cost per Unit</div>
                <div class="text-xl font-bold">Rs. {{ costPerUnit.toFixed(2) }}</div>
              </div>
              <div class="col-12 md:col-4">
                <div class="text-500 text-sm mb-1">Total Materials</div>
                <div class="text-xl font-bold">
                  {{ recipe.items?.length || 0 }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timestamps -->
        <div>
          <h3>Timestamps</h3>
          <Divider />
          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 text-sm">Created At</label>
                <div class="text-lg">
                  {{ formatDate(recipe.created_at) }}
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 text-sm">Last Updated</label>
                <div class="text-lg">
                  {{ formatDate(recipe.updated_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <div v-else class="text-center p-5">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
      <p>Loading recipe details...</p>
    </div>
  </div>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useRecipeStore } from '@/stores/recipe';
import { formatDate, formatNumber } from '@/utils/formatters';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Divider from 'primevue/divider';
import Tag from 'primevue/tag';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const recipeStore = useRecipeStore();
const toast = useToastNotification();

const recipe = ref(null);

const totalCost = computed(() => {
  if (!recipe.value?.items) return 0;
  return recipe.value.items.reduce((sum, item) => {
    const cost = parseFloat(item.RawMaterial?.average_cost || 0) * parseFloat(item.quantity || 0);
    return sum + cost;
  }, 0);
});

const costPerUnit = computed(() => {
  if (!recipe.value || recipe.value.batch_size === 0) return 0;
  return totalCost.value / recipe.value.batch_size;
});

const calculateItemCost = item => {
  const cost = parseFloat(item.RawMaterial?.average_cost || 0) * parseFloat(item.quantity || 0);
  return formatNumber(cost);
};

onMounted(async () => {
  await loadRecipe();
});

const loadRecipe = async () => {
  try {
    recipe.value = await recipeStore.fetchRecipeById(route.params.id);
  } catch (error) {
    toast.error('Failed to load recipe details');
    router.push('/recipes');
  }
};

const editRecipe = () => {
  router.push(`/recipes/${route.params.id}/edit`);
};

const goBack = () => {
  router.push('/recipes');
};
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}

.font-bold {
  font-weight: 600;
}
</style>

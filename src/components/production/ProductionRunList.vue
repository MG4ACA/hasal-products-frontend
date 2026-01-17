<template>
  <div class="production-runs">
    <Card>
      <template #title>
        <div class="flex justify-content-between align-items-center">
          <span>Production Runs</span>
          <Button
            label="New Production Run"
            class="p-button-success"
            icon="pi pi-plus"
            @click="$router.push('/production-runs/create')"
          />
        </div>
      </template>

      <template #content>
        <!-- Filters -->
        <div class="grid mb-3">
          <div class="col-12 md:col-5">
            <InputText
              v-model="filters.search"
              placeholder="Search by run number..."
              class="w-full"
              @input="onSearch"
            />
          </div>

          <div class="col-12 md:col-2">
            <Dropdown
              v-model="filters.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="All Statuses"
              class="w-full"
              show-clear
              @change="onFilterChange"
            />
          </div>

          <div class="col-12 md:col-2">
            <Dropdown
              v-model="filters.product_id"
              :options="productOptions"
              option-label="label"
              option-value="value"
              placeholder="All Products"
              class="w-full"
              show-clear
              filter
              @change="onFilterChange"
            />
          </div>

          <div class="col-12 md:col-2">
            <Dropdown
              v-model="filters.recipe_id"
              :options="recipeOptions"
              option-label="label"
              option-value="value"
              placeholder="All Recipes"
              class="w-full"
              show-clear
              filter
              @change="onFilterChange"
            />
          </div>

          <div class="col-12 md:col-1">
            <Avatar
              v-badge.info="activeFilterCount"
              :icon="hasActiveFilters ? 'pi pi-filter-slash' : 'pi pi-filter'"
              class="p-overlay-badge"
              @click="hasActiveFilters && clearProductionFilters()"
            />
          </div>
        </div>

        <!-- Production Runs Table -->
        <DataTable
          :value="productionStore.productionRuns"
          :loading="productionStore.loading"
          :total-records="productionStore.totalItems"
          :rows="productionStore.pagination.limit"
          :first="productionStore.pagination.offset"
          lazy
          paginator
          striped-rows
          class="p-datatable-sm"
          @page="onPage"
        >
          <template #empty> No production runs found </template>

          <Column field="run_number" header="Run Number">
            <template #body="{ data }">
              <span class="font-bold">{{ data.run_number }}</span>
            </template>
          </Column>

          <Column header="Recipe">
            <template #body="{ data }">
              {{ data.Recipe?.name || 'N/A' }}
              <Tag
                v-if="data.Recipe?.version > 1"
                :value="`v${data.Recipe.version}`"
                severity="info"
                class="ml-1"
              />
            </template>
          </Column>

          <Column header="Product">
            <template #body="{ data }">
              {{ data.Recipe?.Product?.name || 'N/A' }}
            </template>
          </Column>

          <Column field="quantity" header="Quantity">
            <template #body="{ data }">
              {{ formatNumber(data.quantity) }} {{ data.unit }}
            </template>
          </Column>

          <Column field="production_date" header="Production Date">
            <template #body="{ data }">
              {{ formatDate(data.production_date) }}
            </template>
          </Column>

          <Column field="status" header="Status">
            <template #body="{ data }">
              <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
            </template>
          </Column>

          <Column header="Actions">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button
                  v-tooltip.top="'View'"
                  icon="pi pi-eye"
                  size="small"
                  outlined
                  @click="viewRun(data.id)"
                />
                <Button
                  v-if="data.status === 'planned'"
                  v-tooltip.top="'Edit'"
                  icon="pi pi-pencil"
                  severity="warning"
                  size="small"
                  outlined
                  @click="editRun(data.id)"
                />
                <Button
                  v-if="data.status === 'planned' || data.status === 'in_progress'"
                  v-tooltip.top="'Complete'"
                  icon="pi pi-check"
                  severity="success"
                  size="small"
                  outlined
                  @click="completeRun(data)"
                />
                <Button
                  v-if="data.status === 'planned'"
                  v-tooltip.top="'Delete'"
                  icon="pi pi-trash"
                  severity="danger"
                  size="small"
                  outlined
                  @click="confirmDelete(data)"
                />
                <Button
                  v-if="data.status === 'planned' || data.status === 'in_progress'"
                  v-tooltip.top="'Check Materials'"
                  icon="pi pi-box"
                  severity="help"
                  size="small"
                  outlined
                  @click="checkMaterials(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialog"
      :style="{ width: '450px' }"
      header="Confirm Delete"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span
          >Are you sure you want to delete production run <b>{{ selectedRun?.run_number }}</b
          >?</span
        >
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteDialog = false" />
        <Button label="Yes" icon="pi pi-check" severity="danger" @click="handleDelete" />
      </template>
    </Dialog>

    <!-- Material Check Dialog -->
    <Dialog
      v-model:visible="materialDialog"
      :style="{ width: '700px' }"
      header="Material Availability Check"
      :modal="true"
    >
      <div v-if="materialCheck">
        <div class="mb-3">
          <h4>Production Run: {{ selectedRun?.run_number }}</h4>
          <p>Recipe: {{ selectedRun?.Recipe?.name }}</p>
          <p>Quantity: {{ formatNumber(selectedRun?.quantity) }} {{ selectedRun?.unit }}</p>
        </div>

        <Divider />

        <DataTable :value="materialCheck.materials" class="p-datatable-sm">
          <Column field="name" header="Raw Material" />
          <Column field="required" header="Required">
            <template #body="{ data }">
              {{ formatNumber(data.required) }} {{ data.unit }}
            </template>
          </Column>
          <Column field="available" header="Available">
            <template #body="{ data }">
              {{ formatNumber(data.available) }} {{ data.unit }}
            </template>
          </Column>
          <Column header="Status">
            <template #body="{ data }">
              <Tag
                :value="data.available >= data.required ? 'Sufficient' : 'Insufficient'"
                :severity="data.available >= data.required ? 'success' : 'danger'"
              />
            </template>
          </Column>
        </DataTable>

        <div class="mt-3 p-3 surface-100 border-round">
          <div
            class="text-lg font-bold"
            :class="materialCheck.canProduce ? 'text-green-600' : 'text-red-600'"
          >
            {{
              materialCheck.canProduce ? '✓ All materials available' : '✗ Insufficient materials'
            }}
          </div>
          <div v-if="!materialCheck.canProduce" class="text-sm text-500 mt-1">
            Please ensure all materials are available before starting production.
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Close" icon="pi pi-times" @click="materialDialog = false" />
      </template>
    </Dialog>

    <!-- Complete Production Dialog -->
    <Dialog
      v-model:visible="completeDialog"
      :style="{ width: '600px' }"
      header="Complete Production Run"
      :modal="true"
    >
      <div v-if="selectedRun">
        <div class="mb-3">
          <h4>{{ selectedRun.run_number }}</h4>
          <p>Recipe: {{ selectedRun.Recipe?.name }}</p>
          <p>Expected Output: {{ formatNumber(selectedRun.quantity) }} {{ selectedRun.unit }}</p>
        </div>

        <Divider />

        <div class="grid">
          <div class="col-12">
            <label for="actual_output" class="block mb-2">
              Actual Output <span class="text-red-500">*</span>
            </label>
            <InputNumber
              id="actual_output"
              v-model="completionData.actual_output"
              class="w-full"
              mode="decimal"
              :min-fraction-digits="2"
              :max-fraction-digits="2"
              :min="0"
            />
          </div>

          <div class="col-12">
            <label for="waste_quantity" class="block mb-2">Waste Quantity</label>
            <InputNumber
              id="waste_quantity"
              v-model="completionData.waste_quantity"
              class="w-full"
              mode="decimal"
              :min-fraction-digits="2"
              :max-fraction-digits="2"
              :min="0"
            />
          </div>

          <div class="col-12">
            <label for="notes" class="block mb-2">Notes</label>
            <Textarea id="notes" v-model="completionData.notes" rows="3" class="w-full" />
          </div>
        </div>

        <div class="mt-3 p-3 surface-100 border-round">
          <p class="text-sm text-500 mb-1">
            <i class="pi pi-info-circle mr-1" />
            Materials will be deducted using FIFO (First In, First Out) method
          </p>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="completeDialog = false" />
        <Button
          label="Complete Production"
          icon="pi pi-check"
          severity="success"
          :loading="loading"
          @click="handleComplete"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { useFilterClear } from '@/composables/useFilterClear';
import { useToastNotification } from '@/composables/useToastNotification';
import { useProductStore } from '@/stores/product';
import { useProductionStore } from '@/stores/production';
import { useRecipeStore } from '@/stores/recipe';
import { formatDate, formatNumber } from '@/utils/formatters';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const productionStore = useProductionStore();
const productStore = useProductStore();
const recipeStore = useRecipeStore();
const toast = useToastNotification();

const loading = ref(false);
const deleteDialog = ref(false);
const materialDialog = ref(false);
const completeDialog = ref(false);
const selectedRun = ref(null);
const materialCheck = ref(null);
const productOptions = ref([]);
const recipeOptions = ref([]);

const filters = reactive({
  search: '',
  status: null,
  product_id: null,
  recipe_id: null,
});

const initialFilters = {
  search: '',
  status: null,
  product_id: null,
  recipe_id: null,
};

const { activeFilterCount, hasActiveFilters, clearAllFilters } = useFilterClear(filters);

const completionData = ref({
  actual_output: 0,
  waste_quantity: 0,
  notes: '',
});

const statusOptions = [
  { label: 'Planned', value: 'planned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

onMounted(async () => {
  await Promise.all([productionStore.fetchProductionRuns(), loadProducts(), loadRecipes()]);
});

const loadProducts = async () => {
  await productStore.fetchProducts();
  productOptions.value = productStore.products.map(p => ({
    label: `${p.product_code} - ${p.name}`,
    value: p.id,
  }));
};

const loadRecipes = async () => {
  await recipeStore.fetchRecipes();
  recipeOptions.value = recipeStore.recipes.map(r => ({
    label: `${r.name} (v${r.version})`,
    value: r.id,
  }));
};

const onSearch = () => {
  productionStore.pagination.page = 1;
  productionStore.fetchProductionRuns();
};

const onFilterChange = () => {
  if (filters.status) {
    productionStore.setStatusFilter(filters.status);
  }
  if (filters.product_id) {
    productionStore.setProductFilter(filters.product_id);
  }
  productionStore.pagination.page = 1;
  productionStore.fetchProductionRuns();
};

const clearProductionFilters = () => {
  clearAllFilters(initialFilters, {
    onClear: () => {
      productionStore.clearFilters();
    },
  });
};

const onPage = event => {
  productionStore.setPagination(event.rows, event.first);
};

const getStatusSeverity = status => {
  const severityMap = {
    planned: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger',
  };
  return severityMap[status] || 'info';
};

const viewRun = id => {
  router.push(`/production-runs/${id}/view`);
};

const editRun = id => {
  router.push(`/production-runs/${id}/edit`);
};

const confirmDelete = run => {
  selectedRun.value = run;
  deleteDialog.value = true;
};

const handleDelete = async () => {
  try {
    await productionStore.deleteProductionRun(selectedRun.value.id);
    toast.success('Production run deleted successfully');
    deleteDialog.value = false;
    selectedRun.value = null;
  } catch (error) {
    toast.error('Failed to delete production run');
  }
};

const checkMaterials = async run => {
  selectedRun.value = run;
  loading.value = true;
  try {
    materialCheck.value = await productionStore.checkMaterialAvailability(run.id);
    materialDialog.value = true;
  } catch (error) {
    toast.error('Failed to check material availability');
  } finally {
    loading.value = false;
  }
};

const completeRun = run => {
  selectedRun.value = run;
  completionData.value = {
    actual_output: run.quantity,
    waste_quantity: 0,
    notes: '',
  };
  completeDialog.value = true;
};

const handleComplete = async () => {
  if (!completionData.value.actual_output) {
    toast.error('Please enter actual output');
    return;
  }

  loading.value = true;
  try {
    await productionStore.completeProductionRun(selectedRun.value.id, completionData.value);
    toast.success('Production run completed successfully');
    completeDialog.value = false;
    selectedRun.value = null;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to complete production run');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.confirmation-content {
  display: flex;
  align-items: center;
}

.font-bold {
  font-weight: 600;
}
</style>

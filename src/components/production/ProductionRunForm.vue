<template>
  <div class="production-run-form">
    <Card>
      <template #title>
        {{ isEditMode ? 'Edit Production Run' : 'Create Production Run' }}
      </template>

      <template #content>
        <form @submit.prevent="handleSubmit">
          <!-- Basic Information -->
          <div class="grid">
            <div class="col-12">
              <h3>Production Information</h3>
              <Divider />
            </div>

            <!-- Run Number -->
            <div class="col-12 md:col-6">
              <label for="run_number" class="block mb-2">Run Number</label>
              <InputText
                id="run_number"
                v-model="formData.run_number"
                class="w-full"
                disabled
                placeholder="Auto-generated"
              />
            </div>

            <!-- Production Date -->
            <div class="col-12 md:col-6">
              <label for="production_date" class="block mb-2">
                Production Date <span class="text-red-500">*</span>
              </label>
              <Calendar
                id="production_date"
                v-model="formData.production_date"
                class="w-full"
                date-format="yy-mm-dd"
                show-icon
                required
              />
            </div>

            <!-- Recipe Selection -->
            <div class="col-12 md:col-6">
              <label for="recipe" class="block mb-2">
                Recipe <span class="text-red-500">*</span>
              </label>
              <Dropdown
                id="recipe"
                v-model="formData.recipe_id"
                :options="recipeOptions"
                option-label="label"
                option-value="value"
                placeholder="Select Recipe"
                class="w-full"
                :class="{ 'p-invalid': errors.recipe_id }"
                filter
                required
                @change="onRecipeChange"
              />
              <small v-if="errors.recipe_id" class="p-error">{{ errors.recipe_id }}</small>
            </div>

            <!-- Quantity -->
            <div class="col-12 md:col-3">
              <label for="quantity" class="block mb-2">
                Quantity <span class="text-red-500">*</span>
              </label>
              <InputNumber
                id="quantity"
                v-model="formData.quantity"
                class="w-full"
                mode="decimal"
                :min-fraction-digits="2"
                :max-fraction-digits="2"
                :min="0"
                required
              />
            </div>

            <!-- Unit -->
            <div class="col-12 md:col-3">
              <label for="unit" class="block mb-2">Unit</label>
              <InputText id="unit" v-model="formData.unit" class="w-full" disabled />
            </div>

            <!-- Status -->
            <div class="col-12 md:col-6">
              <label for="status" class="block mb-2">Status</label>
              <Dropdown
                id="status"
                v-model="formData.status"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                class="w-full"
              />
            </div>

            <!-- Notes -->
            <div class="col-12 md:col-6">
              <label for="notes" class="block mb-2">Notes</label>
              <Textarea
                id="notes"
                v-model="formData.notes"
                rows="3"
                class="w-full"
                placeholder="Enter production notes"
              />
            </div>
          </div>

          <!-- Recipe Details (when recipe selected) -->
          <div v-if="selectedRecipe" class="mt-4">
            <h3>Recipe Details</h3>
            <Divider />

            <div class="grid">
              <div class="col-12 md:col-6">
                <div class="field">
                  <label class="text-500 text-sm">Product</label>
                  <div class="text-lg font-bold">
                    {{ selectedRecipe.Product?.name }}
                  </div>
                </div>
              </div>

              <div class="col-12 md:col-6">
                <div class="field">
                  <label class="text-500 text-sm">SKU</label>
                  <div class="text-lg">
                    {{ selectedRecipe.ProductSku?.variant }}
                  </div>
                </div>
              </div>

              <div class="col-12 md:col-4">
                <div class="field">
                  <label class="text-500 text-sm">Batch Size</label>
                  <div class="text-lg">
                    {{ formatNumber(selectedRecipe.batch_size) }} {{ selectedRecipe.unit }}
                  </div>
                </div>
              </div>

              <div class="col-12 md:col-4">
                <div class="field">
                  <label class="text-500 text-sm">Number of Batches</label>
                  <div class="text-lg font-bold text-primary">
                    {{ numberOfBatches.toFixed(2) }}
                  </div>
                </div>
              </div>

              <div class="col-12 md:col-4">
                <div class="field">
                  <label class="text-500 text-sm">Expected Output</label>
                  <div class="text-lg font-bold">
                    {{ formatNumber(formData.quantity) }} {{ formData.unit }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Required Materials -->
            <div class="mt-3">
              <h4>Required Materials</h4>
              <DataTable :value="requiredMaterials" class="p-datatable-sm">
                <Column field="name" header="Raw Material">
                  <template #body="{ data }">
                    {{ data.RawMaterial?.name }}
                  </template>
                </Column>
                <Column field="quantity_per_batch" header="Per Batch">
                  <template #body="{ data }">
                    {{ formatNumber(data.quantity) }} {{ data.unit }}
                  </template>
                </Column>
                <Column header="Total Required">
                  <template #body="{ data }">
                    {{ formatNumber(data.quantity * numberOfBatches) }} {{ data.unit }}
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex gap-2 mt-4">
            <Button
              type="submit"
              :label="isEditMode ? 'Update Production Run' : 'Create Production Run'"
              icon="pi pi-check"
              :loading="loading"
            />
            <Button
              type="button"
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
              outlined
              @click="handleCancel"
            />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useProductionStore } from '@/stores/production';
import { useRecipeStore } from '@/stores/recipe';
import { formatNumber } from '@/utils/formatters';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  runId: {
    type: [String, Number],
    default: null,
  },
});

const router = useRouter();
const productionStore = useProductionStore();
const recipeStore = useRecipeStore();
const toast = useToastNotification();

const loading = ref(false);
const errors = ref({});
const recipeOptions = ref([]);
const selectedRecipe = ref(null);

const formData = ref({
  run_number: '',
  recipe_id: null,
  quantity: 0,
  unit: '',
  production_date: new Date(),
  status: 'planned',
  notes: '',
});

const statusOptions = [
  { label: 'Planned', value: 'planned' },
  { label: 'In Progress', value: 'in_progress' },
];

const isEditMode = computed(() => !!props.runId);

const numberOfBatches = computed(() => {
  if (!selectedRecipe.value || !formData.value.quantity) return 0;
  return formData.value.quantity / selectedRecipe.value.batch_size;
});

const requiredMaterials = computed(() => {
  return selectedRecipe.value?.items || [];
});

onMounted(async () => {
  await loadRecipes();

  if (isEditMode.value) {
    await loadProductionRun(props.runId);
  }
});

const loadRecipes = async () => {
  await recipeStore.fetchRecipes({ status: 'active' });
  recipeOptions.value = recipeStore.recipes.map(r => ({
    label: `${r.name} (v${r.version}) - ${r.Product?.name}`,
    value: r.id,
  }));
};

const loadProductionRun = async id => {
  loading.value = true;
  try {
    const run = await productionStore.fetchProductionRunById(id);
    formData.value = {
      run_number: run.run_number,
      recipe_id: run.recipe_id,
      quantity: run.quantity,
      unit: run.unit,
      production_date: new Date(run.production_date),
      status: run.status,
      notes: run.notes,
    };
    await onRecipeChange();
  } catch (error) {
    toast.error('Failed to load production run');
  } finally {
    loading.value = false;
  }
};

const onRecipeChange = async () => {
  if (!formData.value.recipe_id) {
    selectedRecipe.value = null;
    formData.value.unit = '';
    return;
  }

  try {
    selectedRecipe.value = await recipeStore.fetchRecipeById(formData.value.recipe_id);
    formData.value.unit = selectedRecipe.value.unit;
  } catch (error) {
    toast.error('Failed to load recipe details');
  }
};

const handleSubmit = async () => {
  errors.value = {};

  if (!formData.value.recipe_id) {
    errors.value.recipe_id = 'Recipe is required';
    return;
  }

  if (!formData.value.quantity || formData.value.quantity <= 0) {
    toast.error('Quantity must be greater than 0');
    return;
  }

  loading.value = true;

  try {
    const submitData = {
      recipe_id: formData.value.recipe_id,
      quantity: formData.value.quantity,
      unit: formData.value.unit,
      production_date: formData.value.production_date,
      status: formData.value.status,
      notes: formData.value.notes,
    };

    if (isEditMode.value) {
      await productionStore.updateProductionRun(props.runId, submitData);
      toast.success('Production run updated successfully');
    } else {
      await productionStore.createProductionRun(submitData);
      toast.success('Production run created successfully');
    }
    router.push('/production-runs');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to save production run');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/production-runs');
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

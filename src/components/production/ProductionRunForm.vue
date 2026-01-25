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

            <!-- Expected Quantity -->
            <div class="col-12 md:col-3">
              <label for="expected_quantity" class="block mb-2">
                Expected Quantity <span class="text-red-500">*</span>
              </label>
              <InputNumber
                id="expected_quantity"
                v-model="formData.expected_quantity"
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
              <label for="expected_unit" class="block mb-2">Unit</label>
              <InputText
                id="expected_unit"
                v-model="formData.expected_unit"
                class="w-full"
                disabled
              />
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
            <Divider class="mb-3" />

            <div class="grid">
              <div class="col-12 md:col-6">
                <div class="field">
                  <label class="text-500 text-sm">Product</label>
                  <div class="text-lg font-bold">
                    {{ selectedRecipe.name }}
                  </div>
                </div>
              </div>

              <div class="col-12 md:col-6">
                <div class="field">
                  <label class="text-500 text-sm">SKU</label>
                  <div class="text-lg">
                    {{ selectedRecipe.productSku?.size }} {{ selectedRecipe.productSku?.unit }}
                  </div>
                </div>
              </div>

              <div class="col-12 md:col-6">
                <div class="field">
                  <label class="text-500 text-sm">Expected Yield</label>
                  <div class="text-lg font-bold text-primary">
                    {{ formatNumber(selectedRecipe.expected_yield) }}
                    {{ selectedRecipe.yield_unit }}
                  </div>
                </div>
              </div>

              <div class="col-12 md:col-6">
                <div class="field">
                  <label class="text-500 text-sm">Recipe Version</label>
                  <div class="text-lg">v{{ selectedRecipe.version }}</div>
                </div>
              </div>
            </div>

            <!-- Required Materials -->
            <div class="mt-3">
              <h4>
                Required Materials
                <span
                  v-if="
                    formData.expected_quantity &&
                    formData.expected_quantity !== selectedRecipe.expected_yield
                  "
                  class="text-primary"
                >
                  (scaled for {{ formatNumber(formData.expected_quantity) }}
                  {{ formData.expected_unit }})
                </span>
                <span v-else class="text-500">(per batch)</span>
              </h4>
              <DataTable :value="requiredMaterials" class="p-datatable-sm">
                <Column field="name" header="Raw Material">
                  <template #body="{ data }">
                    {{ data.material?.name }}
                  </template>
                </Column>
                <Column field="quantity" header="Required Quantity">
                  <template #body="{ data }">
                    {{ formatNumber(data.quantity) }} {{ data.unit }}
                  </template>
                </Column>
              </DataTable>
              <small class="text-500 mt-2 block">
                Note: Material availability will be checked when you complete the production run.
              </small>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex gap-2 mt-4">
            <Button
              type="submit"
              :label="isEditMode ? 'Update Production Run' : 'Create Production Run'"
              icon="pi pi-check"
              class="p-button-success"
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
import { useAuthStore } from '@/stores/auth';
import { useRecipeStore } from '@/stores/recipe';
import { formatNumber } from '@/utils/formatters';
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
  runId: {
    type: [String, Number],
    default: null,
  },
  loading: Boolean,
  initialData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['submit', 'cancel']);

const recipeStore = useRecipeStore();
const authStore = useAuthStore();
const toast = useToastNotification();

const errors = ref({});
const recipeOptions = ref([]);
const selectedRecipe = ref(null);

const formData = ref({
  run_number: '',
  recipe_id: null,
  expected_quantity: 0,
  expected_unit: '',
  production_date: new Date(),
  status: 'planned',
  notes: '',
});

const statusOptions = [
  { label: 'Planned', value: 'planned' },
  { label: 'In Progress', value: 'in_progress' },
];

const isEditMode = computed(() => !!props.runId);

const requiredMaterials = computed(() => {
  if (!selectedRecipe.value?.items) return [];

  // Calculate scale factor based on expected_quantity vs recipe's expected_yield
  const scaleFactor =
    formData.value.expected_quantity && selectedRecipe.value.expected_yield
      ? formData.value.expected_quantity / selectedRecipe.value.expected_yield
      : 1;

  // Scale each material quantity
  return selectedRecipe.value.items.map(item => ({
    ...item,
    quantity: item.quantity * scaleFactor,
  }));
});

onMounted(async () => {
  await loadRecipes();

  if (props.initialData) {
    formData.value = {
      ...formData.value,
      ...props.initialData,
      // Convert numeric strings to numbers for InputNumber components
      expected_quantity: props.initialData.expected_quantity
        ? parseFloat(props.initialData.expected_quantity)
        : formData.value.expected_quantity,
    };
    if (props.initialData.recipe_id) {
      await onRecipeChange();
    }
  }
});

const loadRecipes = async () => {
  await recipeStore.fetchRecipes();
  // Filter only active recipes
  const activeRecipes = recipeStore.recipes.filter(r => r.is_active);
  recipeOptions.value = activeRecipes.map(r => ({
    label: `${r.name} (v${r.version}) - ${r.product?.name}`,
    value: r.id,
  }));
};

const onRecipeChange = async () => {
  if (!formData.value.recipe_id) {
    selectedRecipe.value = null;
    formData.value.expected_unit = '';
    return;
  }

  try {
    selectedRecipe.value = await recipeStore.fetchRecipeById(formData.value.recipe_id);
    formData.value.expected_unit = selectedRecipe.value.yield_unit;
    // Set default expected quantity to recipe's expected yield
    if (!formData.value.expected_quantity) {
      formData.value.expected_quantity = parseFloat(selectedRecipe.value.expected_yield) || 0;
    }
  } catch (error) {
    toast.error('Failed to load recipe details');
  }
};

const handleSubmit = () => {
  errors.value = {};

  if (!formData.value.recipe_id) {
    errors.value.recipe_id = 'Recipe is required';
    return;
  }

  if (!formData.value.expected_quantity || formData.value.expected_quantity <= 0) {
    toast.error('Expected quantity must be greater than 0');
    return;
  }

  if (!authStore.user?.id) {
    toast.error('User not authenticated');
    return;
  }

  // Emit submit event with correct backend format
  const submitData = {
    recipe_id: formData.value.recipe_id,
    production_date: formData.value.production_date,
    expected_quantity: formData.value.expected_quantity,
    batch_number: null, // Backend will auto-generate
    produced_by: authStore.user.id,
    notes: formData.value.notes,
    status: formData.value.status,
  };

  emit('submit', submitData);
};

const handleCancel = () => {
  emit('cancel');
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

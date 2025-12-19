<template>
  <div class="recipe-form">
    <Card>
      <template #title>
        {{ isEditMode ? 'Edit Recipe (New Version)' : 'Create Recipe' }}
      </template>

      <template #content>
        <form @submit.prevent="handleSubmit">
          <!-- Basic Information -->
          <div class="grid">
            <div class="col-12">
              <h3>Basic Information</h3>
              <Divider />
            </div>

            <!-- Product Selection -->
            <div class="col-12 md:col-6">
              <label for="product" class="block mb-2">
                Product <span class="text-red-500">*</span>
              </label>
              <Dropdown
                id="product"
                v-model="formData.product_id"
                :options="productOptions"
                option-label="label"
                option-value="value"
                placeholder="Select Product"
                class="w-full"
                :class="{ 'p-invalid': errors.product_id }"
                :disabled="isEditMode"
                required
                @change="onProductChange"
              />
              <small v-if="errors.product_id" class="p-error">{{ errors.product_id }}</small>
            </div>

            <!-- SKU Selection -->
            <div class="col-12 md:col-6">
              <label for="sku" class="block mb-2"> SKU <span class="text-red-500">*</span> </label>
              <Dropdown
                id="sku"
                v-model="formData.product_sku_id"
                :options="skuOptions"
                option-label="label"
                option-value="value"
                placeholder="Select SKU"
                class="w-full"
                :class="{ 'p-invalid': errors.product_sku_id }"
                :disabled="!formData.product_id || isEditMode"
                required
              />
              <small v-if="errors.product_sku_id" class="p-error">{{
                errors.product_sku_id
              }}</small>
            </div>

            <!-- Recipe Name -->
            <div class="col-12 md:col-6">
              <label for="name" class="block mb-2">
                Recipe Name <span class="text-red-500">*</span>
              </label>
              <InputText
                id="name"
                v-model="formData.name"
                class="w-full"
                :class="{ 'p-invalid': errors.name }"
                placeholder="Enter recipe name"
                required
              />
              <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
            </div>

            <!-- Batch Size -->
            <div class="col-12 md:col-3">
              <label for="batch_size" class="block mb-2">
                Batch Size <span class="text-red-500">*</span>
              </label>
              <InputNumber
                id="batch_size"
                v-model="formData.batch_size"
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
              <label for="unit" class="block mb-2">
                Unit <span class="text-red-500">*</span>
              </label>
              <Dropdown
                id="unit"
                v-model="formData.unit"
                :options="unitOptions"
                placeholder="Select Unit"
                class="w-full"
                required
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

            <!-- Description -->
            <div class="col-12 md:col-6">
              <label for="description" class="block mb-2">Description</label>
              <Textarea
                id="description"
                v-model="formData.description"
                rows="3"
                class="w-full"
                placeholder="Enter recipe description"
              />
            </div>
          </div>

          <!-- BOM (Bill of Materials) -->
          <div class="mt-4">
            <div class="flex justify-content-between align-items-center mb-3">
              <h3>Bill of Materials (BOM)</h3>
              <Button
                label="Add Material"
                icon="pi pi-plus"
                size="small"
                type="button"
                @click="showBomDialog = true"
              />
            </div>
            <Divider />

            <DataTable :value="formData.items" striped-rows class="p-datatable-sm">
              <template #empty>
                <div class="text-center p-4">No materials added yet</div>
              </template>

              <Column header="Raw Material">
                <template #body="{ data, index }">
                  {{ getRawMaterialName(data.raw_material_id) }}
                </template>
              </Column>

              <Column field="quantity" header="Quantity">
                <template #body="{ data }">
                  {{ formatNumber(data.quantity) }} {{ data.unit }}
                </template>
              </Column>

              <Column header="Est. Cost">
                <template #body="{ data }">
                  Rs. {{ calculateItemCost(data.raw_material_id, data.quantity) }}
                </template>
              </Column>

              <Column header="Actions">
                <template #body="{ data, index }">
                  <div class="flex gap-2">
                    <Button
                      icon="pi pi-pencil"
                      size="small"
                      outlined
                      type="button"
                      @click="editBomItem(index)"
                    />
                    <Button
                      icon="pi pi-trash"
                      severity="danger"
                      size="small"
                      outlined
                      type="button"
                      @click="deleteBomItem(index)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>

            <!-- Total Cost Summary -->
            <div v-if="formData.items.length > 0" class="mt-3 p-3 surface-100 border-round">
              <div class="grid">
                <div class="col-12 md:col-4">
                  <div class="text-500 text-sm mb-1">Total Cost</div>
                  <div class="text-xl font-bold text-primary">Rs. {{ totalCost.toFixed(2) }}</div>
                </div>
                <div class="col-12 md:col-4">
                  <div class="text-500 text-sm mb-1">Cost per Unit</div>
                  <div class="text-xl font-bold">Rs. {{ costPerUnit.toFixed(2) }}</div>
                </div>
                <div class="col-12 md:col-4">
                  <div class="text-500 text-sm mb-1">Total Items</div>
                  <div class="text-xl font-bold">
                    {{ formData.items.length }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex gap-2 mt-4">
            <Button
              type="submit"
              :label="isEditMode ? 'Create New Version' : 'Create Recipe'"
              icon="pi pi-check"
              :loading="loading"
              :disabled="formData.items.length === 0"
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

    <!-- BOM Item Dialog -->
    <Dialog
      v-model:visible="showBomDialog"
      :style="{ width: '500px' }"
      :header="bomEditIndex !== null ? 'Edit Material' : 'Add Material'"
      :modal="true"
    >
      <div class="grid">
        <div class="col-12">
          <label for="raw_material" class="block mb-2">
            Raw Material <span class="text-red-500">*</span>
          </label>
          <Dropdown
            id="raw_material"
            v-model="bomFormData.raw_material_id"
            :options="rawMaterialOptions"
            option-label="label"
            option-value="value"
            placeholder="Select Raw Material"
            class="w-full"
            filter
            required
          />
        </div>

        <div class="col-12 md:col-6">
          <label for="quantity" class="block mb-2">
            Quantity <span class="text-red-500">*</span>
          </label>
          <InputNumber
            id="quantity"
            v-model="bomFormData.quantity"
            class="w-full"
            mode="decimal"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            :min="0"
            required
          />
        </div>

        <div class="col-12 md:col-6">
          <label for="bom_unit" class="block mb-2">
            Unit <span class="text-red-500">*</span>
          </label>
          <Dropdown
            id="bom_unit"
            v-model="bomFormData.unit"
            :options="unitOptions"
            placeholder="Select Unit"
            class="w-full"
            required
          />
        </div>

        <div v-if="bomFormData.raw_material_id" class="col-12">
          <div class="p-3 surface-100 border-round">
            <div class="text-sm text-500 mb-1">Estimated Cost</div>
            <div class="text-lg font-bold">
              Rs. {{ calculateItemCost(bomFormData.raw_material_id, bomFormData.quantity) }}
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="closeBomDialog" />
        <Button
          :label="bomEditIndex !== null ? 'Update' : 'Add'"
          icon="pi pi-check"
          @click="saveBomItem"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useProductStore } from '@/stores/product';
import { useRawMaterialStore } from '@/stores/rawMaterial';
import { useRecipeStore } from '@/stores/recipe';
import { formatNumber } from '@/utils/formatters';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  recipeId: {
    type: [String, Number],
    default: null,
  },
});

const router = useRouter();
const recipeStore = useRecipeStore();
const productStore = useProductStore();
const rawMaterialStore = useRawMaterialStore();
const toast = useToastNotification();

const loading = ref(false);
const errors = ref({});
const showBomDialog = ref(false);
const bomEditIndex = ref(null);
const productOptions = ref([]);
const skuOptions = ref([]);
const rawMaterialOptions = ref([]);

const formData = ref({
  product_id: null,
  product_sku_id: null,
  name: '',
  description: '',
  batch_size: 0,
  unit: 'kg',
  status: 'active',
  items: [],
});

const bomFormData = ref({
  raw_material_id: null,
  quantity: 0,
  unit: 'kg',
});

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const unitOptions = ['kg', 'g', 'L', 'mL', 'pcs', 'box'];

const isEditMode = computed(() => !!props.recipeId);

const totalCost = computed(() => {
  return formData.value.items.reduce((sum, item) => {
    const material = rawMaterialStore.rawMaterials.find(rm => rm.id === item.raw_material_id);
    const cost = parseFloat(material?.average_cost || 0) * parseFloat(item.quantity || 0);
    return sum + cost;
  }, 0);
});

const costPerUnit = computed(() => {
  if (formData.value.batch_size === 0) return 0;
  return totalCost.value / formData.value.batch_size;
});

onMounted(async () => {
  await Promise.all([loadProducts(), loadRawMaterials()]);

  if (isEditMode.value) {
    await loadRecipe(props.recipeId);
  }
});

const loadProducts = async () => {
  await productStore.fetchProducts();
  productOptions.value = productStore.products.map(p => ({
    label: `${p.product_code} - ${p.name}`,
    value: p.id,
  }));
};

const loadRawMaterials = async () => {
  await rawMaterialStore.fetchRawMaterials();
  rawMaterialOptions.value = rawMaterialStore.rawMaterials.map(rm => ({
    label: `${rm.code} - ${rm.name}`,
    value: rm.id,
  }));
};

const loadRecipe = async id => {
  loading.value = true;
  try {
    const recipe = await recipeStore.fetchRecipeById(id);
    formData.value = {
      product_id: recipe.product_id,
      product_sku_id: recipe.product_sku_id,
      name: recipe.name,
      description: recipe.description,
      batch_size: recipe.batch_size,
      unit: recipe.unit,
      status: 'active', // New version is always active
      items:
        recipe.items?.map(item => ({
          raw_material_id: item.raw_material_id,
          quantity: item.quantity,
          unit: item.unit,
        })) || [],
    };
    await onProductChange();
  } catch (error) {
    toast.error('Failed to load recipe');
  } finally {
    loading.value = false;
  }
};

const onProductChange = async () => {
  if (!formData.value.product_id) {
    skuOptions.value = [];
    return;
  }

  const product = await productStore.fetchProductById(formData.value.product_id);
  skuOptions.value =
    product.skus?.map(sku => ({
      label: `${sku.sku_code} - ${sku.variant}`,
      value: sku.id,
    })) || [];
};

const getRawMaterialName = id => {
  const material = rawMaterialStore.rawMaterials.find(rm => rm.id === id);
  return material ? `${material.code} - ${material.name}` : 'Unknown';
};

const calculateItemCost = (materialId, quantity) => {
  const material = rawMaterialStore.rawMaterials.find(rm => rm.id === materialId);
  if (!material || !quantity) return '0.00';
  const cost = parseFloat(material.average_cost || 0) * parseFloat(quantity || 0);
  return cost.toFixed(2);
};

const editBomItem = index => {
  bomEditIndex.value = index;
  const item = formData.value.items[index];
  bomFormData.value = {
    raw_material_id: item.raw_material_id,
    quantity: item.quantity,
    unit: item.unit,
  };
  showBomDialog.value = true;
};

const deleteBomItem = index => {
  formData.value.items.splice(index, 1);
};

const closeBomDialog = () => {
  showBomDialog.value = false;
  bomEditIndex.value = null;
  bomFormData.value = {
    raw_material_id: null,
    quantity: 0,
    unit: 'kg',
  };
};

const saveBomItem = () => {
  if (!bomFormData.value.raw_material_id || !bomFormData.value.quantity) {
    toast.error('Please fill all required fields');
    return;
  }

  if (bomEditIndex.value !== null) {
    formData.value.items[bomEditIndex.value] = { ...bomFormData.value };
  } else {
    formData.value.items.push({ ...bomFormData.value });
  }

  closeBomDialog();
};

const handleSubmit = async () => {
  errors.value = {};

  if (!formData.value.product_id) {
    errors.value.product_id = 'Product is required';
    return;
  }

  if (!formData.value.product_sku_id) {
    errors.value.product_sku_id = 'SKU is required';
    return;
  }

  if (!formData.value.name) {
    errors.value.name = 'Recipe name is required';
    return;
  }

  if (formData.value.items.length === 0) {
    toast.error('Please add at least one material to the recipe');
    return;
  }

  loading.value = true;

  try {
    if (isEditMode.value) {
      await recipeStore.updateRecipe(props.recipeId, formData.value);
      toast.success('Recipe updated successfully (new version created)');
    } else {
      await recipeStore.createRecipe(formData.value);
      toast.success('Recipe created successfully');
    }
    router.push('/recipes');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to save recipe');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/recipes');
};
</script>

<style scoped>
.font-bold {
  font-weight: 600;
}
</style>

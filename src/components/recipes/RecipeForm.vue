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
              <AutoComplete
                id="product"
                v-model="selectedProduct"
                :suggestions="filteredProducts"
                field="label"
                option-label="label"
                placeholder="Search and select product"
                class="w-full"
                :class="{ 'p-invalid': errors.product_id }"
                :disabled="isEditMode"
                required
                @complete="onSearchProducts"
                @item-select="onProductSelect"
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
                :disabled="isEditMode"
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
              <label for="expected_yield" class="block mb-2">
                Expected Yield <span class="text-red-500">*</span>
              </label>
              <InputNumber
                id="expected_yield"
                v-model="formData.expected_yield"
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
              <label for="yield_unit" class="block mb-2">
                Unit <span class="text-red-500">*</span>
              </label>
              <Dropdown
                id="yield_unit"
                v-model="formData.yield_unit"
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
                      class="p-button-rounded p-button-text"
                      type="button"
                      @click="editBomItem(index)"
                    />
                    <Button
                      icon="pi pi-trash"
                      severity="danger"
                      size="small"
                      class="p-button-rounded p-button-text"
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
      <div class="grid justify-content-between">
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

        <div class="col-12 md:col-4">
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

        <div class="col-12 md:col-4">
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
            <div class="text-lg font-bold">Rs. {{ bomItemCost }}</div>
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
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  recipeId: {
    type: [String, Number],
    default: null,
  },
  loading: Boolean,
  duplicateData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['submit', 'cancel']);

const router = useRouter();
const recipeStore = useRecipeStore();
const productStore = useProductStore();
const rawMaterialStore = useRawMaterialStore();
const { showError, showSuccess } = useToastNotification();

const loading = ref(false);
const errors = ref({});
const showBomDialog = ref(false);
const bomEditIndex = ref(null);
const productOptions = ref([]);
const filteredProducts = ref([]);
const selectedProduct = ref(null);
const skuOptions = ref([]);
const rawMaterialOptions = ref([]);

const formData = ref({
  product_id: null,
  product_sku_id: null,
  name: '',
  description: '',
  expected_yield: 0,
  yield_unit: 'kg',
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
  const yieldAmount = parseFloat(formData.value.expected_yield || 0);
  if (yieldAmount === 0 || isNaN(yieldAmount)) return 0;
  const result = totalCost.value / yieldAmount;
  return isNaN(result) ? 0 : result;
});

// Computed property for BOM dialog - shows estimated cost reactively
const bomItemCost = computed(() => {
  if (!bomFormData.value.raw_material_id || !bomFormData.value.quantity) {
    return '0.00';
  }
  const material = rawMaterialStore.rawMaterials.find(
    rm => rm.id === bomFormData.value.raw_material_id
  );
  if (!material) return '0.00';
  const cost = parseFloat(material.average_cost || 0) * parseFloat(bomFormData.value.quantity || 0);
  return cost.toFixed(2);
});

onMounted(async () => {
  await Promise.all([loadProducts(), loadRawMaterials()]);
  console.log('asssssssssss', formData.value, isEditMode.value);

  if (isEditMode.value) {
    await loadRecipe(props.recipeId);
    initializeSelectedProduct();
  } else if (props.duplicateData) {
    // Pre-fill form with duplicate data
    formData.value = {
      product_id: props.duplicateData.product_id,
      product_sku_id: props.duplicateData.product_sku_id,
      name: props.duplicateData.name,
      description: props.duplicateData.description,
      expected_yield: parseFloat(props.duplicateData.expected_yield) || 0,
      yield_unit: props.duplicateData.yield_unit,
      status: props.duplicateData.status || 'active',
      items: props.duplicateData.items || [],
    };
    initializeSelectedProduct();
  }
});

const loadProducts = async () => {
  const allProducts = await productStore.fetchAllProducts();
  productOptions.value = allProducts.map(p => ({
    label: `${p.code} - ${p.name}`,
    value: p.id,
  }));
  filteredProducts.value = productOptions.value;
};

const initializeSelectedProduct = () => {
  if (formData.value.product_id) {
    const product = productOptions.value.find(p => p.value === formData.value.product_id);
    if (product) {
      selectedProduct.value = product;
    }
  }
};

const onSearchProducts = event => {
  const query = event.query.toLowerCase();
  if (!query) {
    filteredProducts.value = productOptions.value;
  } else {
    filteredProducts.value = productOptions.value.filter(product =>
      product.label.toLowerCase().includes(query)
    );
  }
};

const onProductSelect = async event => {
  // event.value contains the selected product object
  if (event.value) {
    selectedProduct.value = event.value;
    formData.value.product_id = event.value.value;
  }
  await onProductChange();
};

const loadRawMaterials = async () => {
  await rawMaterialStore.fetchRawMaterials({ limit: 1000 });
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
      expected_yield: parseFloat(recipe.expected_yield) || 0,
      yield_unit: recipe.yield_unit,
      status: 'active', // New version is always active
      items:
        recipe.items?.map(item => ({
          raw_material_id: item.material_id,
          quantity: parseFloat(item.quantity) || 0,
          unit: item.unit,
        })) || [],
    };
    await onProductChange();
  } catch (error) {
    showError('Failed to load recipe');
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
      label: `sku: ${sku.size} ${sku.unit} - Rs.${sku.price}`,
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
    showError('Please fill all required fields');
    return;
  }

  if (bomEditIndex.value !== null) {
    formData.value.items[bomEditIndex.value] = { ...bomFormData.value };
  } else {
    formData.value.items.push({ ...bomFormData.value });
  }

  closeBomDialog();
};

const handleSubmit = () => {
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
    showError('Please add at least one material to the recipe');
    return;
  }

  // Emit submit event with transformed data to parent
  // Transform items to use material_id instead of raw_material_id
  const submitData = {
    ...formData.value,
    items: formData.value.items.map(item => ({
      material_id: item.raw_material_id, // Map raw_material_id to material_id
      quantity: item.quantity,
      unit: item.unit,
    })),
  };

  emit('submit', submitData);
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.font-bold {
  font-weight: 600;
}
</style>
